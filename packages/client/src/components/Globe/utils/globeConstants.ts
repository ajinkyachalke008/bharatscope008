export const GLOBE_RADIUS = 1.0;
export const CLOUD_RADIUS = 1.008;
export const ATMOSPHERE_INNER_RADIUS = 1.012;
export const ATMOSPHERE_OUTER_RADIUS = 1.25;

export const SPHERE_SEGMENTS = 64;

export const TEXTURES = {
  day: 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  night: 'https://unpkg.com/three-globe/example/img/earth-night.jpg',
  bump: 'https://unpkg.com/three-globe/example/img/earth-topology.png',
  specular: 'https://unpkg.com/three-globe/example/img/earth-water.png',
  clouds: 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/fair_clouds_4k.png',
};

export const MARKER_EARTHQUAKE = {
  baseRadius: 0.008,
  minRadius: 0.005,
  maxRadius: 0.04,
  floatHeight: 0.005,
  spikeBaseRadius: 0.002,
  spikeTipRadius: 0.0005,
};

export const MARKER_DISASTER = {
  radius: 0.013,
  floatHeight: 0.015,
  beaconRadius: 0.001,
};

export const CAMERA = {
  fov: 45,
  near: 0.1,
  far: 100,
  initialPosition: [0, 0.5, 2.8] as [number, number, number],
  minDistance: 1.15,
  maxDistance: 6.0,
};

export const COLORS = {
  atmosphereInner: [0.3, 0.6, 1.0] as [number, number, number],
  atmosphereOuter: [0.1, 0.4, 1.0] as [number, number, number],
  ambientLight: '#404060',
  sunLight: '#ffffff',
};
