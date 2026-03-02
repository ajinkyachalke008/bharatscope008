import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { RegionData, HeatmapPoint } from '@worldmonitor/shared';

export function useGeolocation() {
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [regionsData, heatmapData] = await Promise.all([
          api.geo.regions(),
          api.geo.heatmap(),
        ]);
        setRegions(regionsData);
        setHeatmap(heatmapData);
      } catch {
        /* silently fallback */
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  return { regions, heatmap, loading };
}
