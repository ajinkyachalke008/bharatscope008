import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useEventStore } from '@/store/eventStore';
import { useUIStore } from '@/store/uiStore';
import { latLngToPosition, latLngToNormal } from './utils/coordinates';
import { GLOBE_RADIUS, MARKER_DISASTER } from './utils/globeConstants';
import { timeAgo } from '@/utils/formatters';

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return '#ff0040';
    case 'high':
      return '#ff8800';
    case 'medium':
      return '#ffbb33';
    case 'low':
      return '#44cc88';
    default:
      return '#6b7280';
  }
}

const beaconHeights: Record<string, number> = {
  low: 0.03,
  medium: 0.05,
  high: 0.08,
  critical: 0.12,
};

interface DisasterData {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: string;
  severity: string;
  country: string;
  time: string;
}

function DisasterPoint({ id, lat, lng, title, type, severity, country, time }: DisasterData) {
  const groupRef = useRef<THREE.Group>(null!);
  const diamondRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  const color = getSeverityColor(severity);
  const threeColor = useMemo(() => new THREE.Color(color), [color]);
  const beaconH = beaconHeights[severity] || 0.05;

  const surfacePos = useMemo(
    () => latLngToPosition(lat, lng, GLOBE_RADIUS + MARKER_DISASTER.floatHeight),
    [lat, lng],
  );
  const normal = useMemo(() => latLngToNormal(lat, lng), [lat, lng]);
  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    return q;
  }, [normal]);

  useFrame(({ clock }) => {
    if (!diamondRef.current) return;
    const t = clock.getElapsedTime();
    diamondRef.current.position.y = 0.01 + Math.sin(t * 2) * 0.003;
    if (severity === 'critical') {
      const pulse = 0.7 + Math.sin(t * 4) * 0.3;
      (diamondRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
      diamondRef.current.scale.setScalar(1 + Math.sin(t * 4) * 0.15);
    }
  });

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
      <mesh ref={diamondRef} rotation={[0, 0, Math.PI / 4]}>
        <octahedronGeometry args={[MARKER_DISASTER.radius, 0]} />
        <meshBasicMaterial color={threeColor} transparent opacity={0.85} />
      </mesh>

      <mesh position={[0, beaconH / 2, 0]}>
        <cylinderGeometry
          args={[MARKER_DISASTER.beaconRadius, MARKER_DISASTER.beaconRadius, beaconH, 4]}
        />
        <meshBasicMaterial color={threeColor} transparent opacity={0.4} />
      </mesh>

      {hovered && (
        <Html
          position={[0, beaconH + 0.03, 0]}
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
              maxWidth: 260,
            }}
          >
            <div style={{ color, fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
              ⚠ {severity}
            </div>
            <div style={{ marginTop: 2, fontWeight: 600, whiteSpace: 'normal' }}>{title}</div>
            <div style={{ marginTop: 4, color: '#94a3b8', fontSize: 11 }}>
              {type} · {country} · {timeAgo(time)}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

export function DisasterMarkers() {
  const events = useEventStore((s) => s.events);
  const activeLayer = useUIStore((s) => s.mapView);
  const show = activeLayer === 'markers' || activeLayer === 'heatmap';

  const disasters = useMemo(() => {
    const seen = new Set<string>();
    return events
      .filter((e) => {
        if (
          e.category === 'natural_disaster' ||
          !['conflict', 'cyber', 'health', 'environmental'].includes(e.category)
        )
          return false;
        if (seen.has(e.id)) return false;
        seen.add(e.id);
        return true;
      })
      .map((e, i) => ({
        id: `dis-${e.id}-${i}`,
        lat: e.location.lat,
        lng: e.location.lng,
        title: e.title,
        type: e.category.replace('_', ' '),
        severity: e.severity,
        country: e.location.name || 'Unknown',
        time: e.timestamp,
      }));
  }, [events]);

  if (!show) return null;

  return (
    <group>
      {disasters.map((d) => (
        <DisasterPoint key={d.id} {...d} />
      ))}
    </group>
  );
}
