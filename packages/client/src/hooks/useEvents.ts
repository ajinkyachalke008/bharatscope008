import { useEffect } from 'react';
import { api } from '../services/api';
import { useEventStore } from '../store/eventStore';
import { useFilterStore } from '../store/filterStore';

export function useEvents() {
  const { setEvents, setStats, setLoading, setError } = useEventStore();
  const filters = useFilterStore();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (filters.categories.length) params.categories = filters.categories.join(',');
        if (filters.severities.length) params.severities = filters.severities.join(',');
        if (filters.statuses.length) params.statuses = filters.statuses.join(',');
        if (filters.search) params.search = filters.search;

        const [eventsRes, statsRes] = await Promise.all([
          api.events.list(params),
          api.events.stats(),
        ]);
        setEvents(eventsRes.events);
        setStats(statsRes);
      } catch (err: any) {
        setError(err.message);
      }
    }
    load();
  }, [
    filters.categories,
    filters.severities,
    filters.statuses,
    filters.search,
    setEvents,
    setStats,
    setLoading,
    setError,
  ]);

  return useEventStore();
}
