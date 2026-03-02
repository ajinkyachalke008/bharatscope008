import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTelemetryStore } from '../../store/telemetryStore';
import { latLngToVector3, latLngToNormal } from './utils/coordinates';
import { TrackedEntity } from '@worldmonitor/shared';

const MAX_ASSETS = 2000;
const tempMatrix = new THREE.Matrix4();
const tempColor = new THREE.Color();
const tempPosition = new THREE.Vector3();
const tempRotation = new THREE.Quaternion();
const tempScale = new THREE.Vector3();

export function AssetLayer() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const entities = useTelemetryStore((state) => state.entities);
  const initialize = useTelemetryStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Create a simple, low-poly plane geometry (a diamond/arrow shape)
  const planeGeometry = useMemo(() => {
    const geometry = new THREE.ConeGeometry(0.005, 0.02, 3);
    geometry.rotateX(Math.PI / 2); // Point along Z
    return geometry;
  }, []);

  // Update instanced mesh matrices
  useFrame(() => {
    if (!meshRef.current) return;

    const entityList = Array.from(entities.values());
    const count = Math.min(entityList.length, MAX_ASSETS);

    for (let i = 0; i < count; i++) {
      const entity = entityList[i];

      // Position on sphere (radius 1 for Earth + slight offset for altitude)
      // Altitude is in meters, so we scale it. Earth radius is ~6371km.
      // We'll use a very exaggerated altitude scale for visibility.
      const altitudeScale = 0.000005; // Exaggerated
      const radius = 1.002 + entity.position.alt * altitudeScale;

      const pos = latLngToVector3(entity.position.lat, entity.position.lng, radius);
      tempPosition.set(pos.x, pos.y, pos.z);

      // Orientation
      // 1. Point away from center (normal)
      const normal = latLngToNormal(entity.position.lat, entity.position.lng);

      // 2. Rotate to align with heading
      // This is slightly complex on a globe. We'll use lookAt for now to simplify.
      // A better way is to construct a basis matrix.
      tempMatrix.lookAt(tempPosition, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));
      // Then apply heading rotation...
      // For now, let's just use a simpler orientation:
      tempRotation.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      tempScale.set(1, 1, 1);
      if (entity.domain === 'VESSEL') tempScale.set(1.5, 0.5, 2); // Vessels are different shapes

      tempMatrix.compose(tempPosition, tempRotation, tempScale);
      meshRef.current.setMatrixAt(i, tempMatrix);

      // Color based on classification
      if (entity.classification === 'MILITARY') {
        tempColor.set('#ff0033'); // Tactical Red
      } else if (entity.classification === 'GOVERNMENT') {
        tempColor.set('#ffaa00'); // Alert Orange
      } else {
        tempColor.set('#00f2ff'); // Cyan
      }
      meshRef.current.setColorAt(i, tempColor);
    }

    meshRef.current.count = count;
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[planeGeometry, undefined, MAX_ASSETS]}
      frustumCulled={false}
    >
      <meshPhongMaterial
        shininess={100}
        specular="#ffffff"
        emissive="#000000"
        transparent
        opacity={0.9}
      />
    </instancedMesh>
  );
}
