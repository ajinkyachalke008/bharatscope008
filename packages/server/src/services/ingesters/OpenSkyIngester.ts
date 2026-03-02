import axios from 'axios';
import { v4 as uuid } from 'uuid';
import type { MonitorEvent, TrackedEntity, EntityClassification } from '@worldmonitor/shared';
import { logger } from '../../utils/logger';

export class OpenSkyIngester {
  private readonly url = 'https://opensky-network.org/api/states/all';
  private lastFetchTime = 0;
  private onNewEventCallback?: (event: MonitorEvent) => void;
  private onTelemetryCallback?: (entities: TrackedEntity[]) => void;

  constructor() {}

  onNewEvent(callback: (event: MonitorEvent) => void) {
    this.onNewEventCallback = callback;
  }

  onTelemetry(callback: (entities: TrackedEntity[]) => void) {
    this.onTelemetryCallback = callback;
  }

  async poll(): Promise<void> {
    const now = Date.now();
    // 3 minute interval for anon access to stay safe
    if (now - this.lastFetchTime < 180000) {
      return;
    }

    this.lastFetchTime = now;
    try {
      logger.info('Polling OpenSky Aviation high-density telemetry...');
      // Broad bounding box encompassing much of Europe and Middle East
      const response = await axios.get(`${this.url}?lamin=20&lomin=-20&lamax=60&lomax=60`, {
        timeout: 20000,
      });
      const data = response.data;
      const entities: TrackedEntity[] = [];

      if (data && Array.isArray(data.states)) {
        // Return up to 1000 aircraft for Phase 3 Pillar 1
        const states = data.states.slice(0, 1000);

        for (const state of states) {
          const icao24 = state[0];
          const callsign = (state[1] || 'Unknown').trim();
          const country = state[2] || 'Unknown';
          const lng = state[5];
          const lat = state[6];
          const altitude = state[7] || (state[13] ? state[13] : 0); // geo or baro
          const speed = (state[9] || 0) * 1.94384; // m/s to knots
          const heading = state[10] || 0;
          const verticalRate = state[11] || 0;

          if (lat === null || lng === null) continue;

          const classification = this.getClassification(callsign, country);

          const entity: TrackedEntity = {
            id: icao24,
            domain: 'AIRCRAFT',
            classification,
            callsign,
            country,
            position: { lat, lng, alt: altitude },
            velocity: { speed, heading, verticalRate },
            lastUpdate: new Date().toISOString(),
            isStale: false,
            threatLevel: classification === 'MILITARY' ? 'low' : 'none',
          };

          entities.push(entity);
        }
      }

      if (entities.length > 0) {
        logger.info(`OpenSky: Ingested ${entities.length} high-density telemetry assets`);
        if (this.onTelemetryCallback) {
          this.onTelemetryCallback(entities);
        }

        // Also generate a few events for critical/interesting flights for the event list
        if (this.onNewEventCallback) {
          const military = entities.filter((e) => e.classification === 'MILITARY').slice(0, 5);
          for (const m of military) {
            this.onNewEventCallback(this.transformToMonitorEvent(m));
          }
        }
      }
    } catch (error: any) {
      logger.error(`Error polling OpenSky: ${error.message}`);
    }
  }

  private getClassification(callsign: string, country: string): EntityClassification {
    // Basic heuristic for classification
    const milKeywords = ['FORTE', 'LAGR', 'JAKE', 'DUKE', 'NATO', 'BOLO', 'SPAR', 'VIPER', 'HAWK'];
    if (milKeywords.some((k) => callsign.includes(k))) return 'MILITARY';
    if (
      ['United States', 'Russia', 'Israel', 'Ukraine', 'China'].includes(country) &&
      callsign.length < 5
    )
      return 'MILITARY';
    return 'CIVILIAN';
  }

  private transformToMonitorEvent(entity: TrackedEntity): MonitorEvent {
    return {
      id: `flight-${entity.id}`,
      title: `Tactical Asset: ${entity.callsign}`,
      description: `${entity.classification} aircraft registered in ${entity.country}. Altitude: ${Math.round(entity.position.alt)}m, Speed: ${Math.round(entity.velocity.speed)}kts.`,
      category: entity.classification === 'MILITARY' ? 'military' : 'technology',
      severity: entity.classification === 'MILITARY' ? 'medium' : 'info',
      status: 'active',
      location: {
        lat: entity.position.lat,
        lng: entity.position.lng,
        name: 'Strategic Airspace',
        region: 'Global',
      },
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'OpenSky Network',
      tags: ['aviation', entity.classification.toLowerCase()],
      verified: true,
    };
  }
}
