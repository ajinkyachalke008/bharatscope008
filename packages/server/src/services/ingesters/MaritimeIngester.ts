import { TrackedEntity, EntityClassification } from '@worldmonitor/shared';
import { logger } from '../../utils/logger';

export class MaritimeIngester {
  private onNewEventCallback?: (event: any) => void;
  private onTelemetryCallback?: (entities: TrackedEntity[]) => void;

  // Strategic maritime checkpoints for simulation
  private readonly hotspots = [
    { name: 'Suez Canal', lat: 29.9, lng: 32.5, radius: 2 },
    { name: 'Strait of Hormuz', lat: 26.6, lng: 56.3, radius: 1.5 },
    { name: 'Strait of Malacca', lat: 1.4, lng: 102.9, radius: 3 },
    { name: 'Taiwan Strait', lat: 24.3, lng: 119.5, radius: 2 },
    { name: 'English Channel', lat: 50.6, lng: 1.0, radius: 1 },
  ];

  constructor() {}

  onNewEvent(callback: (event: any) => void) {
    this.onNewEventCallback = callback;
  }

  onTelemetry(callback: (entities: TrackedEntity[]) => void) {
    this.onTelemetryCallback = callback;
  }

  async poll(): Promise<void> {
    logger.info('Polling Maritime high-density telemetry (Simulated Intelligence)...');

    const entities: TrackedEntity[] = [];

    // Generate realistic traffic for each hotspot
    for (const spot of this.hotspots) {
      const count = 20 + Math.floor(Math.random() * 30);
      for (let i = 0; i < count; i++) {
        const id = `mmsi-${spot.name.replace(/\s+/g, '-')}-${i}`;
        const lat = spot.lat + (Math.random() - 0.5) * spot.radius;
        const lng = spot.lng + (Math.random() - 0.5) * spot.radius;

        const classification: EntityClassification = Math.random() > 0.9 ? 'MILITARY' : 'CIVILIAN';
        const country = this.getRandomFlag();

        const entity: TrackedEntity = {
          id,
          domain: 'VESSEL',
          classification,
          callsign: this.getShipName(classification),
          country,
          position: { lat, lng, alt: 0 },
          velocity: {
            speed: 10 + Math.random() * 20,
            heading: Math.random() * 360,
            verticalRate: 0,
          },
          lastUpdate: new Date().toISOString(),
          isStale: false,
          threatLevel: classification === 'MILITARY' ? 'medium' : 'none',
        };

        entities.push(entity);
      }
    }

    if (entities.length > 0) {
      logger.info(`Maritime: Ingested ${entities.length} high-density maritime assets`);
      if (this.onTelemetryCallback) {
        this.onTelemetryCallback(entities);
      }
    }
  }

  private getRandomFlag(): string {
    const flags = [
      'Panama',
      'Liberia',
      'Marshall Islands',
      'USA',
      'China',
      'Russia',
      'UK',
      'Greece',
      'Norway',
    ];
    return flags[Math.floor(Math.random() * flags.length)];
  }

  private getShipName(classification: EntityClassification): string {
    if (classification === 'MILITARY') {
      const mil = [
        'USS GERALD FORD',
        'HMS QUEEN ELIZABETH',
        'LIAONING',
        'INS VIKRANT',
        'MOSKVA',
        'CNS SHANDONG',
      ];
      return mil[Math.floor(Math.random() * mil.length)] + ' (T-Class)';
    }
    const civ = [
      'EVER GIVEN',
      'EMMA MAERSK',
      'TI OCEANIA',
      'GLOBE EXPRESS',
      'ARCTIC SUNRISE',
      'SEA HARVEST',
    ];
    return civ[Math.floor(Math.random() * civ.length)];
  }
}
