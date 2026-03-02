import React, { useState, useEffect } from 'react';
import { useFeedStore } from '@/store/feedStore';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export const AlertBanner: React.FC = () => {
  const alerts = useFeedStore((s) => s.alerts);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const criticalAlerts = alerts.filter((a) => a.level === 'critical' && !dismissed.has(a.id));

  if (criticalAlerts.length === 0) return null;
  const latest = criticalAlerts[0];

  return (
    <div className="bg-monitor-critical/10 border-b border-monitor-critical/30 px-4 py-2 flex items-center gap-3 animate-slide-in">
      <AlertTriangle className="w-4 h-4 text-monitor-critical animate-pulse flex-shrink-0" />
      <span className="text-xs text-monitor-critical font-medium flex-1 truncate">
        {latest.title}: {latest.message}
      </span>
      <button
        onClick={() => setDismissed((s) => new Set(s).add(latest.id))}
        className="text-monitor-critical/50 hover:text-monitor-critical"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
