import { create } from 'zustand';
import type { MonitorEvent, EventStats } from '@worldmonitor/shared';

interface EventState {
  events: MonitorEvent[];
  stats: EventStats | null;
  selectedEvent: MonitorEvent | null;
  loading: boolean;
  error: string | null;
  setEvents: (events: MonitorEvent[]) => void;
  addEvent: (event: MonitorEvent) => void;
  setStats: (stats: EventStats) => void;
  selectEvent: (event: MonitorEvent | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  stats: null,
  selectedEvent: null,
  loading: false,
  error: null,
  setEvents: (events) => set({ events, loading: false, error: null }),
  addEvent: (event) => set((state) => ({ events: [event, ...state.events].slice(0, 200) })),
  setStats: (stats) => set({ stats }),
  selectEvent: (selectedEvent) => set({ selectedEvent }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}));
