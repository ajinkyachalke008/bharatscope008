import type { MockDataProvider, LiveDataProvider } from '.';
import type { FeedItem, SignalAlert } from '@worldmonitor/shared';
import { logger } from '../utils/logger';

export class FeedIngester {
  constructor(private dataProvider: MockDataProvider | LiveDataProvider) {
    logger.info('FeedIngester initialized (mock mode)');
  }

  getFeeds(limit?: number, offset?: number, type?: string): { feeds: FeedItem[]; total: number } {
    return this.dataProvider.getFeeds(limit, offset, type);
  }

  getAlerts(): SignalAlert[] {
    return this.dataProvider.getAlerts();
  }

  acknowledgeAlert(id: string): boolean {
    return this.dataProvider.acknowledgeAlert(id);
  }
}
