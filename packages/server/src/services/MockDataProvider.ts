import { v4 as uuid } from 'uuid';
import type {
  MonitorEvent,
  EventCategory,
  SeverityLevel,
  FeedItem,
  FeedType,
  SignalAlert,
  EventStats,
} from '@worldmonitor/shared';
import { getRegionForCoordinates } from '@worldmonitor/shared';

const CATEGORIES: EventCategory[] = [
  'conflict',
  'military',
  'natural_disaster',
  'political',
  'economic',
  'health',
  'cyber',
  'environmental',
  'technology',
  'social',
];

const SEVERITIES: SeverityLevel[] = ['critical', 'high', 'medium', 'low', 'info'];

const FEED_TYPES: FeedType[] = [
  'news',
  'social',
  'government',
  'sensor',
  'satellite',
  'intelligence',
];

interface LocationTemplate {
  name: string;
  country: string;
  lat: number;
  lng: number;
  region: string;
}

const LOCATIONS: LocationTemplate[] = [
  { name: 'Kyiv', country: 'Ukraine', lat: 50.45, lng: 30.52, region: 'Europe' },
  { name: 'Taipei', country: 'Taiwan', lat: 25.03, lng: 121.56, region: 'East Asia' },
  { name: 'Tehran', country: 'Iran', lat: 35.69, lng: 51.39, region: 'Middle East' },
  { name: 'Lagos', country: 'Nigeria', lat: 6.52, lng: 3.38, region: 'Africa' },
  { name: 'São Paulo', country: 'Brazil', lat: -23.55, lng: -46.63, region: 'South America' },
  { name: 'Washington DC', country: 'USA', lat: 38.91, lng: -77.04, region: 'North America' },
  { name: 'London', country: 'UK', lat: 51.51, lng: -0.13, region: 'Europe' },
  { name: 'Tokyo', country: 'Japan', lat: 35.68, lng: 139.69, region: 'East Asia' },
  { name: 'New Delhi', country: 'India', lat: 28.61, lng: 77.21, region: 'South Asia' },
  { name: 'Beijing', country: 'China', lat: 39.91, lng: 116.4, region: 'East Asia' },
  { name: 'Moscow', country: 'Russia', lat: 55.75, lng: 37.62, region: 'Europe' },
  { name: 'Cairo', country: 'Egypt', lat: 30.04, lng: 31.24, region: 'Middle East' },
  { name: 'Nairobi', country: 'Kenya', lat: -1.29, lng: 36.82, region: 'Africa' },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.21, lng: 106.85, region: 'Southeast Asia' },
  { name: 'Seoul', country: 'South Korea', lat: 37.57, lng: 126.98, region: 'East Asia' },
  { name: 'Ankara', country: 'Turkey', lat: 39.93, lng: 32.86, region: 'Middle East' },
  { name: 'Kabul', country: 'Afghanistan', lat: 34.53, lng: 69.17, region: 'Central Asia' },
  { name: 'Bogotá', country: 'Colombia', lat: 4.71, lng: -74.07, region: 'South America' },
  { name: 'Sydney', country: 'Australia', lat: -33.87, lng: 151.21, region: 'Oceania' },
  { name: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.4, region: 'Europe' },
  { name: 'Riyadh', country: 'Saudi Arabia', lat: 24.71, lng: 46.67, region: 'Middle East' },
  { name: 'Mexico City', country: 'Mexico', lat: 19.43, lng: -99.13, region: 'North America' },
  { name: 'Manila', country: 'Philippines', lat: 14.6, lng: 120.98, region: 'Southeast Asia' },
  { name: 'Islamabad', country: 'Pakistan', lat: 33.69, lng: 73.04, region: 'South Asia' },
  { name: 'Bangkok', country: 'Thailand', lat: 13.76, lng: 100.5, region: 'Southeast Asia' },
  { name: 'Paris', country: 'France', lat: 48.86, lng: 2.35, region: 'Europe' },
  { name: 'Lima', country: 'Peru', lat: -12.05, lng: -77.04, region: 'South America' },
  { name: 'Addis Ababa', country: 'Ethiopia', lat: 9.02, lng: 38.75, region: 'Africa' },
  { name: 'Dhaka', country: 'Bangladesh', lat: 23.81, lng: 90.41, region: 'South Asia' },
  { name: 'Rome', country: 'Italy', lat: 41.9, lng: 12.5, region: 'Europe' },
];

