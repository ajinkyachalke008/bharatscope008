import * as THREE from 'three';

/**
 * Convert geographic lat/lng to 3D cartesian position on a sphere.
 */
export function latLngToVector3(lat: number, lng: number, radius: number = 1): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/**
 * Return [x, y, z] tuple for direct use in JSX position props.
 */
export function latLngToPosition(
  lat: number,
  lng: number,
  radius: number = 1,
): [number, number, number] {
  const v = latLngToVector3(lat, lng, radius);
  return [v.x, v.y, v.z];
}

/**
 * Get the surface normal at a lat/lng point (points outward from center).
 */
export function latLngToNormal(lat: number, lng: number): THREE.Vector3 {
  return latLngToVector3(lat, lng, 1).normalize();
}

/**
 * Compute sun direction vector from current UTC time.
 */
export function getSunDirection(): THREE.Vector3 {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  );
  const hourUTC = now.getUTCHours() + now.getUTCMinutes() / 60;

  const solarLng = ((12 - hourUTC) / 24) * 360;
  const declination = -23.44 * Math.cos((2 * Math.PI * (dayOfYear + 10)) / 365);

  return latLngToVector3(declination, solarLng, 1).normalize();
}
