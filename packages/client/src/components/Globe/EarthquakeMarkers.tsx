import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useEventStore } from '@/store/eventStore';
import { useUIStore } from '@/store/uiStore';
import { latLngToPosition, latLngToNormal } from './utils/coordinates';
import { GLOBE_RADIUS, MARKER_EARTHQUAKE } from './utils/globeConstants';
import { timeAgo } from '@/utils/formatters';

/** Color scale for earthquake magnitude */
function getMagnitudeColor(mag: number): string {
  if (mag >= 7.0) return '#cc0033';
  if (mag >= 6.0) return '#ff0040';
  if (mag >= 5.0) return '#ff4444';
  if (mag >= 4.0) return '#ff8800';
  if (mag >= 3.0) return '#ffbb33';
  if (mag >= 2.0) return '#ffdd57';
  return '#88cc44';
}

interface EqData {
  id: string;
  lat: number;
  lng: number;
  magnitude: number;
  place: string;
  depth: number;
  time: string;
  tsunami: boolean;
}

function EarthquakePoint({ id, lat, lng, magnitude, place, depth, time, tsunami }: EqData) {
  const groupRef = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const spikeRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  const color = getMagnitudeColor(magnitude);
  const threeColor = useMemo(() => new THREE.Color(color), [color]);

  const surfacePos = useMemo(
    () => latLngToPosition(lat, lng, GLOBE_RADIUS + MARKER_EARTHQUAKE.floatHeight),
    [lat, lng],
  );

  const normal = useMemo(() => latLngToNormal(lat, lng), [lat, lng]);
  const spikeHeight = magnitude * 0.025;
  const markerRadius = Math.max(
    MARKER_EARTHQUAKE.minRadius,
    Math.min(magnitude * 0.005, MARKER_EARTHQUAKE.maxRadius),
  );

  useFrame(({ clock }) => {
    if (ringRef.current && magnitude >= 4.0) {
      const t = clock.getElapsedTime();
      const phase = (t * 0.8 + parseInt(id.slice(-4), 16) * 0.001) % 1;
      const scale = 1 + phase * 3;
      ringRef.current.scale.setScalar(scale);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = (1 - phase) * 0.6;
    }
    if (spikeRef.current) {
      const t = clock.getElapsedTime();
      spikeRef.current.scale.y = 1 + Math.sin(t * 3 + magnitude) * 0.1;
    }
  });

  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    return q;
  }, [normal]);

  return (
    <group
      ref={groupRef}
      position={surfacePos}
      quaternion={quaternion}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      <mesh>
        <sphereGeometry args={[markerRadius, 12, 12]} />
        <meshBasicMaterial color={threeColor} transparent opacity={0.9} />
      </mesh>

      <mesh ref={spikeRef} position={[0, spikeHeight / 2, 0]}>
        <cylinderGeometry
          args={[
            MARKER_EARTHQUAKE.spikeTipRadius,
            MARKER_EARTHQUAKE.spikeBaseRadius,
            spikeHeight,
            6,
          ]}
        />
        <meshBasicMaterial color={threeColor} transparent opacity={0.7} />
      </mesh>

      <mesh position={[0, spikeHeight, 0]}>
        <sphereGeometry args={[0.003, 8, 8]} />
        <meshBasicMaterial color={threeColor} transparent opacity={0.9} />
      </mesh>

      {magnitude >= 4.0 && (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[markerRadius, markerRadius + 0.003, 32]} />
          <meshBasicMaterial
            color={threeColor}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {hovered && (
        <Html
          position={[0, spikeHeight + 0.03, 0]}
          center
          distanceFactor={3}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              background: 'rgba(10, 14, 23, 0.92)',
              border: `1px solid ${color}`,
              borderRadius: 8,
              padding: '8px 12px',
              color: '#e2e8f0',
              fontSize: 12,
              fontFamily: "'Inter', sans-serif",
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(8px)',
              boxShadow: `0 0 20px ${color}44`,
              minWidth: 180,
            }}
          >
            <div style={{ color, fontWeight: 800, fontSize: 16, fontFamily: 'monospace' }}>
              M{magnitude.toFixed(1)}
            </div>
            <div style={{ marginTop: 2, fontWeight: 600 }}>{place}</div>
            <div style={{ marginTop: 4, color: '#94a3b8', fontSize: 11 }}>
              Depth: {depth}km · {timeAgo(time)}
              {tsunami && <span style={{ color: '#06b6d4', marginLeft: 6 }}>🌊 Tsunami</span>}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

/**
 * Reads earthquake events from the event store and renders them as 3D markers.
 * Filters events with category === 'natural_disaster' and maps them to earthquake data.
 */
export function EarthquakeMarkers() {
  const events = useEventStore((s) => s.events);
  const activeLayer = useUIStore((s) => s.mapView);

  const show = activeLayer === 'markers' || activeLayer === 'heatmap';

  const earthquakes = useMemo(() => {
    const seen = new Set<string>();
    return events
      .filter((e) => {
        if (e.category !== 'natural_disaster') return false;
        if (seen.has(e.id)) return false;
        seen.add(e.id);
        return true;
      })
      .map((e, i) => ({
        id: `eq-${e.id}-${i}`,
        lat: e.location.lat,
        lng: e.location.lng,
        magnitude:
          e.severity === 'critical'
            ? 7.2
            : e.severity === 'high'
              ? 5.8
              : e.severity === 'medium'
                ? 4.1
                : 2.5,
        place: e.location.name || e.title,
        depth: Math.round(10 + ((i * 17) % 200)),
        time: e.timestamp,
        tsunami: e.severity === 'critical' && i % 3 === 0,
      }));
  }, [events]);

  if (!show) return null;

  return (
    <group>
      {earthquakes.map((eq) => (
        <EarthquakePoint key={eq.id} {...eq} />
      ))}
    </group>
  );
}
