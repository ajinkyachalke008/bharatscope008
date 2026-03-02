import React from 'react';
import { cn } from '@/utils/cn';
import { AnimatedNumber } from '@/components/common/AnimatedNumber';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color?: string;
  change?: number;
  format?: (n: number) => string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'text-monitor-accent',
  change,
  format,
}) => {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2 rounded-lg bg-current/10', color)}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <span
            className={cn(
              'text-xs font-mono font-semibold',
              change > 0
                ? 'text-monitor-critical'
                : change < 0
                  ? 'text-monitor-success'
                  : 'text-gray-400',
            )}
          >
            {change > 0 ? '+' : ''}
            {change}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold font-mono text-gray-100">
        <AnimatedNumber value={value} format={format} />
      </div>
      <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{title}</div>
    </div>
  );
};
