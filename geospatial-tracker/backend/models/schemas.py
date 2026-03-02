"""
PYDANTIC SCHEMAS — THE GLUE THAT PREVENTS CHAOS
Every piece of data passes through validation before touching
the frontend, the database, or the broadcast pipeline.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional
from enum import Enum


# === ENUMS ===

class EntityClassification(str, Enum):
    MILITARY = "MILITARY"
    GOVERNMENT = "GOVERNMENT"
    CIVILIAN = "CIVILIAN"
    UNKNOWN = "UNKNOWN"


class AlertLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MODERATE = "MODERATE"
    LOW = "LOW"
    NONE = "NONE"


class DataSource(str, Enum):
    OPENSKY = "opensky"
    CAMERA = "camera"
    SATELLITE = "satellite"
    GEMINI = "gemini"
    AIS = "ais"
    MANUAL = "manual"


# === AIRCRAFT ===

class AircraftPosition(BaseModel):
    """Validated aircraft position from OpenSky Network."""
    icao24: str = Field(..., min_length=6, max_length=6)
    callsign: str = Field(default="", max_length=8)
    origin_country: str = Field(default="")
    longitude: Optional[float] = Field(default=None, ge=-180.0, le=180.0)
    latitude: Optional[float] = Field(default=None, ge=-90.0, le=90.0)
    altitude: Optional[float] = Field(default=None, ge=-500.0, le=100000.0)
    geo_altitude: Optional[float] = Field(default=None, ge=-500.0, le=100000.0)
    velocity: Optional[float] = Field(default=None, ge=0.0, le=1000.0)
    heading: Optional[float] = Field(default=None, ge=0.0, le=360.0)
    vertical_rate: Optional[float] = Field(default=None, ge=-200.0, le=200.0)
    on_ground: bool = Field(default=False)
    last_contact: Optional[int] = Field(default=None)
    squawk: Optional[str] = Field(default=None, max_length=4)
    spi: bool = Field(default=False)
    position_source: Optional[int] = Field(default=None)

    # Antigravity-enriched fields
    classification: str = Field(default="UNKNOWN")
    is_military: bool = Field(default=False)
    emergency: Optional[str] = Field(default=None)
    alert_level: str = Field(default="NONE")
    anomalies: list[str] = Field(default_factory=list)

    @field_validator("callsign")
    @classmethod
    def clean_callsign(cls, v: str) -> str:
        return v.strip().upper() if v else ""

    @field_validator("icao24")
    @classmethod
    def normalize_icao24(cls, v: str) -> str:
        return v.strip().lower()


# === GEMINI DETECTIONS ===

class Detection(BaseModel):
    """Validates a single Gemini Vision detection result."""
    category: str = Field(...)
    subcategory: str = Field(default="")
    estimated_lat: float = Field(..., ge=-90.0, le=90.0)
    estimated_lon: float = Field(..., ge=-180.0, le=180.0)
    confidence: float = Field(..., ge=0.0, le=1.0)
    bounding_box: Optional[list[float]] = Field(default=None)
    attributes: dict = Field(default_factory=dict)

    @field_validator("bounding_box")
    @classmethod
    def validate_bbox(cls, v: Optional[list[float]]) -> Optional[list[float]]:
        if v is not None:
            if len(v) != 4:
                return None
            if any(not isinstance(x, (int, float)) for x in v):
                return None
            if v[0] >= v[2] or v[1] >= v[3]:
                return None
        return v

    @field_validator("category")
    @classmethod
    def normalize_category(cls, v: str) -> str:
        return v.strip().lower()


class DetectionResponse(BaseModel):
    """Wraps a list of Detection objects."""
    detections: list[Detection]


# === WEBSOCKET MESSAGES ===

class WebSocketMessage(BaseModel):
    type: str = Field(default="geojson_update")
    payload: dict = Field(...)
    timestamp: str = Field(...)
    cycle: int = Field(default=0)


# === ANOMALY ===

class AnomalyRecord(BaseModel):
    type: str
    severity: str
    entity_id: Optional[str] = None
    description: str
    coordinates: Optional[list[float]] = None
    timestamp: Optional[str] = None


# === SYSTEM STATUS ===

class SourceStatus(BaseModel):
    source: str
    status: str
    total_requests: int = 0
    total_errors: int = 0
    last_update: Optional[str] = None


class SystemStatus(BaseModel):
    opensky: SourceStatus
    cameras: SourceStatus
    satellite: SourceStatus
    gemini: SourceStatus
    orchestrator: dict
