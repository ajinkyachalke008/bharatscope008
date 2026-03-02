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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events..."
          className="w-full pl-9 pr-8 py-2 bg-monitor-surface2 border border-monitor-border rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-monitor-accent/50"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
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
              'px-2 py-1 text-xs rounded-full border transition-all',
              severities.includes(sev)
                ? 'border-current opacity-100'
                : 'border-gray-700 text-gray-500 opacity-60 hover:opacity-100',
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
              'px-2 py-1 text-xs rounded-full border transition-all',
              categories.includes(cat)
                ? 'border-monitor-accent/50 text-monitor-accent bg-monitor-accent/10'
                : 'border-gray-700 text-gray-500 hover:text-gray-300',
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
