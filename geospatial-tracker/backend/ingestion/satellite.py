import httpx
import logging
import math
from datetime import datetime, timedelta, timezone
from typing import Optional
from config import config

logger = logging.getLogger(__name__)

SENTINEL_WMS_URL = "https://services.sentinel-hub.com/ogc/wms/{instance_id}"


class SatelliteIngester:
    """Fetches satellite imagery tiles from Sentinel Hub."""

    def __init__(self):
        self.instance_id = config.SENTINEL_INSTANCE_ID
        self.total_tiles_fetched: int = 0
        self.total_bytes_downloaded: int = 0

        if not self.instance_id:
            logger.warning("Satellite: No SENTINEL_INSTANCE_ID configured.")

    async def fetch_tile_wms(
        self,
        bbox: list[float],
        width: int = 1024,
        height: int = 1024,
        layers: str = "TRUE_COLOR",
        time_range: Optional[tuple[str, str]] = None,
        image_format: str = "image/jpeg"
    ) -> Optional[bytes]:
        if not self.instance_id:
            return None

        if time_range is None:
            end_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            start_date = (datetime.now(timezone.utc) - timedelta(days=30)).strftime("%Y-%m-%d")
            time_range = (start_date, end_date)

        url = SENTINEL_WMS_URL.format(instance_id=self.instance_id)

        params = {
            "SERVICE": "WMS", "REQUEST": "GetMap", "LAYERS": layers,
            "BBOX": ",".join(map(str, bbox)), "WIDTH": width, "HEIGHT": height,
            "FORMAT": image_format, "CRS": "EPSG:4326",
            "TIME": f"{time_range[0]}/{time_range[1]}",
            "MAXCC": 30, "QUALITY": 90,
        }

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(url, params=params)
                resp.raise_for_status()
                image_bytes = resp.content

                self.total_tiles_fetched += 1
                self.total_bytes_downloaded += len(image_bytes)

                logger.info(
                    f"Satellite: Fetched {layers} tile "
                    f"({width}x{height}, {len(image_bytes)/1024:.0f}KB)"
                )
                return image_bytes

        except httpx.HTTPStatusError as e:
            logger.error(f"Satellite HTTP error: {e.response.status_code}")
        except httpx.TimeoutException:
            logger.warning("Satellite: Request timed out")
        except Exception as e:
            logger.error(f"Satellite: Unexpected error: {e}")

        return None

    async def fetch_tile_for_location(
        self, lat: float, lon: float, radius_km: float = 5.0,
        width: int = 1024, height: int = 1024
    ) -> Optional[bytes]:
        lat_delta = radius_km / 111.0
        lon_delta = radius_km / (111.0 * abs(math.cos(math.radians(lat))))
        bbox = [lon - lon_delta, lat - lat_delta, lon + lon_delta, lat + lat_delta]
        return await self.fetch_tile_wms(bbox, width, height)

    async def fetch_change_detection_pair(
        self, bbox: list[float], before_date: str, after_date: str,
        width: int = 1024, height: int = 1024
    ) -> Optional[dict]:
        before_start = (
            datetime.strptime(before_date, "%Y-%m-%d") - timedelta(days=10)
        ).strftime("%Y-%m-%d")

        before_tile = await self.fetch_tile_wms(bbox, width, height, time_range=(before_start, before_date))
        after_tile = await self.fetch_tile_wms(bbox, width, height, time_range=(after_date, after_date))

        if before_tile and after_tile:
            return {"before": before_tile, "after": after_tile,
                    "before_date": before_date, "after_date": after_date, "bbox": bbox}

        logger.warning("Satellite: Could not fetch both tiles for change detection")
        return None

    def get_status(self) -> dict:
        return {
            "source": "Sentinel Hub",
            "status": "ACTIVE" if self.instance_id else "UNCONFIGURED",
            "instance_configured": bool(self.instance_id),
            "total_tiles_fetched": self.total_tiles_fetched,
            "total_bytes_downloaded": self.total_bytes_downloaded,
        }


satellite_ingester = SatelliteIngester()


async def fetch_satellite_tile(bbox: list[float], width: int = 1024, height: int = 1024) -> Optional[bytes]:
    return await satellite_ingester.fetch_tile_wms(bbox, width, height)
