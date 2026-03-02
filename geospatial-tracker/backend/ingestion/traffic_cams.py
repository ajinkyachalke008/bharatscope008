import httpx
import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional
from dataclasses import dataclass, field
from config import config

logger = logging.getLogger(__name__)


@dataclass
class CameraConfig:
    """Configuration for a single traffic camera feed."""
    camera_id: str
    url: str
    lat: float
    lon: float
    heading: float = 0.0
    fov: float = 90.0
    description: str = ""
    state: str = ""
    road: str = ""
    enabled: bool = True
    last_capture_time: Optional[str] = None
    consecutive_failures: int = 0
    max_failures: int = 5


@dataclass
class CapturedFrame:
    """A single captured frame from a traffic camera."""
    camera_id: str
    image_bytes: bytes
    lat: float
    lon: float
    heading: float
    fov: float
    captured_at: str
    content_type: str = "image/jpeg"
    frame_size_bytes: int = 0
    description: str = ""


# === CAMERA FEED REGISTRY ===
CAMERA_FEEDS: dict[str, CameraConfig] = {
    "CA_I405_LAX": CameraConfig(
        camera_id="CA_I405_LAX",
        url="https://cwwp2.dot.ca.gov/data/d7/cctv/image/i405-lax/i405-lax.jpg",
        lat=33.9425, lon=-118.4081, heading=315, fov=90,
        description="I-405 near LAX Airport", state="CA", road="I-405",
    ),
    "CA_I5_DOWNTOWN": CameraConfig(
        camera_id="CA_I5_DOWNTOWN",
        url="https://cwwp2.dot.ca.gov/data/d7/cctv/image/i5-downtown/i5-downtown.jpg",
        lat=34.0522, lon=-118.2437, heading=0, fov=80,
        description="I-5 Downtown Los Angeles", state="CA", road="I-5",
    ),
    "CA_I10_SANTAMONICA": CameraConfig(
        camera_id="CA_I10_SANTAMONICA",
        url="https://cwwp2.dot.ca.gov/data/d7/cctv/image/i10-sm/i10-sm.jpg",
        lat=34.0195, lon=-118.4912, heading=270, fov=85,
        description="I-10 near Santa Monica", state="CA", road="I-10",
    ),
    "NY_I95_GWB": CameraConfig(
        camera_id="NY_I95_GWB",
        url="https://511ny.org/map/Ede/GetImage?cameraId=GWB_I95",
        lat=40.8517, lon=-73.9527, heading=180, fov=90,
        description="I-95 George Washington Bridge approach", state="NY", road="I-95",
    ),
    "TX_I35_AUSTIN": CameraConfig(
        camera_id="TX_I35_AUSTIN",
        url="https://its.txdot.gov/ITS_WEB/FrontEnd/snapshots/Austin/CCTV_I35_Riverside.jpg",
        lat=30.2550, lon=-97.7386, heading=0, fov=85,
        description="I-35 at Riverside, Austin TX", state="TX", road="I-35",
    ),
    "WA_I5_SEATTLE": CameraConfig(
        camera_id="WA_I5_SEATTLE",
        url="https://images.wsdot.wa.gov/nw/005vc06472.jpg",
        lat=47.6062, lon=-122.3321, heading=0, fov=80,
        description="I-5 Seattle Downtown", state="WA", road="I-5",
    ),
    "FL_I95_MIAMI": CameraConfig(
        camera_id="FL_I95_MIAMI",
        url="https://fl511.com/map/GetImage?cameraId=CCTV-I95-Miami",
        lat=25.7617, lon=-80.1918, heading=0, fov=90,
        description="I-95 Miami Downtown", state="FL", road="I-95",
    ),
}


