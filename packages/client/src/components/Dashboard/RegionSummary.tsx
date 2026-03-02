import React from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { cn } from '@/utils/cn';

export const RegionSummary: React.FC = () => {
  const { regions } = useGeolocation();
  const sorted = [...regions].sort((a, b) => b.threatLevel - a.threatLevel);

  const getThreatColor = (level: number) =>
    level >= 80
      ? 'text-monitor-critical bg-monitor-critical/10'
      : level >= 60
        ? 'text-monitor-high bg-monitor-high/10'
        : level >= 40
          ? 'text-monitor-medium bg-monitor-medium/10'
          : 'text-monitor-low bg-monitor-low/10';

  return (
    <div className="glass-panel p-4">
      <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-3">
        Regional Threat Assessment
      </h3>
      <div className="space-y-2">
        {sorted.slice(0, 8).map((region) => (
          <div key={region.id} className="flex items-center gap-3 text-sm">
            <div className="flex-1 text-gray-300 truncate">{region.name}</div>
            <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-700',
                  region.threatLevel >= 80
                    ? 'bg-monitor-critical'
                    : region.threatLevel >= 60
                      ? 'bg-monitor-high'
                      : region.threatLevel >= 40
                        ? 'bg-monitor-medium'
                        : 'bg-monitor-low',
                )}
                style={{ width: `${region.threatLevel}%` }}
              />
            </div>
            <span
              className={cn(
                'text-xs font-mono px-1.5 py-0.5 rounded',
                getThreatColor(region.threatLevel),
              )}
            >
              {region.threatLevel}
            </span>
            <span className="text-xs text-gray-500 font-mono w-8 text-right">
              {region.eventCount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
