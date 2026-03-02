import httpx
import asyncio
import logging
from typing import Optional
from models.schemas import AircraftPosition
from config import config

logger = logging.getLogger(__name__)

OPENSKY_URL = "https://opensky-network.org/api/states/all"

# Military aircraft ICAO24 hex prefix database
MILITARY_ICAO_PREFIXES = {
    "AE": "US Military", "AF": "US Military",
    "33": "Italian Military", "3B": "Spanish Military",
    "3E": "German Military", "43": "UK Military",
    "44": "UK Military", "50": "French Military",
    "51": "French Military",
}

MILITARY_CALLSIGN_PATTERNS = [
    "FORTE", "HOMER", "JAKE", "LAGR", "NCHO", "DOOM",
    "FEAR", "TITAN", "EVAC", "SAM", "EXEC", "NAVY", "RCH", "IRON",
]

EMERGENCY_SQUAWKS = {
    "7500": "HIJACKING",
    "7600": "RADIO_FAILURE",
    "7700": "GENERAL_EMERGENCY",
}


class OpenSkyIngester:
    """Manages the connection to OpenSky Network API."""

    def __init__(self):
        self.last_request_time: float = 0
        self.request_count: int = 0
        self.total_aircraft_seen: int = 0
        self.consecutive_errors: int = 0
        self.max_consecutive_errors: int = 5

        self.auth = None
        if config.OPENSKY_USERNAME and config.OPENSKY_PASSWORD:
            self.auth = (config.OPENSKY_USERNAME, config.OPENSKY_PASSWORD)
            logger.info("OpenSky: Authenticated mode enabled")
        else:
            logger.info("OpenSky: Anonymous mode (lower rate limits)")

    async def fetch_aircraft(
        self, bbox: Optional[dict] = None
    ) -> list[AircraftPosition]:
        """Fetches all live aircraft positions from OpenSky Network."""
        params = bbox or config.DEFAULT_BBOX
        aircraft_list: list[AircraftPosition] = []

        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(OPENSKY_URL, params=params, auth=self.auth)
                resp.raise_for_status()
                data = resp.json()

            self.consecutive_errors = 0
            states = data.get("states", [])
            if not states:
                logger.warning("OpenSky: No aircraft states returned")
                return aircraft_list

            for state in states:
                try:
                    if state[5] is None or state[6] is None:
                        continue

                    aircraft = AircraftPosition(
                        icao24=state[0],
                        callsign=(state[1] or "").strip(),
                        origin_country=state[2] or "",
                        longitude=state[5],
                        latitude=state[6],
                        altitude=state[7],
                        geo_altitude=state[13],
                        velocity=state[9],
                        heading=state[10],
                        vertical_rate=state[11],
                        on_ground=state[8] or False,
                        last_contact=state[4],
                        squawk=state[14],
                        spi=state[15] or False,
                        position_source=state[16],
                    )

                    aircraft.classification = self._classify_aircraft(aircraft)
                    aircraft.is_military = aircraft.classification == "MILITARY"

                    if aircraft.squawk in EMERGENCY_SQUAWKS:
                        aircraft.emergency = EMERGENCY_SQUAWKS[aircraft.squawk]
                        aircraft.alert_level = "CRITICAL"
                        logger.warning(
                            f"⚠️ EMERGENCY: {aircraft.callsign or aircraft.icao24} "
                            f"squawking {aircraft.squawk} ({aircraft.emergency}) "
                            f"at ({aircraft.latitude}, {aircraft.longitude})"
                        )

                    aircraft.anomalies = self._detect_anomalies(aircraft)
                    aircraft_list.append(aircraft)

                except (IndexError, ValueError, TypeError) as e:
                    logger.debug(f"OpenSky: Skipping malformed state vector: {e}")
                    continue

            self.total_aircraft_seen += len(aircraft_list)
            self.request_count += 1

            logger.info(
                f"OpenSky: {len(aircraft_list)} aircraft fetched "
                f"({sum(1 for a in aircraft_list if a.is_military)} military)"
            )

        except httpx.HTTPStatusError as e:
            self.consecutive_errors += 1
            if e.response.status_code == 429:
                logger.warning("OpenSky: Rate limited — backing off 30s")
                await asyncio.sleep(30)
            else:
                logger.error(f"OpenSky HTTP error: {e.response.status_code}")

        except httpx.TimeoutException:
            self.consecutive_errors += 1
            logger.warning("OpenSky: Request timed out")

        except Exception as e:
            self.consecutive_errors += 1
            logger.error(f"OpenSky: Unexpected error: {e}")
            if self.consecutive_errors >= self.max_consecutive_errors:
                logger.critical(
                    f"OpenSky: {self.consecutive_errors} consecutive errors — "
                    "source may be degraded"
                )

            if config.SIMULATE_ANOMALIES:
                self._inject_simulated_anomalies(aircraft_list)

        return aircraft_list

    def _inject_simulated_anomalies(self, aircraft_list: list[AircraftPosition]):
        """Injects a fake military concentration and an emergency squawk for testing."""
        import time
        now = int(time.time())
        center_lat, center_lon = config.DEFAULT_CENTER_LAT, config.DEFAULT_CENTER_LON

        # 1. Military Concentration (3 aircraft within 50km)
        mil_data = [
            ("AE1111", "DOOM11", center_lat + 0.1, center_lon + 0.1),
            ("AE2222", "DOOM12", center_lat + 0.11, center_lon + 0.09),
            ("AE3333", "DOOM13", center_lat + 0.09, center_lon + 0.11),
        ]
        
        for icao, callsign, lat, lon in mil_data:
            mil_ac = AircraftPosition(
                icao24=icao, callsign=callsign, origin_country="United States",
                latitude=lat, longitude=lon, altitude=15000, geo_altitude=15000,
                velocity=250, heading=90, vertical_rate=0, on_ground=False,
                last_contact=now, squawk="1234", spi=False, position_source=0,
            )
            mil_ac.classification = "MILITARY"
            mil_ac.is_military = True
            mil_ac.anomalies = []
            aircraft_list.append(mil_ac)

        # 2. Emergency Squawk (7700)
        emerg_ac = AircraftPosition(
            icao24="AA9999", callsign="MAYDAY99", origin_country="United States",
            latitude=center_lat - 0.2, longitude=center_lon - 0.2, altitude=5000, geo_altitude=5000,
            velocity=150, heading=180, vertical_rate=-20, on_ground=False,
            last_contact=now, squawk="7700", spi=True, position_source=0,
        )
        emerg_ac.classification = "CIVILIAN"
        emerg_ac.is_military = False
        emerg_ac.emergency = "GENERAL_EMERGENCY"
        emerg_ac.alert_level = "CRITICAL"
        emerg_ac.anomalies = ["SPI_ACTIVE"]
        aircraft_list.append(emerg_ac)


    def _classify_aircraft(self, aircraft: AircraftPosition) -> str:
        icao_prefix = aircraft.icao24[:2].upper()
        if icao_prefix in MILITARY_ICAO_PREFIXES:
            return "MILITARY"

        callsign_upper = aircraft.callsign.upper()
        for pattern in MILITARY_CALLSIGN_PATTERNS:
            if callsign_upper.startswith(pattern):
                return "MILITARY"

        if callsign_upper.startswith(("SAM", "EXEC", "AF1", "AF2")):
            return "GOVERNMENT"

        return "CIVILIAN" if aircraft.callsign else "UNKNOWN"

    def _detect_anomalies(self, aircraft: AircraftPosition) -> list[str]:
        anomalies = []
        if not aircraft.callsign and not aircraft.on_ground:
            anomalies.append("NO_CALLSIGN")
        if (aircraft.altitude and aircraft.altitude < 150 and
                not aircraft.on_ground and aircraft.velocity and aircraft.velocity > 50):
            anomalies.append("LOW_ALTITUDE_FAST")
        if aircraft.vertical_rate and abs(aircraft.vertical_rate) > 30:
            anomalies.append("EXTREME_VERTICAL_RATE")
        if aircraft.spi:
            anomalies.append("SPI_ACTIVE")
        return anomalies

    def get_status(self) -> dict:
        return {
            "source": "OpenSky Network",
            "status": "DEGRADED" if self.consecutive_errors > 0 else "ACTIVE",
            "total_requests": self.request_count,
            "total_aircraft_seen": self.total_aircraft_seen,
            "consecutive_errors": self.consecutive_errors,
            "authenticated": self.auth is not None,
        }


opensky_ingester = OpenSkyIngester()


async def fetch_aircraft(bbox: Optional[dict] = None) -> list[AircraftPosition]:
    return await opensky_ingester.fetch_aircraft(bbox)
