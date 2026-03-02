import type { MockDataProvider, LiveDataProvider } from '.';
import type { MonitorEvent, EventStats } from '@worldmonitor/shared';
import { logger } from '../utils/logger';

export class EventAggregator {
  constructor(private dataProvider: MockDataProvider | LiveDataProvider) {
    logger.info('EventAggregator initialized (mock mode)');
  }

  getEvents(filter?: any): { events: MonitorEvent[]; total: number } {
    return this.dataProvider.getEvents(filter);
  }

  getEventById(id: string): MonitorEvent | undefined {
    return this.dataProvider.getEventById(id);
  }

  getStats(): EventStats {
    return this.dataProvider.getStats();
  }
}
