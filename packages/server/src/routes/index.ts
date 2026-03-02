import { Router } from 'express';
import { healthRoutes } from './health';
import { eventRoutes } from './events';
import { feedRoutes } from './feeds';
import { geoRoutes } from './geo';
import type { EventAggregator } from '../services/EventAggregator';
import type { FeedIngester } from '../services/FeedIngester';
import type { GeoService } from '../services/GeoService';

interface RoutesDeps {
  eventAggregator: EventAggregator;
  feedIngester: FeedIngester;
  geoService: GeoService;
}

export function createRoutes(deps: RoutesDeps): Router {
  const router = Router();
  router.use(healthRoutes());
  router.use('/api/events', eventRoutes(deps.eventAggregator));
  router.use('/api/feeds', feedRoutes(deps.feedIngester));
  router.use('/api/geo', geoRoutes(deps.geoService));
  return router;
}
