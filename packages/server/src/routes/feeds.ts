import { Router } from 'express';
import type { FeedIngester } from '../services/FeedIngester';

export function feedRoutes(ingester: FeedIngester): Router {
  const router = Router();

  router.get('/', (req, res) => {
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 50;
    const offset = req.query.offset ? parseInt(String(req.query.offset), 10) : 0;
    const type = req.query.type ? String(req.query.type) : undefined;
    res.json(ingester.getFeeds(limit, offset, type));
  });

  router.get('/alerts', (_req, res) => {
    res.json(ingester.getAlerts());
  });

  router.post('/alerts/:id/acknowledge', (req, res) => {
    const success = ingester.acknowledgeAlert(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }
    res.json({ success: true });
  });

  return router;
}
