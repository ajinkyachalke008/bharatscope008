import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { CLOUD_RADIUS, TEXTURES } from './utils/globeConstants';

export function CloudLayer() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const cloudMap = useLoader(THREE.TextureLoader, TEXTURES.clouds);

  useMemo(() => {
    cloudMap.colorSpace = THREE.SRGBColorSpace;
    cloudMap.anisotropy = 4;
  }, [cloudMap]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <mesh ref={meshRef} renderOrder={2}>
      <sphereGeometry args={[CLOUD_RADIUS, 48, 48]} />
      <meshPhongMaterial
        map={cloudMap}
        transparent
        opacity={0.22}
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.NormalBlending}
      />
    </mesh>
  );
}
