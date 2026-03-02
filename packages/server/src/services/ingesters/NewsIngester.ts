import axios from 'axios';
import { v4 as uuid } from 'uuid';
import type { MonitorEvent } from '@worldmonitor/shared';
import { logger } from '../../utils/logger';

export class NewsIngester {
  // GDACS RSS feed parses emergency disasters, but we can also use real NewsAPI or Reddit JSON if we want text-based news
  // Using Reddit WorldNews JSON as a reliable, free, unauthenticated news firehose
  private readonly url = 'https://www.reddit.com/r/worldnews/hot.json?limit=15';
  private lastFetchTime = 0;
  private onNewEventCallback?: (event: MonitorEvent) => void;
  private processedIds = new Set<string>();

  constructor() {}

  onNewEvent(callback: (event: MonitorEvent) => void) {
    this.onNewEventCallback = callback;
  }

  async poll(): Promise<MonitorEvent[]> {
    const now = Date.now();
    // Prevent polling more often than once per 5 minutes
    if (now - this.lastFetchTime < 300000) {
      return [];
    }

    this.lastFetchTime = now;
    try {
      logger.info('Polling OSINT / News feeds...');
      const response = await axios.get(this.url, { timeout: 15000 });
      const data = response.data;
      const newEvents: MonitorEvent[] = [];

      if (data && data.data && Array.isArray(data.data.children)) {
        for (const child of data.data.children) {
          const post = child.data;
          const id = post.id;

          if (this.processedIds.has(id)) continue;
          this.processedIds.add(id);

          const title = post.title;
          const url = post.url;

          if (post.stickied || post.over_18) continue; // skip stickies or NSFW

          const event = this.transformToMonitorEvent(id, title, url, post.created_utc);
          newEvents.push(event);

          if (this.onNewEventCallback) {
            this.onNewEventCallback(event);
          }
        }
      }

      if (this.processedIds.size > 1000) {
        this.processedIds.clear();
      }

      if (newEvents.length > 0) {
        logger.info(`News: Ingested ${newEvents.length} global news events`);
      }
      return newEvents;
    } catch (error: any) {
      logger.error(`Error polling News: ${error.message}`);
      return [];
    }
  }

  private transformToMonitorEvent(
    id: string,
    title: string,
    url: string,
    createdUtc: number,
  ): MonitorEvent {
    // Derive category based on keywords
    let category: any = 'political';
    let severity: any = 'medium';
    const lowerTitle = title.toLowerCase();

    if (
      lowerTitle.includes('war') ||
      lowerTitle.includes('attack') ||
      lowerTitle.includes('military') ||
      lowerTitle.includes('strike')
    ) {
      category = 'conflict';
      severity = 'high';
    } else if (
      lowerTitle.includes('economy') ||
      lowerTitle.includes('bank') ||
      lowerTitle.includes('market') ||
      lowerTitle.includes('trade')
    ) {
      category = 'economic';
      severity = 'low';
    } else if (
      lowerTitle.includes('health') ||
      lowerTitle.includes('virus') ||
      lowerTitle.includes('pandemic')
    ) {
      category = 'health';
      severity = 'medium';
    } else if (
      lowerTitle.includes('hacker') ||
      lowerTitle.includes('cyber') ||
      lowerTitle.includes('breach')
    ) {
      category = 'cyber';
      severity = 'high';
    }

    // Randomize coordinates roughly since global news doesn't always have exact lat/lng attached by default
    return {
      id: `news-${id}`,
      title: title.length > 100 ? title.substring(0, 97) + '...' : title,
      description: `Global news headline. Source URL: ${url}`,
      category,
      severity,
      status: 'active',
      location: {
        lat: Math.random() * 140 - 70,
        lng: Math.random() * 360 - 180,
        name: 'Global Report',
        region: 'Global',
      },
      timestamp: new Date(createdUtc * 1000).toISOString(),
      updatedAt: new Date(createdUtc * 1000).toISOString(),
      source: 'OSINT Media',
      tags: [category, severity, 'media'],
      verified: false,
    };
  }
}
