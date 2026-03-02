import logging
import math
from typing import Optional

logger = logging.getLogger(__name__)


class AnomalyDetector:
    """Cross-source anomaly detection engine."""

    def __init__(self):
        self.previous_features: list[dict] = []
        self.military_proximity_threshold_km: float = 50.0

    def analyze(self, features: list[dict]) -> list[dict]:
        anomalies = []
        anomalies.extend(self._detect_military_concentration(features))
        anomalies.extend(self._detect_emergency_squawks(features))
        anomalies.extend(self._detect_unusual_camera_activity(features))
        anomalies.extend(self._detect_disappeared_aircraft(features))
        self.previous_features = features

        if anomalies:
            logger.warning(f"Anomaly Detection: {len(anomalies)} anomalies found")
        return anomalies

    def _detect_military_concentration(self, features: list[dict]) -> list[dict]:
        military = [
            f for f in features
            if f.get("properties", {}).get("is_military")
            and f.get("geometry", {}).get("coordinates")
        ]
        anomalies = []

        for i, mil_a in enumerate(military):
            nearby_count = 0
            nearby_callsigns = []
            for j, mil_b in enumerate(military):
                if i == j:
                    continue
                dist = self._haversine_approx(
                    mil_a["geometry"]["coordinates"],
                    mil_b["geometry"]["coordinates"]
                )
                if dist < self.military_proximity_threshold_km:
                    nearby_count += 1
                    nearby_callsigns.append(mil_b["properties"].get("callsign", "UNKNOWN"))

            if nearby_count >= 2:
                anomalies.append({
                    "type": "FORCE_CONCENTRATION", "severity": "HIGH",
                    "entity_id": mil_a["properties"].get("id"),
                    "description": f"{nearby_count + 1} military aircraft within {self.military_proximity_threshold_km}km",
                    "coordinates": mil_a["geometry"]["coordinates"],
                })
        return anomalies

    def _detect_emergency_squawks(self, features: list[dict]) -> list[dict]:
        anomalies = []
        for f in features:
            props = f.get("properties", {})
            if props.get("emergency"):
                anomalies.append({
                    "type": "EMERGENCY_SQUAWK", "severity": "CRITICAL",
                    "entity_id": props.get("id"),
                    "description": f"{props.get('callsign', 'UNKNOWN')} squawking {props.get('squawk')} — {props.get('emergency')}",
                    "coordinates": f.get("geometry", {}).get("coordinates"),
                })
        return anomalies

    def _detect_unusual_camera_activity(self, features: list[dict]) -> list[dict]:
        anomalies = []
        camera_detections: dict[str, list] = {}

        for f in features:
            props = f.get("properties", {})
            source = props.get("source", "")
            if source.startswith("camera:"):
                cam_id = source.split(":")[1]
                camera_detections.setdefault(cam_id, []).append(props)

        for cam_id, detections in camera_detections.items():
            vehicle_count = sum(1 for d in detections if d.get("category") == "vehicles")
            if vehicle_count > 20:
                anomalies.append({
                    "type": "HIGH_TRAFFIC_DENSITY", "severity": "MODERATE",
                    "entity_id": f"camera:{cam_id}",
                    "description": f"Camera {cam_id}: {vehicle_count} vehicles — possible congestion",
                })

            for d in detections:
                attrs = d.get("attributes", {})
                if attrs.get("notable") == "emergency_lights_on":
                    anomalies.append({
                        "type": "EMERGENCY_VEHICLE", "severity": "MODERATE",
                        "entity_id": f"camera:{cam_id}",
                        "description": f"Camera {cam_id}: Emergency vehicle with lights active",
                    })
                if d.get("category") == "pedestrians" and "I-" in cam_id.upper():
                    anomalies.append({
                        "type": "PEDESTRIAN_ON_HIGHWAY", "severity": "HIGH",
                        "entity_id": f"camera:{cam_id}",
                        "description": f"Camera {cam_id}: Pedestrian on interstate highway",
                    })
        return anomalies

    def _detect_disappeared_aircraft(self, features: list[dict]) -> list[dict]:
        if not self.previous_features:
            return []

        anomalies = []
        prev_military = {
            f["properties"]["icao24"] for f in self.previous_features
            if f.get("properties", {}).get("is_military") and f.get("properties", {}).get("icao24")
        }
        curr_military = {
            f["properties"]["icao24"] for f in features
            if f.get("properties", {}).get("is_military") and f.get("properties", {}).get("icao24")
        }

        for icao24 in (prev_military - curr_military):
            for f in self.previous_features:
                if f.get("properties", {}).get("icao24") == icao24:
                    anomalies.append({
                        "type": "TRANSPONDER_LOST", "severity": "HIGH",
                        "entity_id": f"aircraft:{icao24}",
                        "description": f"Military {icao24} ({f['properties'].get('callsign', 'UNKNOWN')}) transponder lost",
                        "coordinates": f["geometry"]["coordinates"],
                    })
                    break
        return anomalies

    @staticmethod
    def _haversine_approx(coord1: list, coord2: list) -> float:
        lon1, lat1 = coord1[0], coord1[1]
        lon2, lat2 = coord2[0], coord2[1]
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) ** 2)
        return 6371 * 2 * math.asin(math.sqrt(a))
