import { create } from 'zustand';
import type { FeedItem, SignalAlert } from '@worldmonitor/shared';

interface FeedState {
  feeds: FeedItem[];
  alerts: SignalAlert[];
  loading: boolean;
  error: string | null;
  setFeeds: (feeds: FeedItem[]) => void;
  addFeed: (feed: FeedItem) => void;
  setAlerts: (alerts: SignalAlert[]) => void;
  addAlert: (alert: SignalAlert) => void;
  acknowledgeAlert: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  feeds: [],
  alerts: [],
  loading: false,
  error: null,
  setFeeds: (feeds) => set({ feeds, loading: false, error: null }),
  addFeed: (feed) => set((state) => ({ feeds: [feed, ...state.feeds].slice(0, 500) })),
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
  acknowledgeAlert: (id) => set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}));
