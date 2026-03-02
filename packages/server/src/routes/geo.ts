import { Router } from 'express';
import type { GeoService } from '../services/GeoService';

export function geoRoutes(geoService: GeoService): Router {
  const router = Router();
  router.get('/regions', (_req, res) => {
    res.json(geoService.getRegions());
  });
  router.get('/heatmap', (_req, res) => {
    res.json(geoService.getHeatmapData());
  });
  return router;
}