class TrafficCameraIngester:
    """Manages traffic camera frame capture across all registered feeds."""

    def __init__(self):
        self.cameras = CAMERA_FEEDS.copy()
        self.total_frames_captured: int = 0
        self.total_failures: int = 0

    async def capture_frame(self, camera_id: str) -> Optional[CapturedFrame]:
        cam = self.cameras.get(camera_id)
        if not cam or not cam.enabled:
            return None

        try:
            async with httpx.AsyncClient(
                timeout=10, follow_redirects=True,
                headers={
                    "User-Agent": "Antigravity-OSINT/1.0 (Research)",
                    "Accept": "image/jpeg, image/png, image/*"
                }
            ) as client:
                resp = await client.get(cam.url)
                resp.raise_for_status()
                image_bytes = resp.content

                if len(image_bytes) < 1000:
                    logger.warning(f"Camera {camera_id}: Suspiciously small frame ({len(image_bytes)} bytes)")
                    return None

                content_type = resp.headers.get("content-type", "image/jpeg")
                cam.consecutive_failures = 0
                cam.last_capture_time = datetime.now(timezone.utc).isoformat()
                self.total_frames_captured += 1

                return CapturedFrame(
                    camera_id=camera_id, image_bytes=image_bytes,
                    lat=cam.lat, lon=cam.lon, heading=cam.heading, fov=cam.fov,
                    captured_at=cam.last_capture_time, content_type=content_type,
                    frame_size_bytes=len(image_bytes), description=cam.description,
                )

        except httpx.HTTPStatusError as e:
            cam.consecutive_failures += 1
            self.total_failures += 1
            logger.warning(f"Camera {camera_id}: HTTP {e.response.status_code}")

        except httpx.TimeoutException:
            cam.consecutive_failures += 1
            self.total_failures += 1
            logger.warning(f"Camera {camera_id}: Timeout")

        except Exception as e:
            cam.consecutive_failures += 1
            self.total_failures += 1
            logger.error(f"Camera {camera_id}: {type(e).__name__}: {e}")

        if cam.consecutive_failures >= cam.max_failures:
            cam.enabled = False
            logger.error(f"Camera {camera_id}: DISABLED after {cam.max_failures} consecutive failures")

        return None

    async def capture_all_frames(self, max_cameras: Optional[int] = None) -> list[CapturedFrame]:
        enabled_cameras = [cam_id for cam_id, cam in self.cameras.items() if cam.enabled]
        if max_cameras:
            enabled_cameras = enabled_cameras[:max_cameras]

        tasks = [self.capture_frame(cam_id) for cam_id in enabled_cameras]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        frames = []
        for result in results:
            if isinstance(result, CapturedFrame):
                frames.append(result)
            elif isinstance(result, Exception):
                logger.error(f"Camera capture exception: {result}")

        logger.info(f"Traffic Cameras: {len(frames)}/{len(enabled_cameras)} frames captured")
        return frames

    def register_camera(self, camera: CameraConfig) -> None:
        self.cameras[camera.camera_id] = camera
        logger.info(f"Camera registered: {camera.camera_id}")

    def deregister_camera(self, camera_id: str) -> None:
        if camera_id in self.cameras:
            del self.cameras[camera_id]
            logger.info(f"Camera deregistered: {camera_id}")

    def get_status(self) -> dict:
        enabled = sum(1 for c in self.cameras.values() if c.enabled)
        return {
            "source": "Traffic Cameras",
            "status": "ACTIVE" if enabled > 0 else "OFFLINE",
            "total_cameras": len(self.cameras),
            "enabled_cameras": enabled,
            "disabled_cameras": len(self.cameras) - enabled,
            "total_frames_captured": self.total_frames_captured,
            "total_failures": self.total_failures,
        }


camera_ingester = TrafficCameraIngester()


async def capture_frame(camera_id: str) -> Optional[CapturedFrame]:
    return await camera_ingester.capture_frame(camera_id)


async def capture_all_frames(max_cameras: Optional[int] = None) -> list[CapturedFrame]:
    return await camera_ingester.capture_all_frames(max_cameras)
