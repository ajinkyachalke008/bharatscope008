const BASE_URL = import.meta.env.VITE_API_URL || '';

async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
  return res.json();
}

// ─── Demo / fallback data ────────────────────────────────────
const DEMO_EVENTS = [
  { id: 'e1', title: 'Earthquake detected near Indonesia', category: 'natural_disaster', severity: 'high', status: 'active', location: { name: 'Jakarta, Indonesia', lat: -6.2, lon: 106.8 }, timestamp: new Date(Date.now() - 3600000).toISOString(), source: 'USGS', summary: 'A 6.1 magnitude earthquake was detected off the coast of Indonesia.' },
  { id: 'e2', title: 'Cyber attack on European bank', category: 'cyber', severity: 'critical', status: 'active', location: { name: 'Frankfurt, Germany', lat: 50.1, lon: 8.7 }, timestamp: new Date(Date.now() - 7200000).toISOString(), source: 'CISA', summary: 'A sophisticated ransomware attack targeting financial infrastructure.' },
  { id: 'e3', title: 'Political unrest in capital', category: 'political', severity: 'medium', status: 'monitoring', location: { name: 'Brasilia, Brazil', lat: -15.8, lon: -47.9 }, timestamp: new Date(Date.now() - 10800000).toISOString(), source: 'Reuters', summary: 'Large-scale protests reported in the capital city.' },
  { id: 'e4', title: 'Market volatility spike', category: 'economic', severity: 'high', status: 'active', location: { name: 'New York, USA', lat: 40.7, lon: -74.0 }, timestamp: new Date(Date.now() - 5400000).toISOString(), source: 'Bloomberg', summary: 'Major indices showing unusual volatility patterns.' },
  { id: 'e5', title: 'Public health advisory', category: 'health', severity: 'medium', status: 'active', location: { name: 'Geneva, Switzerland', lat: 46.2, lon: 6.1 }, timestamp: new Date(Date.now() - 14400000).toISOString(), source: 'WHO', summary: 'New infectious disease outbreak reported in Southeast Asia.' },
  { id: 'e6', title: 'Environmental spill detected', category: 'environmental', severity: 'high', status: 'active', location: { name: 'Houston, USA', lat: 29.8, lon: -95.4 }, timestamp: new Date(Date.now() - 1800000).toISOString(), source: 'EPA', summary: 'Chemical spill detected near industrial area.' },
  { id: 'e7', title: 'Armed conflict escalation', category: 'conflict', severity: 'critical', status: 'active', location: { name: 'Kyiv, Ukraine', lat: 50.4, lon: 30.5 }, timestamp: new Date(Date.now() - 900000).toISOString(), source: 'OSINT', summary: 'Increased military activity detected near the border region.' },
  { id: 'e8', title: 'Tech infrastructure outage', category: 'technology', severity: 'medium', status: 'resolved', location: { name: 'San Francisco, USA', lat: 37.8, lon: -122.4 }, timestamp: new Date(Date.now() - 21600000).toISOString(), source: 'Downdetector', summary: 'Major cloud provider experiencing service disruptions.' },
];

const DEMO_STATS = {
  total: 247,
  last24h: 42,
  lastHour: 8,
  bySeverity: { critical: 12, high: 35, medium: 89, low: 78, info: 33 },
  byCategory: { conflict: 28, natural_disaster: 34, political: 41, economic: 52, health: 23, cyber: 19, environmental: 18, technology: 22, social: 10 },
  byStatus: { active: 124, monitoring: 67, resolved: 56 },
};

