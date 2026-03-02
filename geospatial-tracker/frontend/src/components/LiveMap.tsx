import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { DetectionStats } from '../types';

const BACKEND_URL = 'http://localhost:8000';
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

export default function LiveMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [stats, setStats] = useState<DetectionStats>({
    aircraft: 0,
    militaryAircraft: 0,
    vehicles: 0,
    pedestrians: 0,
    total: 0,
    anomalies: 0,
    cycleNumber: 0,
    cycleTimeMs: 0,
    connectedClients: 0,
  });

  const [systemStatus, setSystemStatus] = useState<string>('CONNECTING');
  const [isConnected, setIsConnected] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  const updateMapData = useCallback((data: any) => {
    if (!map.current) return;

    if (data.type === 'FeatureCollection') {
      const source = map.current.getSource('detections') as maplibregl.GeoJSONSource;
      if (source) source.setData(data);

      const features = data.features || [];
      const props = features.map((f: any) => f.properties);
      const metadata = data.metadata || {};

      setStats({
        aircraft: props.filter((p: any) => p.category === 'aircraft').length,
        militaryAircraft: props.filter((p: any) => p.is_military).length,
        vehicles: props.filter((p: any) => p.category === 'vehicles').length,
        pedestrians: props.filter((p: any) => p.category === 'pedestrians').length,
        total: features.length,
        anomalies: metadata.anomalies || 0,
        cycleNumber: metadata.cycle || 0,
        cycleTimeMs: metadata.cycle_duration_ms || 0,
        connectedClients: 0,
      });
      setMessageCount((c) => c + 1);
    }
  }, []);

  // === DATA CONNECTION: WebSocket with REST polling fallback ===
  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let attempts = 0;
    const maxAttempts = 5;

    function connectWS() {
      try {
        const ws = new WebSocket(`ws://localhost:8000/ws/live`);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[WS] Connected');
          attempts = 0;
          setIsConnected(true);
          setSystemStatus('OPERATIONAL');
          // Stop polling if it was running
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        };

        ws.onmessage = (event) => {
          try {
            updateMapData(JSON.parse(event.data));
          } catch {}
        };

        ws.onclose = () => {
          setIsConnected(false);
          if (attempts < maxAttempts) {
            attempts++;
            const delay = Math.min(3000 * Math.pow(1.5, attempts - 1), 15000);
            console.log(`[WS] Reconnecting in ${(delay / 1000).toFixed(1)}s (attempt ${attempts})`);
            reconnectTimeout = setTimeout(connectWS, delay);
          } else {
            console.log('[WS] Max attempts reached — falling back to REST polling');
            startPolling();
          }
        };

        ws.onerror = () => {};
      } catch {
        startPolling();
      }
    }

    function startPolling() {
      setSystemStatus('POLLING');
      console.log('[REST] Starting REST polling fallback (every 10s)');

      const poll = async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/snapshot`);
          if (res.ok) {
            const data = await res.json();
            updateMapData(data);
            setIsConnected(true);
            setSystemStatus('OPERATIONAL (REST)');
          }
        } catch (e) {
          console.warn('[REST] Poll failed:', e);
          setIsConnected(false);
          setSystemStatus('OFFLINE');
        }
      };

      poll(); // immediate first poll
      pollIntervalRef.current = setInterval(poll, 10000);
    }

    connectWS();

    return () => {
      clearTimeout(reconnectTimeout);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [updateMapData]);

  // === MAP INITIALIZATION ===
  useEffect(() => {
    if (!mapContainer.current) return;

    // Free raster tiles as fallback when no Mapbox token
    const mapStyle: any = mapboxToken
      ? 'mapbox://styles/mapbox/dark-v11'
      : {
          version: 8 as const,
          name: 'Antigravity Dark',
          sources: {
            'carto-dark': {
              type: 'raster',
              tiles: [
                'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              ],
              tileSize: 256,
              attribution: '&copy; CARTO &copy; OpenStreetMap',
            },
          },
          layers: [
            {
              id: 'carto-dark-layer',
              type: 'raster',
              source: 'carto-dark',
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        };

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [77.2, 28.6],
      zoom: 5,
      pitch: 0,
      bearing: 0,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(new maplibregl.ScaleControl(), 'bottom-right');

    map.current.on('load', () => {
      const m = map.current!;

      m.addSource('detections', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Civilian aircraft — altitude-colored
      m.addLayer({
        id: 'aircraft-layer',
        type: 'circle',
        source: 'detections',
        filter: [
          'all',
          ['==', ['get', 'category'], 'aircraft'],
          ['!=', ['get', 'is_military'], true],
        ],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 3, 10, 6, 15, 10],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'altitude'],
            0,
            '#00ff88',
            3000,
            '#ffff00',
            8000,
            '#ffaa00',
            12000,
            '#ff0044',
          ],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.85,
        },
      });

      // Military aircraft — always red, larger
      m.addLayer({
        id: 'military-aircraft-layer',
        type: 'circle',
        source: 'detections',
        filter: ['==', ['get', 'is_military'], true],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 5, 10, 10, 15, 14],
          'circle-color': '#ff1744',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.95,
        },
      });

      // Vehicles — camera detections
      m.addLayer({
        id: 'vehicle-layer',
        type: 'circle',
        source: 'detections',
        filter: ['==', ['get', 'category'], 'vehicles'],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 3, 15, 6, 18, 10],
          'circle-color': '#00d4ff',
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['get', 'confidence'],
            0.3,
            0.3,
            0.7,
            0.6,
            1.0,
            0.9,
          ],
          'circle-stroke-width': 1,
          'circle-stroke-color': 'rgba(0, 212, 255, 0.5)',
        },
      });

      // Pedestrians
      m.addLayer({
        id: 'pedestrian-layer',
        type: 'circle',
        source: 'detections',
        filter: ['==', ['get', 'category'], 'pedestrians'],
        paint: { 'circle-radius': 4, 'circle-color': '#76ff03', 'circle-opacity': 0.7 },
      });

      // Anomaly ring
      m.addLayer({
        id: 'anomaly-layer',
        type: 'circle',
        source: 'detections',
        filter: ['!=', ['get', 'alert_level'], 'NONE'],
        paint: {
          'circle-radius': 20,
          'circle-color': 'transparent',
          'circle-stroke-width': 3,
          'circle-stroke-color': [
            'match',
            ['get', 'alert_level'],
            'CRITICAL',
            '#ff0000',
            'HIGH',
            '#ff6600',
            'MODERATE',
            '#ffaa00',
            '#ffffff',
          ],
          'circle-stroke-opacity': 0.7,
        },
      });

      // Click interaction
      const clickLayers = [
        'aircraft-layer',
        'military-aircraft-layer',
        'vehicle-layer',
        'pedestrian-layer',
      ];

      for (const layerId of clickLayers) {
        m.on('click', layerId, (e) => {
          if (!e.features || e.features.length === 0) return;
          const feature = e.features[0];
          const props = feature.properties as any;
          const coords = (feature.geometry as any).coordinates.slice();

          let html =
            '<div style="font-family:JetBrains Mono,monospace;font-size:12px;max-width:300px;">';

          if (props.category === 'aircraft') {
            const isMil = props.is_military === true || props.is_military === 'true';
            html += `<div style="color:${isMil ? '#ff1744' : '#00ff88'};font-weight:bold;">`;
            html += `${isMil ? '🎖' : '✈'} ${props.callsign || 'UNKNOWN'}</div>`;
            html += `<div>ICAO24: ${props.icao24}</div>`;
            html += `<div>Type: ${props.classification}</div>`;
            html += `<div>Country: ${props.origin_country}</div>`;
            html += `<div>Alt: ${props.altitude_feet ? props.altitude_feet + ' ft' : 'N/A'}</div>`;
            html += `<div>Speed: ${props.velocity_knots ? props.velocity_knots + ' kts' : 'N/A'}</div>`;
            html += `<div>Heading: ${props.heading ? props.heading + '°' : 'N/A'}</div>`;
            if (props.squawk) html += `<div>Squawk: ${props.squawk}</div>`;
            if (props.emergency)
              html += `<div style="color:red;font-weight:bold;">⚠ ${props.emergency}</div>`;
          } else {
            html += `<div style="color:#00d4ff;font-weight:bold;">${props.category} (${props.subcategory || '?'})</div>`;
            html += `<div>Confidence: ${((props.confidence || 0) * 100).toFixed(0)}%</div>`;
            html += `<div>Source: ${props.source}</div>`;
          }

          html += '</div>';

          if (popupRef.current) popupRef.current.remove();

          popupRef.current = new maplibregl.Popup({
            closeButton: true,
            closeOnClick: true,
            maxWidth: '320px',
          })
            .setLngLat(coords)
            .setHTML(html)
            .addTo(m);
        });

        m.on('mouseenter', layerId, () => {
          m.getCanvas().style.cursor = 'pointer';
        });
        m.on('mouseleave', layerId, () => {
          m.getCanvas().style.cursor = '';
        });
      }
    });

    return () => {
      if (popupRef.current) popupRef.current.remove();
      map.current?.remove();
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* HUD */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          background: 'rgba(0,0,0,0.85)',
          color: '#00ff88',
          padding: '16px 24px',
          borderRadius: 12,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 13,
          lineHeight: 1.6,
          border: '1px solid rgba(0,255,136,0.2)',
          backdropFilter: 'blur(10px)',
          minWidth: 260,
          boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 2,
            marginBottom: 8,
            color: '#fff',
          }}
        >
          ANTIGRAVITY
        </div>
        <div style={{ color: isConnected ? '#00ff88' : '#ff4444', marginBottom: 12, fontSize: 11 }}>
          {isConnected ? '🟢' : '🔴'} {systemStatus} • Cycle #{stats.cycleNumber}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 8 }}>
          <div>
            ✈ AIRCRAFT: <span style={{ color: '#fff' }}>{stats.aircraft}</span>
          </div>
          <div style={{ color: '#ff1744' }}>
            🎖 MILITARY: <span style={{ color: '#fff' }}>{stats.militaryAircraft}</span>
          </div>
          <div style={{ color: '#00d4ff' }}>
            🚗 VEHICLES: <span style={{ color: '#fff' }}>{stats.vehicles}</span>
          </div>
          <div style={{ color: '#76ff03' }}>
            🚶 PEDESTRIANS: <span style={{ color: '#fff' }}>{stats.pedestrians}</span>
          </div>
        </div>
        {stats.anomalies > 0 && (
          <div
            style={{
              borderTop: '1px solid rgba(255,0,0,0.3)',
              paddingTop: 8,
              marginTop: 8,
              color: '#ff4444',
            }}
          >
            ⚠ ANOMALIES: <span style={{ color: '#fff' }}>{stats.anomalies}</span>
          </div>
        )}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: 8,
            marginTop: 8,
            fontSize: 10,
            opacity: 0.5,
          }}
        >
          <div>TOTAL: {stats.total}</div>
          <div>CYCLE: {stats.cycleTimeMs.toFixed(0)}ms</div>
          <div>MSGS: {messageCount}</div>
          <div>LIVE • 10s refresh</div>
        </div>
      </div>

      {/* Anomaly Alert Banner */}
      {stats.anomalies > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255,23,68,0.9)',
            color: '#fff',
            padding: '8px 24px',
            borderRadius: 8,
            zIndex: 20,
            fontFamily: 'monospace',
            fontSize: 13,
            fontWeight: 700,
            animation: 'pulse 2s infinite',
            boxShadow: '0 0 20px rgba(255,23,68,0.5)',
          }}
        >
          ⚠ {stats.anomalies} ANOMAL{stats.anomalies === 1 ? 'Y' : 'IES'} DETECTED
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 16,
          background: 'rgba(0,0,0,0.75)',
          padding: '10px 16px',
          borderRadius: 8,
          fontFamily: 'monospace',
          fontSize: 11,
          color: '#aaa',
          zIndex: 10,
        }}
      >
        <div>
          <span style={{ color: '#ff1744' }}>●</span> Military Aircraft
        </div>
        <div>
          <span style={{ color: '#00ff88' }}>●</span> Civilian (Low Alt)
        </div>
        <div>
          <span style={{ color: '#ffaa00' }}>●</span> Civilian (Med Alt)
        </div>
        <div>
          <span style={{ color: '#ff0044' }}>●</span> Civilian (High Alt)
        </div>
        <div>
          <span style={{ color: '#00d4ff' }}>●</span> Vehicle (Camera AI)
        </div>
        <div>
          <span style={{ color: '#76ff03' }}>●</span> Pedestrian (Camera AI)
        </div>
      </div>
    </div>
  );
}
