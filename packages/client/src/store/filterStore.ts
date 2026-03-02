import { create } from 'zustand';
import type { EventCategory, SeverityLevel, EventStatus } from '@worldmonitor/shared';

interface FilterState {
  categories: EventCategory[];
  severities: SeverityLevel[];
  statuses: EventStatus[];
  search: string;
  dateRange: { start: string; end: string } | null;
  toggleCategory: (cat: EventCategory) => void;
  toggleSeverity: (sev: SeverityLevel) => void;
  toggleStatus: (status: EventStatus) => void;
  setSearch: (search: string) => void;
  setDateRange: (range: { start: string; end: string } | null) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  categories: [],
  severities: [],
  statuses: [],
  search: '',
  dateRange: null,
  toggleCategory: (cat) =>
    set((s) => ({
      categories: s.categories.includes(cat)
        ? s.categories.filter((c) => c !== cat)
        : [...s.categories, cat],
    })),
  toggleSeverity: (sev) =>
    set((s) => ({
      severities: s.severities.includes(sev)
        ? s.severities.filter((sv) => sv !== sev)
        : [...s.severities, sev],
    })),
  toggleStatus: (status) =>
    set((s) => ({
      statuses: s.statuses.includes(status)
        ? s.statuses.filter((st) => st !== status)
        : [...s.statuses, status],
    })),
  setSearch: (search) => set({ search }),
  setDateRange: (dateRange) => set({ dateRange }),
  resetFilters: () =>
    set({ categories: [], severities: [], statuses: [], search: '', dateRange: null }),
}));
