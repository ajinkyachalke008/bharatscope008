import React from 'react';
import { useFeedStore } from '@/store/feedStore';
import { api } from '@/services/api';
import { Badge } from '@/components/common/Badge';
import { timeAgo } from '@/utils/formatters';
import { Bell, Check, AlertTriangle, AlertCircle, Eye, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

const LEVEL_CONFIG: Record<string, { icon: any; color: string }> = {
  critical: {
    icon: AlertTriangle,
    color: 'text-monitor-critical border-monitor-critical/30 bg-monitor-critical/5',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-monitor-high border-monitor-high/30 bg-monitor-high/5',
  },
  watch: { icon: Eye, color: 'text-monitor-medium border-monitor-medium/30 bg-monitor-medium/5' },
  info: { icon: Info, color: 'text-monitor-low border-monitor-low/30 bg-monitor-low/5' },
};

export const SignalPanel: React.FC<{ className?: string }> = ({ className }) => {
  const { alerts, acknowledgeAlert } = useFeedStore();

  const handleAcknowledge = async (id: string) => {
    try {
      await api.feeds.acknowledgeAlert(id);
      acknowledgeAlert(id);
    } catch {
      /* silent */
    }
  };

  return (
    <div className={cn('glass-panel p-4 flex flex-col', className ?? 'h-[400px]')}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-2">
          <Bell className="w-3.5 h-3.5" />
          Signal Alerts
          {alerts.length > 0 && (
            <span className="bg-monitor-critical text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {alerts.length}
            </span>
          )}
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
            <Check className="w-8 h-8 mb-2 text-monitor-success" />
            All clear — no active alerts
          </div>
        ) : (
          alerts.map((alert) => {
            const config = LEVEL_CONFIG[alert.level] || LEVEL_CONFIG.info;
            const Icon = config.icon;
            return (
              <div
                key={alert.id}
                className={cn('border rounded-lg p-3 animate-fade-in', config.color)}
              >
                <div className="flex items-start gap-2">
                  <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate">{alert.title}</div>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge
                        variant={
                          alert.level === 'critical'
                            ? 'critical'
                            : alert.level === 'warning'
                              ? 'high'
                              : 'default'
                        }
                      >
                        {alert.source}
                      </Badge>
                      <span className="text-xs text-gray-500 font-mono">
                        {timeAgo(alert.timestamp)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="text-xs text-gray-500 hover:text-gray-300 p-1 hover:bg-gray-700/50 rounded"
                    title="Acknowledge"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
