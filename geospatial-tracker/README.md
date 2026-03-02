# WorldMonitor Geospatial Tracker

The **Geospatial Tracker** is a full-stack intelligence and situational awareness subsystem integrated into WorldMonitor. It orchestrates real-time data from OpenSky Network, public traffic cameras, and Satellite imagery, analyzing the visual feeds using Google Gemini Vision, and broadcasting a unified stream of detected entities via WebSockets to a Mapbox interface.

## System Architecture

```text
┌────────────────┐   ┌─────────────────┐   ┌────────────────┐
│ Opensky (ADS-B)│   │ Traffic Cameras │   │ Sentinel Hub   │
└───────┬────────┘   └────────┬────────┘   └───────┬────────┘
        │                     │                    │
        ▼                     ▼                    ▼
┌───────────────────────────────────────────────────────────┐
│ BACKEND (FastAPI / Python)                                │
│                                                           │
│ 1. Data Ingestion (Polling every 10-15s)                  │
│ 2. AI Vision Analysis (Gemini 1.5 Pro)                    │
│ 3. Cross-Source Anomaly Detection                         │
│ 4. GeoJSON Data Serialization                             │
└───────────────────────────┬───────────────────────────────┘
                            │
                            │ WebSocket (ws://localhost:8000/ws/live)
                            │ Every 10 seconds
                            ▼
┌───────────────────────────────────────────────────────────┐
│ FRONTEND (React / Mapbox GL JS)                           │
│                                                           │
│ - Real-time Mapbox GL JS rendering                        │
│ - Altitude-colored aircraft (Civilian / Military)         │
│ - AI-detected Vehicles and Pedestrians                    │
│ - Pulsing Anomaly Alerts                                  │
│ - Live HUD & Statistics Overlay                           │
└───────────────────────────────────────────────────────────┘
```

## Prerequisites
- Node.js 20+
- Python 3.12+
- Docker & Docker Compose
- API Keys:
  - **Mapbox Token** (Required for map rendering)
  - **Gemini API Key** (Required for camera/satellite AI analysis)

## Quick Start

1. **Configure Environment:**
   Run `make setup` and edit the generated `.env` file to include your API keys.

2. **Start the System:**
   Run `make docker` to build and launch both the backend and frontend in Docker.

3. **View the Dashboard:**
   Navigate to `http://localhost:3000` to see the live tracking interface.

## Data Sources
- **Aircraft:** OpenSky Network (5 requests/10s rate limit anonymous).
- **Vehicles/Pedestrians:** Captured from public DOT highway cameras.
- **Anomalies:** Detected by custom algorithms (military concentrations, emergency squawks).
- **Satellite:** Sentinel Hub Copurnicus imagery (Opt-in via `.env`).

## API Endpoints
- `GET /` — Health check
- `GET /api/status` — Comprehensive subsystem status report
- `GET /api/snapshot` — Last completed GeoJSON data payload (used as frontend REST fallback)
- `GET /api/config` — Public configuration
- `WS /ws/live` — 10hz Live GeoJSON broadcast socket
