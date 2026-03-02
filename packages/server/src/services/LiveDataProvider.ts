import { v4 as uuid } from 'uuid';
import type {
  MonitorEvent,
  FeedItem,
  SignalAlert,
  EventStats,
  TrackedEntity,
  TelemetryUpdate,
} from '@worldmonitor/shared';
import { getRegionForCoordinates } from '@worldmonitor/shared';
import { USGSIngester } from './ingesters/USGSIngester';
import { EONETIngester } from './ingesters/EONETIngester';
import { OpenSkyIngester } from './ingesters/OpenSkyIngester';
import { MaritimeIngester } from './ingesters/MaritimeIngester';
import { NewsIngester } from './ingesters/NewsIngester';
import { YouTubeIngester } from './ingesters/YouTubeIngester';
import { TelemetryService } from './TelemetryService';
import { logger } from '../utils/logger';
import { EventEmitter } from 'events';

export class LiveDataProvider extends EventEmitter {
  private events: Map<string, MonitorEvent> = new Map();
  private feeds: FeedItem[] = [];
  private alerts: SignalAlert[] = [];

  private usgs = new USGSIngester();
  private eonet = new EONETIngester();
  private opensky = new OpenSkyIngester();
  private maritime = new MaritimeIngester();
  private news = new NewsIngester();
  private youtube = new YouTubeIngester();
  private telemetry: TelemetryService;

  private pollIntervals: NodeJS.Timeout[] = [];

  constructor() {
    super();
    this.telemetry = new TelemetryService(this.opensky, this.maritime);
    this.setupCallbacks();
    this.startPolling();
  }

  private setupCallbacks() {
    const handleNewEvent = (event: MonitorEvent) => {
      // Compute proper region from coordinates instead of generic 'Global'
      if (
        (!event.location.region || event.location.region === 'Global') &&
        event.location.lat &&
        event.location.lng
      ) {
        event.location.region = getRegionForCoordinates(event.location.lat, event.location.lng);
      }

      this.events.set(event.id, event);

      // Check if we need to trim the map to avoid huge memory footprint
      if (this.events.size > 2000) {
        const sortedKeys = Array.from(this.events.values())
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          .map((e) => e.id);
        // remove oldest 500
        for (let i = 0; i < 500; i++) {
          this.events.delete(sortedKeys[i]);
        }
      }

      // Also convert some "news" events directly to Feeds
      if (
        event.category === 'political' ||
        event.category === 'economic' ||
        event.source === 'OSINT Media'
      ) {
        const feed: FeedItem = {
          id: `feed-${event.id}`,
          type: 'news',
          title: event.title,
          summary: event.description || '',
          source: event.source,
          sourceUrl: event.description.split('URL: ')[1] || '',
          timestamp: event.timestamp,
          category: event.category,
          severity: event.severity,
          location: event.location,
          tags: event.tags,
          sentiment: Math.random() * 2 - 1,
          credibility: 0.8,
        };
        this.feeds.unshift(feed);
        if (this.feeds.length > 500) this.feeds.pop();
      }

      // emit to WebSocketManager (if connected)
      this.emit('newEvent', event);

      // Maybe generate an alert for critical events
      if (event.severity === 'critical') {
        const alert: SignalAlert = {
          id: uuid(),
          level: 'critical',
          title: `CRITICAL: ${event.title}`,
          message: event.description,
          timestamp: event.timestamp,
          source: event.source,
          acknowledged: false,
        };
        this.alerts.unshift(alert);
        if (this.alerts.length > 50) this.alerts.pop();
        this.emit('newAlert', alert);
      }
    };

    this.usgs.onNewEvent(handleNewEvent);
    this.eonet.onNewEvent(handleNewEvent);
    this.opensky.onNewEvent(handleNewEvent);
    this.news.onNewEvent(handleNewEvent);

    // YouTube produces FeedItems directly (not events)
    this.youtube.onNewFeed((feed: FeedItem) => {
      this.feeds.unshift(feed);
      if (this.feeds.length > 500) this.feeds.pop();
      this.emit('newFeed', feed);
    });

    // High-density telemetry
    this.telemetry.on('telemetryUpdate', (update: TelemetryUpdate) => {
      this.emit('telemetryUpdate', update);
    });
  }

