import { create } from 'zustand';
import { TrackedEntity, TelemetryUpdate } from '@worldmonitor/shared';
import { wsClient } from '../services/websocket';

interface TelemetryState {
  entities: Map<string, TrackedEntity>;
  lastUpdate: number;

  // Stats
  aircraftCount: number;
  vesselCount: number;
  militaryCount: number;

  // Actions
  updateTelemetry: (update: TelemetryUpdate) => void;
  initialize: () => void;
}

export const useTelemetryStore = create<TelemetryState>((set, get) => ({
  entities: new Map(),
  lastUpdate: 0,
  aircraftCount: 0,
  vesselCount: 0,
  militaryCount: 0,

  updateTelemetry: (update: TelemetryUpdate) => {
    const currentEntities = new Map(get().entities);
    let aircraft = 0;
    let vessels = 0;
    let military = 0;

    for (const entity of update.entities) {
      currentEntities.set(entity.id, entity);

      if (entity.domain === 'AIRCRAFT') aircraft++;
      if (entity.domain === 'VESSEL') vessels++;
      if (entity.classification === 'MILITARY') military++;
    }

    // Cleanup stale (optional here if server already handles it, but good for local reliability)
    const now = Date.now();
    for (const [id, entity] of currentEntities.entries()) {
      if (now - new Date(entity.lastUpdate).getTime() > 600000) {
        currentEntities.delete(id);
      }
    }

    set({
      entities: currentEntities,
      lastUpdate: now,
      aircraftCount: aircraft,
      vesselCount: vessels,
      militaryCount: military,
    });
  },

  initialize: () => {
    wsClient.on('telemetryUpdate', (data: any) => {
      const update = data.payload || data;
      get().updateTelemetry(update);
    });
  },
}));
