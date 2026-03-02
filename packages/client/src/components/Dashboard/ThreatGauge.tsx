import React from 'react';
import { cn } from '@/utils/cn';

interface ThreatGaugeProps {
  level: number;
  label?: string;
}

export const ThreatGauge: React.FC<ThreatGaugeProps> = ({ level, label }) => {
  const getColor = (l: number) =>
    l >= 80
      ? 'text-monitor-critical'
      : l >= 60
        ? 'text-monitor-high'
        : l >= 40
          ? 'text-monitor-medium'
          : l >= 20
            ? 'text-monitor-low'
            : 'text-monitor-success';
  const getLabel = (l: number) =>
    l >= 80 ? 'CRITICAL' : l >= 60 ? 'HIGH' : l >= 40 ? 'ELEVATED' : l >= 20 ? 'GUARDED' : 'LOW';
  const bgColor = (l: number) =>
    l >= 80
      ? 'bg-monitor-critical'
      : l >= 60
        ? 'bg-monitor-high'
        : l >= 40
          ? 'bg-monitor-medium'
          : l >= 20
            ? 'bg-monitor-low'
            : 'bg-monitor-success';

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          {label || 'Global Threat Level'}
        </span>
        <span className={cn('text-sm font-bold font-mono', getColor(level))}>
          {getLabel(level)}
        </span>
      </div>
      <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-1000', bgColor(level))}
          style={{ width: `${level}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-600 font-mono">
        <span>0</span>
        <span>{level}</span>
        <span>100</span>
      </div>
    </div>
  );
};
