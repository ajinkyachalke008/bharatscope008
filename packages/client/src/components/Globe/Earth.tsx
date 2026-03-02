import { useRef, useMemo, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { earthVertexShader, earthFragmentShader } from './shaders/earthShader';
import { getSunDirection } from './utils/coordinates';
import { GLOBE_RADIUS, SPHERE_SEGMENTS, TEXTURES } from './utils/globeConstants';

// Create a loading manager with crossOrigin support
const manager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(manager);
textureLoader.setCrossOrigin('anonymous');

export function Earth() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const [texturesLoaded, setTexturesLoaded] = useState(false);

  const [dayMap, nightMap, bumpMap, specularMap] = useLoader(
    THREE.TextureLoader,
    [TEXTURES.day, TEXTURES.night, TEXTURES.bump, TEXTURES.specular],
    (loader) => {
      loader.setCrossOrigin('anonymous');
    },
  );

  useMemo(() => {
    if (dayMap && nightMap && bumpMap && specularMap) {
      [dayMap, nightMap, bumpMap, specularMap].forEach((tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(
          8,
          new THREE.WebGLRenderer().capabilities?.getMaxAnisotropy?.() || 4,
        );
      });
      setTexturesLoaded(true);
    }
  }, [dayMap, nightMap, bumpMap, specularMap]);

  const uniforms = useMemo(
    () => ({
      dayMap: { value: dayMap },
      nightMap: { value: nightMap },
      bumpMap: { value: bumpMap },
      specularMap: { value: specularMap },
      sunDirection: { value: getSunDirection() },
      bumpScale: { value: 0.06 },
      nightIntensity: { value: 1.4 },
      specularIntensity: { value: 1.2 },
    }),
    [dayMap, nightMap, bumpMap, specularMap],
  );

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.sunDirection.value.copy(getSunDirection());
    }
  });

  return (
    <mesh ref={meshRef} renderOrder={0}>
      <sphereGeometry args={[GLOBE_RADIUS, SPHERE_SEGMENTS, SPHERE_SEGMENTS]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={earthVertexShader}
        fragmentShader={earthFragmentShader}
        uniforms={uniforms}
        transparent={false}
      />
    </mesh>
  );
}
