export interface DetectionStats {
  aircraft: number;
  militaryAircraft: number;
  vehicles: number;
  pedestrians: number;
  total: number;
  anomalies: number;
  cycleNumber: number;
  cycleTimeMs: number;
  connectedClients: number;
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: number[];
  };
  properties: {
    id: string;
    category: string;
    subcategory?: string;
    callsign?: string;
    icao24?: string;
    origin_country?: string;
    altitude?: number;
    altitude_feet?: number;
    velocity?: number;
    velocity_knots?: number;
    heading?: number;
    vertical_rate?: number;
    on_ground?: boolean;
    squawk?: string;
    classification?: string;
    is_military?: boolean;
    emergency?: string;
    alert_level?: string;
    anomalies?: string[];
    confidence?: number;
    bounding_box?: number[];
    attributes?: Record<string, unknown>;
    source?: string;
    source_model?: string;
    last_contact?: number;
  };
}

export interface GeoJSONPayload {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
  metadata?: {
    cycle?: number;
    timestamp?: string;
    total_features?: number;
    cycle_duration_ms?: number;
    anomalies?: number;
    system_status?: Record<string, unknown>;
  };
}