const EVENT_TEMPLATES: Record<EventCategory, string[]> = {
  conflict: [
    'Armed clashes reported near border region',
    'Military operations intensify in contested area',
    'Ceasefire negotiations begin amid escalating tensions',
    'Drone strike reported in conflict zone',
    'Refugee displacement surge following hostilities',
  ],
  military: [
    'Rapid deployment force mobilized to theater',
    'Naval assets repositioned to contested waters',
    'Air defense systems activated in sector',
    'Ground forces cross established buffer zone',
    'Joint military exercise commences near disputed territory',
  ],
  natural_disaster: [
    'Magnitude {n} earthquake detected',
    'Severe flooding displaces thousands',
    'Category {n} hurricane approaching coastline',
    'Volcanic eruption alert issued',
    'Wildfire threatens populated areas',
  ],
  political: [
    'Emergency session of parliament called',
    'Sanctions package announced against regime',
    'Mass protests erupt over election results',
    'Diplomatic relations severed between nations',
    'Constitutional crisis deepens after ruling',
  ],
  economic: [
    'Currency devaluation triggers market panic',
    'Central bank implements emergency rate hike',
    'Supply chain disruption affects global trade',
    'Major tech sector layoffs announced',
    'Energy prices surge on supply concerns',
  ],
  health: [
    'Novel pathogen detected in population cluster',
    'WHO elevates disease threat assessment level',
    'Hospital capacity critical in affected region',
    'Vaccine distribution campaign launched',
    'Pandemic preparedness protocols activated',
  ],
  cyber: [
    'Critical infrastructure targeted in cyberattack',
    'State-sponsored hacking group identified',
    'Data breach exposes millions of records',
    'Ransomware attack cripples government systems',
    'Zero-day vulnerability exploited in the wild',
  ],
  environmental: [
    'Oil spill detected in marine sanctuary',
    'Deforestation rate accelerates in critical region',
    'Air quality reaches hazardous levels',
    'Glacier retreat measured at record pace',
    'Coral reef bleaching event confirmed',
  ],
  technology: [
    'AI regulation framework proposed by coalition',
    'Satellite network disruption reported',
    'Autonomous weapons system test conducted',
    'Quantum computing milestone achieved',
    'Social media platform faces global outage',
  ],
  social: [
    'Mass migration wave strains border infrastructure',
    'Civil unrest escalates in major city',
    'Humanitarian corridor established for aid',
    'Labor strikes disrupt critical services',
    'Food security crisis declared in region',
  ],
};

