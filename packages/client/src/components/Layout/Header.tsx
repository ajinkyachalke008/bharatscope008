import React from 'react';
import { Globe, Radio, Wifi, WifiOff, Menu } from 'lucide-react';
import { useUIStore } from '@/store';
import { Badge } from '@/components/common/Badge';
import { cn } from '@/utils/cn';

export const Header: React.FC = () => {
  const { wsConnected, toggleSidebar } = useUIStore();
  const [clockTime, setClockTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setClockTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-14 bg-monitor-surface/90 backdrop-blur-xl border-b border-monitor-border flex items-center px-4 justify-between z-50 animate-slide-down shadow-subtle">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-monitor-surface2 rounded-lg transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Globe className="w-6 h-6 text-monitor-accent" />
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-monitor-accent">WORLD</span>
            <span className="text-gray-300">MONITOR</span>
          </h1>
        </div>
        <Badge variant="info" className="hidden sm:inline-flex">
          <Radio className="w-3 h-3" />
          LIVE
        </Badge>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 font-mono">
          <span>{clockTime.toISOString().slice(0, 19)}Z</span>
        </div>
        <div
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium',
            wsConnected
              ? 'text-monitor-success bg-monitor-success/10'
              : 'text-monitor-critical bg-monitor-critical/10',
          )}
        >
          {wsConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {wsConnected ? 'CONNECTED' : 'OFFLINE'}
        </div>
      </div>
    </header>
  );
};
