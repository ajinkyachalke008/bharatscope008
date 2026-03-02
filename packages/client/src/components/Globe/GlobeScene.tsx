import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, AdaptiveDpr, Preload } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

import { Earth } from './Earth';
import { Atmosphere } from './Atmosphere';
import { CloudLayer } from './CloudLayer';
import { StarField } from './StarField';
import { EarthquakeMarkers } from './EarthquakeMarkers';
import { DisasterMarkers } from './DisasterMarkers';
import { WeatherMarkers } from './WeatherMarkers';
import { AssetLayer } from './AssetLayer';
import { GlobeHUD } from './GlobeHUD';
import { CAMERA, COLORS } from './utils/globeConstants';
import { getSunDirection } from './utils/coordinates';

import './GlobeScene.css';

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="#111827" wireframe />
    </mesh>
  );
}

function Sun() {
  const dir = getSunDirection();
  const sunPos: [number, number, number] = [dir.x * 10, dir.y * 10, dir.z * 10];

  return (
    <>
      <directionalLight position={sunPos} intensity={2.0} color={COLORS.sunLight} />
      <ambientLight intensity={0.12} color={COLORS.ambientLight} />
      <hemisphereLight color="#0044ff" groundColor="#000022" intensity={0.08} />
    </>
  );
}

function Scene() {
  return (
    <>
      <Sun />
      <StarField count={6000} radius={50} />

      <Suspense fallback={<LoadingFallback />}>
        <Earth />
        <CloudLayer />
      </Suspense>

      <Atmosphere />

      <EarthquakeMarkers />
      <DisasterMarkers />
      <WeatherMarkers />
      <AssetLayer />

      <EffectComposer>
        <Bloom intensity={0.35} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.1} darkness={0.4} />
      </EffectComposer>

      <OrbitControls
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        minDistance={CAMERA.minDistance}
        maxDistance={CAMERA.maxDistance}
        minPolarAngle={0.3}
        maxPolarAngle={2.84}
      />

      <AdaptiveDpr pixelated />
      <Preload all />
    </>
  );
}

export function GlobeScene() {
  return (
    <div className="globe-container">
      <Canvas
        camera={{
          position: CAMERA.initialPosition,
          fov: CAMERA.fov,
          near: CAMERA.near,
          far: CAMERA.far,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          preserveDrawingBuffer: true,
        }}
        dpr={[1, 1.5]}
        style={{ background: '#000005' }}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.warn('WebGL context lost — attempting restore');
          });
          canvas.addEventListener('webglcontextrestored', () => {
            console.info('WebGL context restored');
          });
        }}
      >
        <Scene />
      </Canvas>
      <GlobeHUD />
    </div>
  );
}