  private startPolling() {
    logger.info('Starting live data polling engines...');

    // Initial poll (delayed slightly to allow server boot)
    setTimeout(() => this.usgs.poll(), 1000);
    setTimeout(() => this.eonet.poll(), 2000);
    setTimeout(() => this.news.poll(), 3000);
    setTimeout(() => this.opensky.poll(), 4000);
    setTimeout(() => this.maritime.poll(), 5000); // New maritime poll
    setTimeout(() => this.youtube.poll(), 6000);

    // Schedule periodic polls
    this.pollIntervals.push(setInterval(() => this.usgs.poll(), 60_000)); // Every 60 seconds
    this.pollIntervals.push(setInterval(() => this.eonet.poll(), 300_000)); // Every 5 mins
    this.pollIntervals.push(setInterval(() => this.news.poll(), 300_000)); // Every 5 mins
    this.pollIntervals.push(setInterval(() => this.opensky.poll(), 180_000)); // 3 mins (OpenSky limit)
    this.pollIntervals.push(setInterval(() => this.maritime.poll(), 60_000)); // Every 60 seconds
    this.pollIntervals.push(setInterval(() => this.youtube.poll(), 600_000)); // Every 10 mins
  }

  shutdown() {
    for (const timer of this.pollIntervals) {
      clearInterval(timer);
    }
  }

  // --- Same public interface as MockDataProvider ---

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
    let filtered = Array.from(this.events.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

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
          e.description?.toLowerCase().includes(s) ||
          e.location.name?.toLowerCase().includes(s),
      );
    }

    const total = filtered.length;
    const offset = filter?.offset || 0;
    const limit = filter?.limit || 50;

    return { events: filtered.slice(offset, offset + limit), total };
  }

  getEventById(id: string): MonitorEvent | undefined {
    return this.events.get(id);
  }

  getStats(): EventStats {
    const now = Date.now();
    const allEvt = Array.from(this.events.values());

    const last24h = allEvt.filter((e) => now - new Date(e.timestamp).getTime() < 86400000).length;
    const lastHour = allEvt.filter((e) => now - new Date(e.timestamp).getTime() < 3600000).length;

    const byCategory: Record<string, number> = {
      conflict: 0,
      natural_disaster: 0,
      political: 0,
      economic: 0,
      health: 0,
      cyber: 0,
      environmental: 0,
      technology: 0,
      social: 0,
    };
    const bySeverity: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };
    const byStatus: Record<string, number> = {
      active: 0,
      monitoring: 0,
      resolved: 0,
      archived: 0,
    };

    for (const e of allEvt) {
      byCategory[e.category] = (byCategory[e.category] || 0) + 1;
      bySeverity[e.severity] = (bySeverity[e.severity] || 0) + 1;
      byStatus[e.status] = (byStatus[e.status] || 0) + 1;
    }

    return {
      total: allEvt.length,
      byCategory: byCategory as any,
      bySeverity: bySeverity as any,
      byStatus: byStatus as any,
      last24h,
      lastHour,
      trend: lastHour > 20 ? 'increasing' : lastHour > 5 ? 'stable' : 'decreasing',
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
      Global: [0, 0],
    };

    const regionEvents: Record<string, MonitorEvent[]> = {};
    for (const e of this.events.values()) {
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

  // Methods to satisfy the mock generation loops (not used in Live mode, but part of interface)
  generateNewEvent(): any {
    return null;
  }
  generateNewFeed(): any {
    return null;
  }
  generateNewAlert(): any {
    return null;
  }
}
