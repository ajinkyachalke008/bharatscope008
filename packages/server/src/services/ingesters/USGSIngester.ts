import axios from 'axios';
import { v4 as uuid } from 'uuid';
import type { MonitorEvent } from '@worldmonitor/shared';
import { logger } from '../../utils/logger';

export class USGSIngester {
  private readonly url =
    'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
  private lastFetchTime = 0;
  private onNewEventCallback?: (event: MonitorEvent) => void;

  // We keep a set of processed IDs to avoid duplicates between polls
  private processedIds = new Set<string>();

  constructor() {}

  onNewEvent(callback: (event: MonitorEvent) => void) {
    this.onNewEventCallback = callback;
  }

  async poll(): Promise<MonitorEvent[]> {
    const now = Date.now();
    // Prevent polling more often than once per minute
    if (now - this.lastFetchTime < 60000) {
      return [];
    }

    this.lastFetchTime = now;
    try {
      logger.info('Polling USGS Earthquake feeds...');
      const response = await axios.get(this.url, { timeout: 10000 });
      const data = response.data;
      const newEvents: MonitorEvent[] = [];

      if (data && Array.isArray(data.features)) {
        for (const feature of data.features) {
          const id = feature.id;
          if (this.processedIds.has(id)) continue;

          this.processedIds.add(id);

          const props = feature.properties;
          const coords = feature.geometry.coordinates; // [lng, lat, depth]

          if (!props || !coords || coords.length < 2) continue;

          const mag = props.mag || 0;
          const event = this.transformToMonitorEvent(id, props, coords, mag);
          newEvents.push(event);

          if (this.onNewEventCallback) {
            this.onNewEventCallback(event);
          }
        }
      }

      // cleanup set if it gets too large
      if (this.processedIds.size > 5000) {
        this.processedIds.clear();
      }

      if (newEvents.length > 0) {
        logger.info(`USGS: Ingested ${newEvents.length} new earthquake events`);
      }
      return newEvents;
    } catch (error: any) {
      logger.error(`Error polling USGS: ${error.message}`);
      return [];
    }
  }

  private transformToMonitorEvent(
    id: string,
    props: any,
    coords: number[],
    mag: number,
  ): MonitorEvent {
    let severity: 'critical' | 'high' | 'medium' | 'low' | 'info' = 'info';
    if (mag >= 7.0) severity = 'critical';
    else if (mag >= 5.5) severity = 'high';
    else if (mag >= 4.0) severity = 'medium';
    else severity = 'low';

    return {
      id: `usgs-${id}`,
      title: props.title || `M ${mag.toFixed(1)} Earthquake`,
      description: `USGS reported an earthquake of magnitude ${mag.toFixed(1)}. ${props.url ? `Details: ${props.url}` : ''}`,
      category: 'natural_disaster',
      severity,
      status: 'active',
      location: {
        lat: coords[1],
        lng: coords[0],
        name: props.place || 'Unknown Location',
        region: 'Global', // we can compute tighter region down the line
      },
      timestamp: new Date(props.time || Date.now()).toISOString(),
      updatedAt: new Date(props.updated || Date.now()).toISOString(),
      source: 'USGS',
      tags: ['earthquake', 'natural_disaster', severity],
      verified: true, // official source
      impactRadius: mag >= 4.0 ? Math.floor(mag * 10) : undefined,
    };
  }
}
