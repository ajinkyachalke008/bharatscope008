import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  count?: number;
  radius?: number;
}

export function StarField({ count = 6000, radius = 50 }: Props) {
  const pointsRef = useRef<THREE.Points>(null!);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius + (Math.random() - 0.5) * 20;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      sz[i] = Math.random() * 1.5 + 0.5;
    }

    return [pos, sz];
  }, [count, radius]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const sizeAttr = geo.getAttribute('size') as THREE.BufferAttribute;
    if (!sizeAttr) return;
    const t = clock.getElapsedTime();

    for (let i = 0; i < Math.min(count, 200); i++) {
      const base = sizes[i];
      sizeAttr.setX(i, base * (0.85 + 0.15 * Math.sin(t * 2 + i * 0.3)));
    }
    sizeAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute attach="attributes-size" array={sizes} count={count} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={1.2}
        sizeAttenuation
        transparent
        opacity={0.9}
        color="#ffffff"
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
