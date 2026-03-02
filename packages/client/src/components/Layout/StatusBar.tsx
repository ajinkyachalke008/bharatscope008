import React from 'react';
import { useEventStore } from '@/store/eventStore';
import { useFeedStore } from '@/store/feedStore';
import { useUIStore } from '@/store/uiStore';
import { Clock, Database, AlertCircle, Zap, Users } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const stats = useEventStore((s) => s.stats);
  const alertCount = useFeedStore((s) => s.alerts.length);
  const { wsConnected, connectionCount } = useUIStore();
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="h-7 bg-monitor-surface/90 border-t border-monitor-border flex items-center px-4 justify-between text-xs text-gray-500 font-mono">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {time.toISOString().slice(11, 19)}Z
        </span>
        <span className="flex items-center gap-1">
          <Database className="w-3 h-3" />
          {stats?.total || 0} events
        </span>
        {alertCount > 0 && (
          <span className="flex items-center gap-1 text-monitor-high">
            <AlertCircle className="w-3 h-3" />
            {alertCount} alerts
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        {connectionCount > 0 && (
          <span className="flex items-center gap-1 text-gray-500">
            <Users className="w-3 h-3" />
            {connectionCount} connected
          </span>
        )}
        <span className="flex items-center gap-1">
          <Zap
            className={`w-3 h-3 ${wsConnected ? 'text-monitor-success' : 'text-monitor-critical'}`}
          />
          {wsConnected ? 'Stream Active' : 'Reconnecting...'}
        </span>
        <span>v2.0.0</span>
      </div>
    </footer>
  );
};
