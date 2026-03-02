import { EventEmitter } from 'events';
import { TrackedEntity, TelemetryUpdate } from '@worldmonitor/shared';
import { OpenSkyIngester } from './ingesters/OpenSkyIngester';
import { MaritimeIngester } from './ingesters/MaritimeIngester';
import { logger } from '../utils/logger';

export class TelemetryService extends EventEmitter {
  private entities: Map<string, TrackedEntity> = new Map();
  private static instance: TelemetryService;

  constructor(
    private opensky: OpenSkyIngester,
    private maritime: MaritimeIngester,
  ) {
    super();
    this.setupCallbacks();
  }

  private setupCallbacks() {
    const handleTelemetry = (newEntities: TrackedEntity[]) => {
      const now = new Date().toISOString();

      for (const entity of newEntities) {
        // Update or add entity
        this.entities.set(entity.id, {
          ...entity,
          lastUpdate: now,
          isStale: false,
        });
      }

      // Cleanup stale entities (not updated in > 10 minutes)
      const tenMinsAgo = Date.now() - 600000;
      for (const [id, entity] of this.entities.entries()) {
        if (new Date(entity.lastUpdate).getTime() < tenMinsAgo) {
          this.entities.delete(id);
        }
      }

      this.broadcast();
    };

    this.opensky.onTelemetry(handleTelemetry);
    this.maritime.onTelemetry(handleTelemetry);
  }

  private broadcast() {
    const update: TelemetryUpdate = {
      entities: Array.from(this.entities.values()),
      timestamp: new Date().toISOString(),
    };
    this.emit('telemetryUpdate', update);
  }

  public getActiveEntities(): TrackedEntity[] {
    return Array.from(this.entities.values());
  }
}
