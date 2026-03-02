const BASE_URL = import.meta.env.VITE_API_URL || '';

async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  events: {
    list: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchJSON<{ events: any[]; total: number }>(`/api/events${query}`);
    },
    get: (id: string) => fetchJSON<any>(`/api/events/${id}`),
    stats: () => fetchJSON<any>('/api/events/stats'),
  },
  feeds: {
    list: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchJSON<{ feeds: any[]; total: number }>(`/api/feeds${query}`);
    },
    alerts: () => fetchJSON<any[]>('/api/feeds/alerts'),
    acknowledgeAlert: (id: string) =>
      fetchJSON<{ success: boolean }>(`/api/feeds/alerts/${id}/acknowledge`, { method: 'POST' }),
  },
  geo: {
    regions: () => fetchJSON<any[]>('/api/geo/regions'),
    heatmap: () => fetchJSON<any[]>('/api/geo/heatmap'),
  },
  health: () => fetchJSON<any>('/health'),
};
