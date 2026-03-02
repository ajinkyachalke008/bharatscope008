import os
from dataclasses import dataclass, field


@dataclass
class Config:
    """
    All configuration loaded from environment variables.
    Defaults provided for development; override in .env for production.
    """

    # === API KEYS ===
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    MAPBOX_TOKEN: str = os.getenv("MAPBOX_TOKEN", "")
    SENTINEL_INSTANCE_ID: str = os.getenv("SENTINEL_INSTANCE_ID", "")
    PLANET_API_KEY: str = os.getenv("PLANET_API_KEY", "")
    OPENSKY_USERNAME: str = os.getenv("OPENSKY_USERNAME", "")
    OPENSKY_PASSWORD: str = os.getenv("OPENSKY_PASSWORD", "")

    # === POLLING INTERVALS (seconds) ===
    AIRCRAFT_POLL_INTERVAL: int = int(os.getenv("AIRCRAFT_POLL_INTERVAL", "10"))
    CAMERA_POLL_INTERVAL: int = int(os.getenv("CAMERA_POLL_INTERVAL", "15"))
    SATELLITE_POLL_INTERVAL: int = int(os.getenv("SATELLITE_POLL_INTERVAL", "300"))
    BROADCAST_INTERVAL: int = int(os.getenv("BROADCAST_INTERVAL", "10"))

    # === RATE LIMITS ===
    OPENSKY_MAX_REQUESTS_PER_10S: int = 5
    OPENSKY_AUTH_REQUESTS_PER_5S: int = 1
    GEMINI_MAX_REQUESTS_PER_MIN: int = 15
    SENTINEL_MAX_REQUESTS_PER_MONTH: int = 30000

    # === DETECTION SETTINGS ===
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    MIN_DETECTION_CONFIDENCE: float = float(os.getenv("MIN_CONFIDENCE", "0.3"))
    MAX_CAMERAS_PER_CYCLE: int = int(os.getenv("MAX_CAMERAS", "10"))

    # === GEOGRAPHIC DEFAULTS (India) ===
    DEFAULT_CENTER_LAT: float = float(os.getenv("DEFAULT_LAT", "28.6"))
    DEFAULT_CENTER_LON: float = float(os.getenv("DEFAULT_LON", "77.2"))
    DEFAULT_BBOX: dict = field(default_factory=lambda: {
        "lamin": 8.0, "lomin": 68.0,
        "lamax": 37.0, "lomax": 97.5
    })

    # === FEATURE FLAGS ===
    ENABLE_AIRCRAFT_TRACKING: bool = os.getenv("ENABLE_AIRCRAFT", "true").lower() == "true"
    ENABLE_CAMERA_ANALYSIS: bool = os.getenv("ENABLE_CAMERAS", "true").lower() == "true"
    ENABLE_SATELLITE: bool = os.getenv("ENABLE_SATELLITE", "false").lower() == "true"
    ENABLE_ANOMALY_DETECTION: bool = os.getenv("ENABLE_ANOMALY", "true").lower() == "true"
    ENABLE_GEMINI_VISION: bool = os.getenv("ENABLE_GEMINI", "true").lower() == "true"
    SIMULATE_ANOMALIES: bool = os.getenv("SIMULATE_ANOMALIES", "true").lower() == "true"

    # === SERVER ===
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    CORS_ORIGINS: list = field(default_factory=lambda: ["*"])
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")


config = Config()
