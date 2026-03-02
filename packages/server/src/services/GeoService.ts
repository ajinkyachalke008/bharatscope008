import type { MockDataProvider, LiveDataProvider } from '.';
import type { RegionData, HeatmapPoint } from '@worldmonitor/shared';
import { logger } from '../utils/logger';

export class GeoService {
  constructor(private dataProvider: MockDataProvider | LiveDataProvider) {
    logger.info('GeoService initialized (mock mode)');
  }

  getRegions(): RegionData[] {
    return this.dataProvider.getRegions();
  }

  getHeatmapData(): HeatmapPoint[] {
    const { events } = this.dataProvider.getEvents({ limit: 200 });
    const severityIntensity: Record<string, number> = {
      critical: 1,
      high: 0.8,
      medium: 0.5,
      low: 0.3,
      info: 0.1,
    };

    return events.map((e) => ({
      lat: e.location.lat,
      lng: e.location.lng,
      intensity: severityIntensity[e.severity] || 0.2,
    }));
  }
}
