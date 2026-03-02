import React from 'react';
import { useFilterStore } from '@/store/filterStore';
import { SEVERITY_COLORS, CATEGORY_ICONS } from '@worldmonitor/shared';
import { capitalize } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import { Search, X } from 'lucide-react';
import type { EventCategory, SeverityLevel } from '@worldmonitor/shared';

const CATEGORIES: EventCategory[] = [
  'conflict',
  'natural_disaster',
  'political',
  'economic',
  'health',
  'cyber',
  'environmental',
  'technology',
  'social',
];
const SEVERITIES: SeverityLevel[] = ['critical', 'high', 'medium', 'low', 'info'];

export const TimelineFilter: React.FC = () => {
  const {
    categories,
    severities,
    search,
    toggleCategory,
    toggleSeverity,
    setSearch,
    resetFilters,
  } = useFilterStore();
  const hasFilters = categories.length > 0 || severities.length > 0 || search.length > 0;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors group-focus-within:text-monitor-accent" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events..."
          className="w-full pl-9 pr-8 py-2 bg-monitor-surface2 border border-monitor-border rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-monitor-accent/50 focus:ring-1 focus:ring-monitor-accent/30 transition-all duration-300"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 hover:scale-110 active:scale-95 transition-transform"
          >
            <X className="w-4 h-4 text-gray-500 hover:text-gray-300" />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {SEVERITIES.map((sev) => (
          <button
            key={sev}
            onClick={() => toggleSeverity(sev)}
            className={cn(
              'px-2 py-1 text-xs rounded-full border transition-all duration-200 hover:scale-105 active:scale-95',
              severities.includes(sev)
                ? 'border-current opacity-100 shadow-[0_0_8px_currentColor] drop-shadow-md'
                : 'border-monitor-border text-gray-500 opacity-60 hover:opacity-100 hover:bg-monitor-surface2',
            )}
            style={severities.includes(sev) ? { color: SEVERITY_COLORS[sev] } : {}}
          >
            {capitalize(sev)}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => toggleCategory(cat)}
            className={cn(
              'px-2.5 py-1.5 text-xs rounded-full border transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-1.5',
              categories.includes(cat)
                ? 'border-monitor-accent/50 text-monitor-accent bg-monitor-accent/15 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                : 'border-monitor-border text-gray-500 hover:text-gray-200 hover:bg-monitor-surface2 hover:border-gray-500',
            )}
          >
            {CATEGORY_ICONS[cat]} {capitalize(cat)}
          </button>
        ))}
      </div>
      {hasFilters && (
        <button onClick={resetFilters} className="text-xs text-monitor-accent hover:underline">
          Clear all filters
        </button>
      )}
    </div>
  );
};