const DEMO_FEEDS = [
  { id: 'f1', title: 'Breaking: Major diplomatic summit announced', type: 'news', category: 'political', severity: 'medium', source: 'Reuters', timestamp: new Date(Date.now() - 1200000).toISOString(), summary: 'World leaders to convene emergency session.', credibility: 0.95 },
  { id: 'f2', title: 'Oil prices surge amid tensions', type: 'news', category: 'economic', severity: 'high', source: 'Bloomberg', timestamp: new Date(Date.now() - 2400000).toISOString(), summary: 'Crude oil prices jump 5% on supply concerns.', credibility: 0.92 },
  { id: 'f3', title: 'Satellite imagery reveals new activity', type: 'intelligence', category: 'conflict', severity: 'critical', source: 'Bellingcat', timestamp: new Date(Date.now() - 3600000).toISOString(), summary: 'Open-source satellite analysis shows military movements.', credibility: 0.88 },
  { id: 'f4', title: 'AI breakthrough in climate modeling', type: 'news', category: 'technology', severity: 'info', source: 'Nature', timestamp: new Date(Date.now() - 7200000).toISOString(), summary: 'New machine learning model improves prediction accuracy by 40%.', credibility: 0.97 },
  { id: 'f5', title: 'Humanitarian corridor established', type: 'government', category: 'social', severity: 'medium', source: 'UN', timestamp: new Date(Date.now() - 4800000).toISOString(), summary: 'New aid route opened for civilian assistance.', credibility: 0.93 },
];

const DEMO_ALERTS = [
  { id: 'a1', title: 'Elevated threat level: East Asia', level: 'warning', message: 'Increased military activity detected across multiple sensors.', source: 'SIGINT', timestamp: new Date(Date.now() - 600000).toISOString() },
  { id: 'a2', title: 'Critical infrastructure alert', level: 'critical', message: 'Potential DDoS attack targeting European financial networks.', source: 'CISA', timestamp: new Date(Date.now() - 1800000).toISOString() },
];

const DEMO_REGIONS = [
  { id: 'r1', name: 'East Asia', threatLevel: 72, eventCount: 34 },
  { id: 'r2', name: 'Middle East', threatLevel: 85, eventCount: 48 },
  { id: 'r3', name: 'Europe', threatLevel: 45, eventCount: 29 },
  { id: 'r4', name: 'North America', threatLevel: 28, eventCount: 18 },
  { id: 'r5', name: 'South Asia', threatLevel: 61, eventCount: 22 },
  { id: 'r6', name: 'Africa', threatLevel: 55, eventCount: 31 },
  { id: 'r7', name: 'South America', threatLevel: 38, eventCount: 15 },
  { id: 'r8', name: 'Oceania', threatLevel: 12, eventCount: 5 },
];

// ─── API with fallback ───────────────────────────────────────
export const api = {
  events: {
    list: async (params?: Record<string, string>) => {
      try {
        return await fetchJSON<{ events: any[]; total: number }>(`/api/events${params ? '?' + new URLSearchParams(params).toString() : ''}`);
      } catch {
        return { events: DEMO_EVENTS, total: DEMO_EVENTS.length };
      }
    },
    get: (id: string) => fetchJSON<any>(`/api/events/${id}`),
    stats: async () => {
      try {
        return await fetchJSON<any>('/api/events/stats');
      } catch {
        return DEMO_STATS;
      }
    },
  },
  feeds: {
    list: async (params?: Record<string, string>) => {
      try {
        return await fetchJSON<{ feeds: any[]; total: number }>(`/api/feeds${params ? '?' + new URLSearchParams(params).toString() : ''}`);
      } catch {
        return { feeds: DEMO_FEEDS, total: DEMO_FEEDS.length };
      }
    },
    alerts: async () => {
      try {
        return await fetchJSON<any[]>('/api/feeds/alerts');
      } catch {
        return DEMO_ALERTS;
      }
    },
    acknowledgeAlert: (id: string) =>
      fetchJSON<{ success: boolean }>(`/api/feeds/alerts/${id}/acknowledge`, { method: 'POST' }),
  },
  geo: {
    regions: async () => {
      try {
        return await fetchJSON<any[]>('/api/geo/regions');
      } catch {
        return DEMO_REGIONS;
      }
    },
    heatmap: async () => {
      try {
        return await fetchJSON<any[]>('/api/geo/heatmap');
      } catch {
        return [];
      }
    },
  },
  health: () => fetchJSON<any>('/health'),
};
