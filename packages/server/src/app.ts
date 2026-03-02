import express, { Express } from 'express';
import helmet from 'helmet';
import { corsMiddleware } from './middleware/cors';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { createRoutes } from './routes';
import {
  MockDataProvider,
  LiveDataProvider,
  EventAggregator,
  FeedIngester,
  GeoService,
} from './services';
import { config } from './config';

export function createApp(): { app: Express; dataProvider: MockDataProvider | LiveDataProvider } {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(corsMiddleware);
  app.use(express.json());
  app.use(rateLimiter);

  const dataProvider = config.useMockData ? new MockDataProvider() : new LiveDataProvider();
  const eventAggregator = new EventAggregator(dataProvider);
  const feedIngester = new FeedIngester(dataProvider);
  const geoService = new GeoService(dataProvider);

  app.use(createRoutes({ eventAggregator, feedIngester, geoService }));
  app.use(errorHandler);

  return { app, dataProvider };
}