const NEWS_SOURCES = [
  'Reuters',
  'AP News',
  'BBC World',
  'Al Jazeera',
  'CNN',
  'DW News',
  'NHK World',
  'France 24',
  'TASS',
  'Xinhua',
  'The Guardian',
  'Bloomberg',
  'Financial Times',
  'OSINT Aggregator',
  'Bellingcat',
  'Sentinel Hub',
  'GDELT Project',
  'ACLED',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickWeighted<T>(arr: readonly T[], weights: number[]): T {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}

function jitter(base: number, range: number): number {
  return base + (Math.random() - 0.5) * range;
}

function generateEventTitle(category: EventCategory): string {
  const templates = EVENT_TEMPLATES[category];
  const template = pick(templates);
  return template.replace('{n}', String(Math.floor(Math.random() * 5) + 3));
}

export class MockDataProvider {
  private events: MonitorEvent[] = [];
  private feeds: FeedItem[] = [];
  private alerts: SignalAlert[] = [];

  constructor() {
    this.generateInitialData();
  }

  private generateInitialData(): void {
    const eventCount = 50 + Math.floor(Math.random() * 30);
    for (let i = 0; i < eventCount; i++) {
      this.events.push(this.createRandomEvent(this.randomPastTimestamp()));
    }
    this.events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    for (let i = 0; i < 100; i++) {
      this.feeds.push(this.createRandomFeed(this.randomPastTimestamp()));
    }
    this.feeds.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    for (let i = 0; i < 5; i++) {
      this.alerts.push(this.createRandomAlert());
    }
  }

  private randomPastTimestamp(maxHoursAgo = 48): string {
    const now = Date.now();
    const ago = Math.random() * maxHoursAgo * 60 * 60 * 1000;
    return new Date(now - ago).toISOString();
  }

  private createRandomEvent(timestamp?: string): MonitorEvent {
    const loc = pick(LOCATIONS);
    const category = pickWeighted(CATEGORIES, [15, 12, 10, 8, 10, 12, 6, 5, 8]);
    const severity = pickWeighted(SEVERITIES, [5, 15, 30, 30, 20]);

    return {
      id: uuid(),
      title: generateEventTitle(category),
      description: `Monitoring situation in ${loc.name}, ${loc.country}. Multiple sources confirm developing situation requiring attention.`,
      category,
      severity,
      status: pickWeighted(
        ['active', 'monitoring', 'resolved', 'archived'] as const,
        [40, 35, 15, 10],
      ),
      location: {
        lat: jitter(loc.lat, 2),
        lng: jitter(loc.lng, 2),
        name: loc.name,
        country: loc.country,
        region: loc.region,
      },
      timestamp: timestamp || new Date().toISOString(),
      updatedAt: timestamp || new Date().toISOString(),
      source: pick(NEWS_SOURCES),
      tags: [category, loc.region.toLowerCase().replace(/\s+/g, '-'), severity],
      verified: Math.random() > 0.3,
      impactRadius: Math.random() > 0.5 ? Math.floor(Math.random() * 500) + 10 : undefined,
    };
  }

  private createRandomFeed(timestamp?: string): FeedItem {
    const loc = pick(LOCATIONS);
    const category = pick(CATEGORIES);
    const feedType = pick(FEED_TYPES);

    return {
      id: uuid(),
      type: feedType,
      title: generateEventTitle(category as EventCategory),
      summary: `Latest intelligence from ${loc.name} region. Source reporting indicates significant developments related to ${category.replace('_', ' ')} situation.`,
      source: pick(NEWS_SOURCES),
      sourceUrl: `https://example.com/article/${uuid().slice(0, 8)}`,
      timestamp: timestamp || new Date().toISOString(),
      category,
      severity: pick(SEVERITIES),
      location: { lat: jitter(loc.lat, 1), lng: jitter(loc.lng, 1), name: loc.name },
      tags: [category, feedType, loc.region.toLowerCase().replace(/\s+/g, '-')],
      sentiment: Math.random() * 2 - 1,
      credibility: Math.random() * 0.5 + 0.5,
    };
  }

  private createRandomAlert(): SignalAlert {
    const levels = ['critical', 'warning', 'watch', 'info'] as const;
    const level = pickWeighted(levels, [5, 20, 40, 35]);

    const titles: Record<string, string[]> = {
      critical: [
        'CRITICAL: Mass casualty event detected',
        'CRITICAL: Nuclear facility incident reported',
        'CRITICAL: Active conflict escalation',
      ],
      warning: [
        'WARNING: Elevated threat level in region',
        'WARNING: Unusual military movement detected',
        'WARNING: Infrastructure attack imminent',
      ],
      watch: [
        'WATCH: Diplomatic tensions rising',
        'WATCH: Severe weather system forming',
        'WATCH: Cyber activity spike detected',
      ],
      info: [
        'INFO: Scheduled military exercise reported',
        'INFO: Diplomatic summit announced',
        'INFO: Routine satellite pass detected',
      ],
    };

    return {
      id: uuid(),
      level,
      title: pick(titles[level]),
      message:
        'Automated monitoring system has detected an anomaly requiring attention. Analysts are reviewing available intelligence sources.',
      timestamp: new Date().toISOString(),
      source: pick(['SIGINT', 'OSINT', 'GEOINT', 'HUMINT', 'MASINT']),
      acknowledged: false,
    };
  }

  getEvents(
    filter?: Partial<{
      categories: string[];
      severities: string[];
      statuses: string[];
      limit: number;
      offset: number;
      search: string;
    }>,
  ): { events: MonitorEvent[]; total: number } {
    let filtered = [...this.events];

    if (filter?.categories?.length) {
      filtered = filtered.filter((e) => filter.categories!.includes(e.category));
    }
    if (filter?.severities?.length) {
      filtered = filtered.filter((e) => filter.severities!.includes(e.severity));
    }
    if (filter?.statuses?.length) {
      filtered = filtered.filter((e) => filter.statuses!.includes(e.status));
    }
    if (filter?.search) {
      const s = filter.search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(s) ||
          e.description.toLowerCase().includes(s) ||
          e.location.name.toLowerCase().includes(s),
      );
    }

    const total = filtered.length;
    const offset = filter?.offset || 0;
    const limit = filter?.limit || 50;

    return { events: filtered.slice(offset, offset + limit), total };
  }

  getEventById(id: string): MonitorEvent | undefined {
    return this.events.find((e) => e.id === id);
  }

  getStats(): EventStats {
    const now = Date.now();
    const last24h = this.events.filter(
      (e) => now - new Date(e.timestamp).getTime() < 86400000,
    ).length;
    const lastHour = this.events.filter(
      (e) => now - new Date(e.timestamp).getTime() < 3600000,
    ).length;

    const byCategory = {} as Record<EventCategory, number>;
    const bySeverity = {} as Record<SeverityLevel, number>;
    const byStatus = {} as Record<string, number>;

    for (const cat of CATEGORIES) byCategory[cat] = 0;
    for (const sev of SEVERITIES) bySeverity[sev] = 0;
    for (const st of ['active', 'monitoring', 'resolved', 'archived']) byStatus[st] = 0;

    for (const e of this.events) {
      byCategory[e.category]++;
      bySeverity[e.severity]++;
      byStatus[e.status]++;
    }

    return {
      total: this.events.length,
      byCategory,
      bySeverity,
      byStatus: byStatus as any,
      last24h,
      lastHour,
      trend: lastHour > 5 ? 'increasing' : lastHour > 2 ? 'stable' : 'decreasing',
    };
  }

  getFeeds(limit = 50, offset = 0, type?: string): { feeds: FeedItem[]; total: number } {
    let filtered = this.feeds;
    if (type) filtered = filtered.filter((f) => f.type === type);
    return { feeds: filtered.slice(offset, offset + limit), total: filtered.length };
  }

  getAlerts(): SignalAlert[] {
    return this.alerts.filter((a) => !a.acknowledged);
  }

  acknowledgeAlert(id: string): boolean {
    const alert = this.alerts.find((a) => a.id === id);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  getRegions(): Array<{
    id: string;
    name: string;
    eventCount: number;
    threatLevel: number;
    topCategory: string;
    coordinates: [number, number];
  }> {
    const regionCoords: Record<string, [number, number]> = {
      'North America': [45, -100],
      'South America': [-15, -60],
      Europe: [50, 15],
      'Middle East': [30, 45],
      Africa: [5, 25],
      'Central Asia': [45, 65],
      'East Asia': [35, 115],
      'South Asia': [22, 78],
      'Southeast Asia': [5, 110],
      Oceania: [-25, 140],
    };

    const regionEvents: Record<string, MonitorEvent[]> = {};
    for (const e of this.events) {
      const region = e.location.region || getRegionForCoordinates(e.location.lat, e.location.lng);
      if (!regionEvents[region]) regionEvents[region] = [];
      regionEvents[region].push(e);
    }

    return Object.entries(regionCoords).map(([name, coordinates]) => {
      const events = regionEvents[name] || [];
      const catCount: Record<string, number> = {};
      for (const e of events) catCount[e.category] = (catCount[e.category] || 0) + 1;
      const topCategory = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'info';

      return {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        eventCount: events.length,
        threatLevel: Math.min(
          100,
          events.reduce((sum, e) => {
            const w: Record<string, number> = {
              critical: 20,
              high: 10,
              medium: 5,
              low: 2,
              info: 1,
            };
            return sum + (w[e.severity] || 1);
          }, 0),
        ),
        topCategory,
        coordinates: coordinates as [number, number],
      };
    });
  }

  generateNewEvent(): MonitorEvent {
    const event = this.createRandomEvent();
    this.events.unshift(event);
    if (this.events.length > 200) this.events.pop();
    return event;
  }

  generateNewFeed(): FeedItem {
    const feed = this.createRandomFeed();
    this.feeds.unshift(feed);
    if (this.feeds.length > 500) this.feeds.pop();
    return feed;
  }

  generateNewAlert(): SignalAlert | null {
    if (Math.random() > 0.3) return null;
    const alert = this.createRandomAlert();
    this.alerts.unshift(alert);
    if (this.alerts.length > 50) this.alerts.pop();
    return alert;
  }
}
