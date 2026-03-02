import React from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps {
  variant?: 'critical' | 'high' | 'medium' | 'low' | 'info' | 'default';
  children: React.ReactNode;
  className?: string;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className,
  pulse,
}) => {
  const variants: Record<string, string> = {
    critical: 'bg-monitor-critical/20 text-monitor-critical border-monitor-critical/30',
    high: 'bg-monitor-high/20 text-monitor-high border-monitor-high/30',
    medium: 'bg-monitor-medium/20 text-monitor-medium border-monitor-medium/30',
    low: 'bg-monitor-low/20 text-monitor-low border-monitor-low/30',
    info: 'bg-monitor-info/20 text-monitor-info border-monitor-info/30',
    default: 'bg-gray-700/50 text-gray-300 border-gray-600/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border',
        variants[variant],
        className,
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {children}
    </span>
  );
};
