import { Router } from 'express';
import type { EventAggregator } from '../services/EventAggregator';

export function eventRoutes(aggregator: EventAggregator): Router {
  const router = Router();

  router.get('/', (req, res) => {
    const { categories, severities, statuses, limit, offset, search } = req.query;
    const filter = {
      categories: categories ? String(categories).split(',') : undefined,
      severities: severities ? String(severities).split(',') : undefined,
      statuses: statuses ? String(statuses).split(',') : undefined,
      limit: limit ? parseInt(String(limit), 10) : 50,
      offset: offset ? parseInt(String(offset), 10) : 0,
      search: search ? String(search) : undefined,
    };
    res.json(aggregator.getEvents(filter));
  });

  router.get('/stats', (_req, res) => {
    res.json(aggregator.getStats());
  });

  router.get('/:id', (req, res) => {
    const event = aggregator.getEventById(req.params.id);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    res.json(event);
  });

  return router;
}
