import { Router } from 'express';

export function healthRoutes(): Router {
  const router = Router();
  router.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  });
  return router;
}
