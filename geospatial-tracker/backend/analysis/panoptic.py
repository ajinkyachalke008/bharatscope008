"""
PANOPTIC DETECTION ORCHESTRATOR — The central brain.
Runs the 4-stage detection cycle: Aircraft → Cameras → Satellite → Anomaly → GeoJSON.
"""

import asyncio
import logging
import time
from datetime import datetime, timezone
from typing import Optional

from ingestion.opensky import opensky_ingester
from ingestion.traffic_cams import camera_ingester, CapturedFrame
from ingestion.satellite import satellite_ingester
from analysis.gemini_client import gemini_client
from analysis.anomaly_detector import AnomalyDetector
from models.schemas import AircraftPosition, Detection
from config import config

logger = logging.getLogger(__name__)


class PanopticOrchestrator:
    """Coordinates all data sources, AI analysis, and output formatting."""

    def __init__(self):
        self.cycle_count: int = 0
        self.total_features_generated: int = 0
        self.last_cycle_time: Optional[str] = None
        self.last_cycle_duration_ms: float = 0
        self.last_aircraft_count: int = 0
        self.last_detection_count: int = 0
        self.anomaly_detector = AnomalyDetector()
        self.is_running: bool = False

    async def run_detection_cycle(self) -> dict:
        cycle_start = time.time()
        self.cycle_count += 1
        features: list[dict] = []
        cycle_metadata = {
            "cycle": self.cycle_count,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "sources": {},
        }

        logger.info(f"═══ Detection Cycle #{self.cycle_count} START ═══")

        # STAGE 1: AIRCRAFT
        if config.ENABLE_AIRCRAFT_TRACKING:
            try:
                aircraft_list = await opensky_ingester.fetch_aircraft()
                for ac in aircraft_list:
                    if ac.latitude is not None and ac.longitude is not None:
                        features.append(self._aircraft_to_geojson(ac))

                self.last_aircraft_count = len(aircraft_list)
                cycle_metadata["sources"]["opensky"] = {
                    "status": "OK", "count": len(aircraft_list),
                    "military": sum(1 for a in aircraft_list if a.is_military),
                }
                logger.info(f"  Stage 1 (Aircraft): {len(aircraft_list)} aircraft")
            except Exception as e:
                logger.error(f"  Stage 1 (Aircraft): FAILED — {e}")
                cycle_metadata["sources"]["opensky"] = {"status": "ERROR", "error": str(e)}

        # STAGE 2: TRAFFIC CAMERAS + GEMINI
        if config.ENABLE_CAMERA_ANALYSIS and config.ENABLE_GEMINI_VISION:
            try:
                frames = await camera_ingester.capture_all_frames(max_cameras=config.MAX_CAMERAS_PER_CYCLE)
                detection_tasks = [self._analyze_camera_frame(frame) for frame in frames]
                frame_results = await asyncio.gather(*detection_tasks, return_exceptions=True)

                total_cam_detections = 0
                for frame, result in zip(frames, frame_results):
                    if isinstance(result, list):
                        for detection in result:
                            features.append(self._detection_to_geojson(detection, f"camera:{frame.camera_id}"))
                            total_cam_detections += 1

                self.last_detection_count = total_cam_detections
                cycle_metadata["sources"]["cameras"] = {
                    "status": "OK", "frames_captured": len(frames), "detections": total_cam_detections,
                }
                logger.info(f"  Stage 2 (Cameras): {len(frames)} frames → {total_cam_detections} detections")
            except Exception as e:
                logger.error(f"  Stage 2 (Cameras): FAILED — {e}")
                cycle_metadata["sources"]["cameras"] = {"status": "ERROR", "error": str(e)}

        # STAGE 3: SATELLITE (optional, periodic)
        if config.ENABLE_SATELLITE:
            try:
                cycles_per_sat = max(1, config.SATELLITE_POLL_INTERVAL // config.BROADCAST_INTERVAL)
                if self.cycle_count % cycles_per_sat == 0:
                    bbox = [config.DEFAULT_BBOX["lomin"], config.DEFAULT_BBOX["lamin"],
                            config.DEFAULT_BBOX["lomax"], config.DEFAULT_BBOX["lamax"]]
                    sat_tile = await satellite_ingester.fetch_tile_wms(bbox)
                    if sat_tile and config.ENABLE_GEMINI_VISION:
                        sat_detections = await gemini_client.analyze_satellite_tile(sat_tile, bbox)
                        for det in sat_detections:
                            features.append(self._detection_to_geojson(det, "satellite:sentinel-2"))
                        cycle_metadata["sources"]["satellite"] = {"status": "OK", "detections": len(sat_detections)}
            except Exception as e:
                logger.error(f"  Stage 3 (Satellite): FAILED — {e}")

        # STAGE 4: ANOMALY DETECTION
        if config.ENABLE_ANOMALY_DETECTION:
            try:
                anomalies = self.anomaly_detector.analyze(features)
                for anomaly in anomalies:
                    for feature in features:
                        if feature.get("properties", {}).get("id") == anomaly.get("entity_id"):
                            feature["properties"]["anomaly"] = anomaly
                            feature["properties"]["alert_level"] = anomaly.get("severity", "LOW")
                cycle_metadata["anomalies"] = len(anomalies)
            except Exception as e:
                logger.error(f"  Stage 4 (Anomaly): FAILED — {e}")

        # ASSEMBLE GEOJSON
        cycle_duration = (time.time() - cycle_start) * 1000
        self.last_cycle_duration_ms = cycle_duration
        self.last_cycle_time = cycle_metadata["timestamp"]
        self.total_features_generated += len(features)

        geojson = {
            "type": "FeatureCollection",
            "features": features,
            "metadata": {
                **cycle_metadata,
                "total_features": len(features),
                "cycle_duration_ms": round(cycle_duration, 1),
                "system_status": self._get_system_status(),
            },
        }

        logger.info(f"═══ Cycle #{self.cycle_count} COMPLETE: {len(features)} features in {cycle_duration:.0f}ms ═══")
        return geojson

    async def _analyze_camera_frame(self, frame: CapturedFrame) -> list[Detection]:
        await asyncio.sleep(0.5)
        return await gemini_client.analyze_traffic_frame(
            image_bytes=frame.image_bytes,
            camera_lat=frame.lat, camera_lon=frame.lon,
            camera_heading=frame.heading, fov_degrees=frame.fov,
            camera_description=frame.description,
        )

    def _aircraft_to_geojson(self, ac: AircraftPosition) -> dict:
        return {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [ac.longitude, ac.latitude, ac.altitude or 0]},
            "properties": {
                "id": f"aircraft:{ac.icao24}", "category": "aircraft",
                "subcategory": ac.classification.lower() if ac.classification else "civilian",
                "callsign": ac.callsign, "icao24": ac.icao24,
                "origin_country": ac.origin_country,
                "altitude": ac.altitude,
                "altitude_feet": round(ac.altitude * 3.28084) if ac.altitude else None,
                "velocity": ac.velocity,
                "velocity_knots": round(ac.velocity * 1.94384) if ac.velocity else None,
                "heading": ac.heading, "vertical_rate": ac.vertical_rate,
                "on_ground": ac.on_ground, "squawk": ac.squawk,
                "classification": ac.classification, "is_military": ac.is_military,
                "emergency": getattr(ac, "emergency", None),
                "alert_level": getattr(ac, "alert_level", "NONE"),
                "anomalies": getattr(ac, "anomalies", []),
                "source": "opensky", "last_contact": ac.last_contact,
            },
        }

    def _detection_to_geojson(self, detection: Detection, source: str) -> dict:
        return {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [detection.estimated_lon, detection.estimated_lat]},
            "properties": {
                "id": f"detection:{source}:{id(detection)}", "category": detection.category,
                "subcategory": getattr(detection, "subcategory", ""),
                "confidence": detection.confidence, "bounding_box": detection.bounding_box,
                "attributes": detection.attributes, "source": source,
                "source_model": config.GEMINI_MODEL, "alert_level": "NONE",
            },
        }

    def _get_system_status(self) -> dict:
        return {
            "opensky": opensky_ingester.get_status(),
            "cameras": camera_ingester.get_status(),
            "satellite": satellite_ingester.get_status(),
            "gemini": gemini_client.get_status(),
            "orchestrator": {
                "cycles_completed": self.cycle_count,
                "total_features": self.total_features_generated,
                "last_cycle_ms": self.last_cycle_duration_ms,
                "is_running": self.is_running,
            },
        }

    def get_status(self) -> dict:
        return self._get_system_status()


orchestrator = PanopticOrchestrator()


async def run_detection_cycle() -> dict:
    return await orchestrator.run_detection_cycle()
