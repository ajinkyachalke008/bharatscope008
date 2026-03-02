export const earthVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldNormal;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const earthFragmentShader = /* glsl */ `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform sampler2D specularMap;
  uniform sampler2D bumpMap;
  uniform vec3 sunDirection;
  uniform float bumpScale;
  uniform float nightIntensity;
  uniform float specularIntensity;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldNormal;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 worldNormal = normalize(vWorldNormal);

    // Bump mapping
    vec2 texelSize = vec2(1.0 / 2048.0);
    float bumpL = texture2D(bumpMap, vUv - vec2(texelSize.x, 0.0)).r;
    float bumpR = texture2D(bumpMap, vUv + vec2(texelSize.x, 0.0)).r;
    float bumpU = texture2D(bumpMap, vUv - vec2(0.0, texelSize.y)).r;
    float bumpD = texture2D(bumpMap, vUv + vec2(0.0, texelSize.y)).r;
    vec3 bumpNormal = normalize(normal + vec3((bumpL - bumpR), (bumpU - bumpD), 0.0) * bumpScale * 15.0);

    // Sun lighting
    float sunDot = dot(worldNormal, sunDirection);
    float diffuse = max(0.0, sunDot);
    float blend = smoothstep(-0.15, 0.25, sunDot);

    vec4 dayColor = texture2D(dayMap, vUv);
    vec4 nightColor = texture2D(nightMap, vUv);

    vec3 litDay = dayColor.rgb * (diffuse * 0.85 + 0.15);
    vec3 litNight = nightColor.rgb * nightIntensity;
    vec3 color = mix(litNight, litDay, blend);

    // Specular highlights on oceans
    float specMask = texture2D(specularMap, vUv).r;
    vec3 viewDir = normalize(-vPosition);
    vec3 reflectDir = reflect(-normalize(mat3(viewMatrix) * sunDirection), bumpNormal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    color += vec3(1.0, 0.95, 0.8) * spec * specMask * specularIntensity * blend;

    // Ambient minimum
    color = max(color, vec3(0.008, 0.01, 0.02));

    gl_FragColor = vec4(color, 1.0);
  }
`;
