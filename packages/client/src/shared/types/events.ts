export type EventCategory =
  | 'conflict'
  | 'military'
  | 'natural_disaster'
  | 'political'
  | 'economic'
  | 'health'
  | 'cyber'
  | 'environmental'
  | 'technology'
  | 'social';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type EventStatus = 'active' | 'monitoring' | 'resolved' | 'archived';

export interface MonitorEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  severity: SeverityLevel;
  status: EventStatus;
  location: GeoLocation;
  timestamp: string;
  updatedAt: string;
  source: string;
  sourceUrl?: string;
  tags: string[];
  impactRadius?: number;
  casualties?: number;
  verified: boolean;
  relatedEventIds?: string[];
}

export interface GeoLocation {
  lat: number;
  lng: number;
  name: string;
  country?: string;
  region?: string;
}

export interface EventFilter {
  categories?: EventCategory[];
  severities?: SeverityLevel[];
  statuses?: EventStatus[];
  dateRange?: { start: string; end: string };
  search?: string;
  region?: string;
  verified?: boolean;
}

export interface EventStats {
  total: number;
  byCategory: Record<EventCategory, number>;
  bySeverity: Record<SeverityLevel, number>;
  byStatus: Record<EventStatus, number>;
  last24h: number;
  lastHour: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}
