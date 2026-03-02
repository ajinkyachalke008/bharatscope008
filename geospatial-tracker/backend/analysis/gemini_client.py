import google.generativeai as genai
import json
import base64
import asyncio
import logging
import re
import time
from typing import Optional
from config import config
from models.schemas import Detection

logger = logging.getLogger(__name__)

# Configure Gemini SDK
if config.GEMINI_API_KEY:
    genai.configure(api_key=config.GEMINI_API_KEY)
else:
    logger.critical("GEMINI_API_KEY not configured — vision analysis disabled")


TRAFFIC_CAM_SYSTEM_PROMPT = """You are an advanced geospatial analyst integrated into the ANTIGRAVITY intelligence platform. Analyze the provided traffic camera image and detect ALL visible objects.

PRIMARY CATEGORIES:
- vehicles: Cars, trucks, buses, motorcycles, vans, SUVs, emergency vehicles
- aircraft: Planes, helicopters (if visible)
- pedestrians: People walking, cycling, standing
- infrastructure: Bridges, overpasses, intersections, traffic signals

For EACH detected object return:
1. category (string): One of the categories above
2. subcategory (string): More specific type (e.g., "sedan", "pickup_truck", "ambulance")
3. estimated_lat (float): Estimated real-world latitude using camera metadata
4. estimated_lon (float): Estimated real-world longitude using camera metadata
5. confidence (float): 0.0 to 1.0
6. bounding_box (array): [x1, y1, x2, y2] in pixel coordinates
7. attributes (object): color, direction, estimated_speed, distance_from_camera, notable

COORDINATE ESTIMATION RULES:
- Near objects (bottom of frame): ~10-50m, offset ≈ 0.0001-0.0005°
- Mid objects (center of frame): ~50-200m, offset ≈ 0.0005-0.002°
- Far objects (top of frame): ~200-500m, offset ≈ 0.002-0.005°

Return ONLY valid JSON array. No markdown. No code blocks. No explanation."""


SATELLITE_ANALYSIS_PROMPT = """Analyze the satellite image and detect visible features: military installations, vessels, aircraft, vehicles, infrastructure, damage, construction. For each detection return category, estimated_lat, estimated_lon, confidence, attributes. Return ONLY valid JSON array."""


