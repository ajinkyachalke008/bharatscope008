export const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
  info: '#6b7280',
};

export const CATEGORY_COLORS: Record<string, string> = {
  conflict: '#ef4444',
  natural_disaster: '#f97316',
  political: '#8b5cf6',
  economic: '#10b981',
  health: '#06b6d4',
  cyber: '#6366f1',
  environmental: '#22c55e',
  technology: '#3b82f6',
  social: '#ec4899',
};

export const CATEGORY_ICONS: Record<string, string> = {
  conflict: '⚔️',
  natural_disaster: '🌍',
  political: '🏛️',
  economic: '📊',
  health: '🏥',
  cyber: '🔒',
  environmental: '🌿',
  technology: '💻',
  social: '👥',
};

export const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low', 'info'] as const;

export const DEFAULT_MAP_VIEWPORT = {
  latitude: 20,
  longitude: 0,
  zoom: 2,
  bearing: 0,
  pitch: 0,
};

export const REGIONS = [
  'North America',
  'South America',
  'Europe',
  'Middle East',
  'Africa',
  'Central Asia',
  'East Asia',
  'South Asia',
  'Southeast Asia',
  'Oceania',
] as const;
