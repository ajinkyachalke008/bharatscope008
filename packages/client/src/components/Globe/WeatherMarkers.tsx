import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { useEventStore } from '@/store/eventStore';
import { useUIStore } from '@/store/uiStore';
import { latLngToPosition } from './utils/coordinates';
import { GLOBE_RADIUS } from './utils/globeConstants';

const WEATHER_ICONS: Record<string, string> = {
  clear: '☀️',
  cloudy: '☁️',
  rain: '🌧️',
  storm: '⛈️',
  snow: '🌨️',
  wind: '💨',
  fog: '🌫️',
};

export function WeatherMarkers() {
  const events = useEventStore((s) => s.events);
  const activeLayer = useUIStore((s) => s.mapView);
  const show = activeLayer === 'markers';

  const iconKeys = Object.keys(WEATHER_ICONS);

  const weatherData = useMemo(() => {
    const seen = new Set<string>();
    return events
      .filter((e) => {
        if (e.category !== 'environmental' && e.category !== 'natural_disaster') return false;
        if (seen.has(e.id)) return false;
        seen.add(e.id);
        return true;
      })
      .slice(0, 8)
      .map((e, i) => ({
        id: `wx-${e.id}-${i}`,
        lat: e.location.lat,
        lng: e.location.lng,
        city: e.location.name || 'Unknown',
        temperature: Math.round(((e.location.lat * 0.7 + 15) % 40) - 5),
        icon: WEATHER_ICONS[iconKeys[i % iconKeys.length]] || '🌡️',
      }));
  }, [events]);

  if (!show) return null;

  return (
    <group>
      {weatherData.map((w) => {
        const pos = latLngToPosition(w.lat, w.lng, GLOBE_RADIUS + 0.025);
        return (
          <group key={w.id} position={pos}>
            <Html center distanceFactor={2.5} style={{ pointerEvents: 'none' }}>
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  padding: '3px 8px',
                  fontSize: 11,
                  color: '#e2e8f0',
                  fontFamily: "'Inter', sans-serif",
                  backdropFilter: 'blur(4px)',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  userSelect: 'none',
                }}
              >
                <span>{w.icon}</span>
                <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{w.temperature}°</span>
                <span style={{ color: '#64748b', fontSize: 10 }}>{w.city}</span>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
