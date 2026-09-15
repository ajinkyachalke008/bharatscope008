export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export interface MapCluster {
  id: string;
  lat: number;
  lng: number;
  count: number;
  categories: Record<string, number>;
  maxSeverity: string;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

export interface RegionData {
  id: string;
  name: string;
  eventCount: number;
  threatLevel: number;
  topCategory: string;
  coordinates: [number, number];
}
