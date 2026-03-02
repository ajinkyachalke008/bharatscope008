import { useMemo } from 'react';
import * as THREE from 'three';
import { atmosphereVertexShader, atmosphereFragmentShader } from './shaders/atmosphereShader';
import { glowVertexShader, glowFragmentShader } from './shaders/glowShader';
import { ATMOSPHERE_INNER_RADIUS, ATMOSPHERE_OUTER_RADIUS, COLORS } from './utils/globeConstants';

export function Atmosphere() {
  const innerUniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color(...COLORS.atmosphereInner) },
      intensity: { value: 0.7 },
      power: { value: 5.0 },
    }),
    [],
  );

  const outerUniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color(...COLORS.atmosphereOuter) },
      intensity: { value: 0.2 },
      falloff: { value: 3.5 },
    }),
    [],
  );

  return (
    <>
      <mesh renderOrder={1}>
        <sphereGeometry args={[ATMOSPHERE_INNER_RADIUS, 64, 64]} />
        <shaderMaterial
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          uniforms={innerUniforms}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh renderOrder={-1}>
        <sphereGeometry args={[ATMOSPHERE_OUTER_RADIUS, 48, 48]} />
        <shaderMaterial
          vertexShader={glowVertexShader}
          fragmentShader={glowFragmentShader}
          uniforms={outerUniforms}
          transparent
          depthWrite={false}
          side={THREE.FrontSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
}
