export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function isWithinBounds(
  lat: number,
  lng: number,
  bounds: { north: number; south: number; east: number; west: number },
): boolean {
  return lat <= bounds.north && lat >= bounds.south && lng <= bounds.east && lng >= bounds.west;
}

export function getRegionForCoordinates(lat: number, lng: number): string {
  if (lat > 15 && lat < 72 && lng > -170 && lng < -50) return 'North America';
  if (lat > -60 && lat <= 15 && lng > -90 && lng < -30) return 'South America';
  if (lat > 35 && lat < 72 && lng > -25 && lng < 45) return 'Europe';
  if (lat > 12 && lat <= 42 && lng > 25 && lng < 65) return 'Middle East';
  if (lat > -40 && lat < 38 && lng > -20 && lng < 55) return 'Africa';
  if (lat > 30 && lat < 55 && lng >= 45 && lng < 90) return 'Central Asia';
  if (lat > 18 && lat < 55 && lng >= 90 && lng < 150) return 'East Asia';
  if (lat > 5 && lat <= 38 && lng >= 65 && lng < 90) return 'South Asia';
  if (lat > -15 && lat <= 25 && lng >= 90 && lng < 155) return 'Southeast Asia';
  if (lat > -50 && lat < 0 && lng >= 110 && lng < 180) return 'Oceania';
  return 'Other';
}
