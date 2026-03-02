"""
ANTIGRAVITY GEOSPATIAL TRACKER — FASTAPI APPLICATION
The server runs a continuous broadcast loop: ingest → analyze → detect → broadcast.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import logging
import base64
from datetime import datetime, timezone
from contextlib import asynccontextmanager

from analysis.panoptic import orchestrator, run_detection_cycle
from ingestion.opensky import opensky_ingester
from ingestion.traffic_cams import camera_ingester, CameraConfig
from ingestion.satellite import satellite_ingester
from analysis.gemini_client import gemini_client
from config import config

logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL),
    format="%(asctime)s │ %(levelname)-8s │ %(name)-20s │ %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("antigravity.main")


# === LIFESPAN ===

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("╔══════════════════════════════════════════════════════╗")
    logger.info("║      ANTIGRAVITY GEOSPATIAL TRACKER v1.0            ║")
    logger.info("╚══════════════════════════════════════════════════════╝")
    logger.info(f"Aircraft: {'ON' if config.ENABLE_AIRCRAFT_TRACKING else 'OFF'}")
    logger.info(f"Cameras:  {'ON' if config.ENABLE_CAMERA_ANALYSIS else 'OFF'}")
    logger.info(f"Satellite:{'ON' if config.ENABLE_SATELLITE else 'OFF'}")
    logger.info(f"Gemini:   {'ON' if config.ENABLE_GEMINI_VISION else 'OFF'}")
    logger.info(f"Broadcast: {config.BROADCAST_INTERVAL}s")

    broadcast_task = asyncio.create_task(broadcast_loop())
    orchestrator.is_running = True
    logger.info("🟢 Broadcast loop started — system is LIVE")

    yield

    logger.info("🔴 Shutting down...")
    orchestrator.is_running = False
    broadcast_task.cancel()
    try:
        await broadcast_task
    except asyncio.CancelledError:
        pass

    for client in connected_clients.copy():
        try:
            await client.close()
        except Exception:
            pass
    connected_clients.clear()


# === APP ===

app = FastAPI(
    title="Antigravity Geospatial Tracker",
    description="Real-time geospatial intelligence: ADS-B + Camera AI + Satellite",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# === WEBSOCKET ===

connected_clients: list[WebSocket] = []
last_broadcast_payload: str = "{}"


@app.websocket("/ws/live")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    connected_clients.append(ws)
    client_ip = ws.client.host if ws.client else "unknown"
    logger.info(f"WebSocket: Client connected from {client_ip} (total: {len(connected_clients)})")

    try:
        if last_broadcast_payload != "{}":
            await ws.send_text(last_broadcast_payload)
    except Exception:
        pass

    try:
        while True:
            message = await ws.receive_text()
            try:
                cmd = json.loads(message)
                await handle_client_command(ws, cmd)
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        if ws in connected_clients:
            connected_clients.remove(ws)
        logger.info(f"WebSocket: Client disconnected (remaining: {len(connected_clients)})")
    except Exception as e:
        if ws in connected_clients:
            connected_clients.remove(ws)
        logger.warning(f"WebSocket: Connection error: {e}")


async def handle_client_command(ws: WebSocket, cmd: dict):
    command_type = cmd.get("type")

    if command_type == "request_satellite":
        bbox = cmd.get("bbox")
        if bbox:
            tile = await satellite_ingester.fetch_tile_wms(bbox)
            if tile:
                await ws.send_text(json.dumps({
                    "type": "satellite_tile", "bbox": bbox,
                    "image_b64": base64.b64encode(tile).decode(),
                }))

    elif command_type == "get_status":
        await ws.send_text(json.dumps({"type": "system_status", "status": orchestrator.get_status()}))

    elif command_type == "ping":
        await ws.send_text(json.dumps({"type": "pong"}))


# === BROADCAST LOOP ===

async def broadcast_loop():
    global last_broadcast_payload

    while orchestrator.is_running:
        cycle_start = datetime.now(timezone.utc)

        try:
            geojson = await run_detection_cycle()
            payload = json.dumps(geojson, default=str)
            last_broadcast_payload = payload

            if connected_clients:
                disconnected = []
                for client in connected_clients.copy():
                    try:
                        await client.send_text(payload)
                    except Exception:
                        disconnected.append(client)

                for client in disconnected:
                    if client in connected_clients:
                        connected_clients.remove(client)

                feature_count = len(geojson.get("features", []))
                logger.info(f"Broadcast: {feature_count} features → {len(connected_clients)} clients")

        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Broadcast loop error: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()

        elapsed = (datetime.now(timezone.utc) - cycle_start).total_seconds()
        await asyncio.sleep(max(0, config.BROADCAST_INTERVAL - elapsed))


# === REST ENDPOINTS ===

@app.get("/")
async def root():
    return {
        "name": "Antigravity Geospatial Tracker", "version": "1.0.0",
        "status": "OPERATIONAL" if orchestrator.is_running else "STOPPED",
        "connected_clients": len(connected_clients),
        "cycles_completed": orchestrator.cycle_count,
    }


@app.get("/api/status")
async def get_status():
    return orchestrator.get_status()


@app.get("/api/snapshot")
async def get_snapshot():
    if last_broadcast_payload == "{}":
        return {"type": "FeatureCollection", "features": [], "metadata": {"status": "no_data_yet"}}
    return json.loads(last_broadcast_payload)


@app.get("/api/cameras")
async def list_cameras():
    return camera_ingester.get_status()


@app.get("/api/config")
async def get_config():
    return {
        "broadcast_interval": config.BROADCAST_INTERVAL,
        "aircraft_poll_interval": config.AIRCRAFT_POLL_INTERVAL,
        "min_detection_confidence": config.MIN_DETECTION_CONFIDENCE,
        "max_cameras_per_cycle": config.MAX_CAMERAS_PER_CYCLE,
        "features_enabled": {
            "aircraft": config.ENABLE_AIRCRAFT_TRACKING,
            "cameras": config.ENABLE_CAMERA_ANALYSIS,
            "satellite": config.ENABLE_SATELLITE,
            "gemini": config.ENABLE_GEMINI_VISION,
            "anomaly": config.ENABLE_ANOMALY_DETECTION,
        },
    }
