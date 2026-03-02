import axios from 'axios';
import { v4 as uuid } from 'uuid';
import type { MonitorEvent } from '@worldmonitor/shared';
import { logger } from '../../utils/logger';

export class EONETIngester {
  private readonly url = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=10';
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
      logger.info('Polling NASA EONET feeds...');
      const response = await axios.get(this.url, { timeout: 15000 });
      const data = response.data;
      const newEvents: MonitorEvent[] = [];

      if (data && Array.isArray(data.events)) {
        for (const eventBody of data.events) {
          const id = eventBody.id;
          if (this.processedIds.has(id)) continue;

          const geometries = eventBody.geometry;
          if (!geometries || geometries.length === 0) continue;

          // get latest geometry
          const latestGeo = geometries[geometries.length - 1];
          let lat = 0;
          let lng = 0;

          if (latestGeo.type === 'Point') {
            lng = latestGeo.coordinates[0];
            lat = latestGeo.coordinates[1];
          } else if (latestGeo.type === 'Polygon') {
            // Just grab first point of polygon
            lng = latestGeo.coordinates[0][0][0];
            lat = latestGeo.coordinates[0][0][1];
          } else {
            continue;
          }

          this.processedIds.add(id);

          const event = this.transformToMonitorEvent(id, eventBody, lat, lng, latestGeo.date);
          newEvents.push(event);

          if (this.onNewEventCallback) {
            this.onNewEventCallback(event);
          }
        }
      }

      if (this.processedIds.size > 2000) {
        this.processedIds.clear();
      }

      if (newEvents.length > 0) {
        logger.info(`NASA EONET: Ingested ${newEvents.length} new environmental events`);
      }
      return newEvents;
    } catch (error: any) {
      logger.error(`Error polling NASA EONET: ${error.message}`);
      return [];
    }
  }

  private transformToMonitorEvent(
    id: string,
    eventBody: any,
    lat: number,
    lng: number,
    dateStr: string,
  ): MonitorEvent {
    const title = eventBody.title || 'Unknown Event';
    const rawCategory =
      eventBody.categories && eventBody.categories.length > 0 ? eventBody.categories[0].id : '';

    let category: any = 'environmental';
    let severity: any = 'medium';

    // map EONET categories to ours
    if (rawCategory === 'wildfires') severity = 'high';
    else if (rawCategory === 'severeStorms') {
      category = 'natural_disaster';
      severity = 'high';
    } else if (rawCategory === 'volcanoes') {
      category = 'natural_disaster';
      severity = 'critical';
    }

    return {
      id: `eonet-${id}`,
      title,
      description: `Source: NASA EONET. ${eventBody.description || ''}`,
      category,
      severity,
      status: 'active',
      location: {
        lat,
        lng,
        name: 'Geo coordinates',
        region: 'Global',
      },
      timestamp: new Date(dateStr || Date.now()).toISOString(),
      updatedAt: new Date(Date.now()).toISOString(),
      source: 'NASA EONET',
      tags: [category, rawCategory, severity],
      verified: true, // official source
      impactRadius: 100,
    };
  }
}
