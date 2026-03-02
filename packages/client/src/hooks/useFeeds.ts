import { useEffect } from 'react';
import { api } from '../services/api';
import { useFeedStore } from '../store/feedStore';

export function useFeeds(type?: string) {
  const { setFeeds, setAlerts, setLoading, setError } = useFeedStore();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (type) params.type = type;
        const [feedsRes, alerts] = await Promise.all([api.feeds.list(params), api.feeds.alerts()]);
        setFeeds(feedsRes.feeds);
        setAlerts(alerts);
      } catch (err: any) {
        setError(err.message);
      }
    }
    load();
  }, [type, setFeeds, setAlerts, setLoading, setError]);

  return useFeedStore();
}
