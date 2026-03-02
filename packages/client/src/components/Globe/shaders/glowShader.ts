export const glowVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const glowFragmentShader = /* glsl */ `
  uniform vec3 glowColor;
  uniform float intensity;
  uniform float falloff;

  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 viewDir = normalize(-vPosition);
    float rim = 1.0 - dot(viewDir, vNormal);
    float glow = pow(rim, falloff) * intensity;
    gl_FragColor = vec4(glowColor, glow * smoothstep(0.0, 1.0, rim));
  }
`;
