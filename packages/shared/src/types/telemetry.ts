export type EntityDomain = 'AIRCRAFT' | 'VESSEL';
export type EntityClassification = 'MILITARY' | 'GOVERNMENT' | 'CIVILIAN' | 'UNKNOWN';

export interface TrackedEntity {
  id: string; // icao24 for aircraft, MMSI for vessels
  domain: EntityDomain;
  classification: EntityClassification;
  callsign: string;
  country: string;

  position: {
    lat: number;
    lng: number;
    alt: number; // meters
  };

  velocity: {
    speed: number; // knots
    heading: number; // degrees
    verticalRate: number; // m/s
  };

  lastUpdate: string; // ISO timestamp
  isStale: boolean;

  // Intelligence context
  isSanctioned?: boolean;
  isOnWatchlist?: boolean;
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export interface TelemetryUpdate {
  entities: TrackedEntity[];
  timestamp: string;
}

export interface WeatherFrame {
  timestamp: string;
  radarTileUrl: string;
  windGridUrl?: string;
}

export interface MediaHotspot {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  title: string;
  intensity: number; // 0-1
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  itemCount: number;
  hasLiveStream: boolean;
  primaryCategory: string;
  recentFeedIds: string[];
}