class GeminiVisionClient:
    """Wrapper around Google's Gemini Vision API for panoptic detection."""

    def __init__(self):
        self.model_name = config.GEMINI_MODEL
        self.model = None
        self.requests_this_minute: int = 0
        self.requests_today: int = 0
        self.minute_start: float = time.time()
        self.day_start: float = time.time()
        self.total_detections: int = 0
        self.total_errors: int = 0
        self.is_available: bool = bool(config.GEMINI_API_KEY)

        if self.is_available:
            try:
                self.model = genai.GenerativeModel(self.model_name)
                logger.info(f"Gemini Vision: Initialized with model {self.model_name}")
            except Exception as e:
                logger.error(f"Gemini Vision: Failed to initialize: {e}")
                self.is_available = False

    async def _check_rate_limit(self) -> bool:
        now = time.time()
        if now - self.minute_start > 60:
            self.requests_this_minute = 0
            self.minute_start = now
        if now - self.day_start > 86400:
            self.requests_today = 0
            self.day_start = now

        if self.requests_this_minute >= config.GEMINI_MAX_REQUESTS_PER_MIN:
            wait_time = 60 - (now - self.minute_start)
            logger.warning(f"Gemini: Rate limited. Waiting {wait_time:.0f}s")
            await asyncio.sleep(wait_time)
            self.requests_this_minute = 0
            self.minute_start = time.time()

        if self.requests_today >= 1500:
            logger.error("Gemini: Daily quota exhausted")
            return False
        return True

    def _parse_gemini_response(self, response_text: str) -> list[dict]:
        text = response_text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        try:
            parsed = json.loads(text)
            if isinstance(parsed, list):
                return parsed
            if isinstance(parsed, dict):
                for key in ("detections", "objects", "results"):
                    if key in parsed:
                        return parsed[key]
                if "category" in parsed:
                    return [parsed]
            return []
        except json.JSONDecodeError:
            array_match = re.search(r'\[[\s\S]*\]', text)
            if array_match:
                try:
                    return json.loads(array_match.group())
                except json.JSONDecodeError:
                    pass
            logger.error(f"Gemini: Could not parse response. First 200 chars: {text[:200]}")
            return []

    def _validate_detections(
        self, raw_detections: list[dict], camera_lat: float, camera_lon: float,
        max_distance_deg: float = 0.01
    ) -> list[Detection]:
        validated: list[Detection] = []

        for raw in raw_detections:
            try:
                if "category" not in raw:
                    continue

                est_lat = raw.get("estimated_lat", camera_lat)
                est_lon = raw.get("estimated_lon", camera_lon)

                if not (-90 <= est_lat <= 90 and -180 <= est_lon <= 180):
                    continue
                if (abs(est_lat - camera_lat) > max_distance_deg or
                        abs(est_lon - camera_lon) > max_distance_deg):
                    continue

                confidence = float(raw.get("confidence", 0.5))
                if confidence < config.MIN_DETECTION_CONFIDENCE:
                    continue

                detection = Detection(
                    category=raw["category"],
                    subcategory=raw.get("subcategory", ""),
                    estimated_lat=est_lat,
                    estimated_lon=est_lon,
                    confidence=min(1.0, max(0.0, confidence)),
                    bounding_box=raw.get("bounding_box"),
                    attributes=raw.get("attributes", {}),
                )
                validated.append(detection)

            except (ValueError, TypeError, KeyError):
                continue

        return validated

    async def analyze_traffic_frame(
        self, image_bytes: bytes, camera_lat: float, camera_lon: float,
        camera_heading: float = 0.0, fov_degrees: float = 90.0,
        camera_description: str = "",
    ) -> list[Detection]:
        if not self.is_available or not await self._check_rate_limit():
            return []

        try:
            context = (
                f"Camera metadata:\n"
                f"- Position: ({camera_lat:.6f}, {camera_lon:.6f})\n"
                f"- Heading: {camera_heading:.1f}° from North\n"
                f"- FOV: {fov_degrees:.1f}°\n"
                f"- Location: {camera_description}"
            )

            image_b64 = base64.b64encode(image_bytes).decode("utf-8")

            response = self.model.generate_content(
                contents=[
                    TRAFFIC_CAM_SYSTEM_PROMPT, context,
                    {"mime_type": "image/jpeg", "data": image_b64},
                ],
                generation_config={
                    "response_mime_type": "application/json",
                    "temperature": 0.1,
                    "max_output_tokens": 4096,
                },
            )

            self.requests_this_minute += 1
            self.requests_today += 1

            raw_detections = self._parse_gemini_response(response.text)
            validated = self._validate_detections(raw_detections, camera_lat, camera_lon)
            self.total_detections += len(validated)

            logger.info(f"Gemini: Analyzed frame → {len(validated)} detections")
            return validated

        except Exception as e:
            self.total_errors += 1
            logger.error(f"Gemini: Analysis failed: {type(e).__name__}: {e}")
            return []

    async def analyze_satellite_tile(
        self, image_bytes: bytes, bbox: list[float], analysis_type: str = "general"
    ) -> list[Detection]:
        if not self.is_available or not await self._check_rate_limit():
            return []

        try:
            center_lat = (bbox[1] + bbox[3]) / 2
            center_lon = (bbox[0] + bbox[2]) / 2

            context = f"Bounding box: {bbox}, Center: ({center_lat:.6f}, {center_lon:.6f}), Focus: {analysis_type}"

            image_b64 = base64.b64encode(image_bytes).decode("utf-8")
            response = self.model.generate_content(
                contents=[
                    SATELLITE_ANALYSIS_PROMPT, context,
                    {"mime_type": "image/jpeg", "data": image_b64},
                ],
                generation_config={
                    "response_mime_type": "application/json",
                    "temperature": 0.1,
                    "max_output_tokens": 4096,
                },
            )

            self.requests_this_minute += 1
            self.requests_today += 1

            raw_detections = self._parse_gemini_response(response.text)
            validated = self._validate_detections(
                raw_detections, center_lat, center_lon,
                max_distance_deg=max(abs(bbox[2] - bbox[0]), abs(bbox[3] - bbox[1]))
            )
            logger.info(f"Gemini: Satellite analysis → {len(validated)} detections")
            return validated

        except Exception as e:
            self.total_errors += 1
            logger.error(f"Gemini: Satellite analysis failed: {e}")
            return []

    def get_status(self) -> dict:
        return {
            "source": "Gemini Vision", "model": self.model_name,
            "status": "ACTIVE" if self.is_available else "OFFLINE",
            "requests_this_minute": self.requests_this_minute,
            "requests_today": self.requests_today,
            "total_detections": self.total_detections,
            "total_errors": self.total_errors,
        }


gemini_client = GeminiVisionClient()
