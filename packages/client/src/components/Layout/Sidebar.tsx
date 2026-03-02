import React from 'react';
import { LayoutDashboard, Map, Rss, Settings, Activity, Shield } from 'lucide-react';
import { useUIStore } from '@/store';
import { useEventStore } from '@/store/eventStore';
import { useFeedStore } from '@/store/feedStore';
import { cn } from '@/utils/cn';

const NAV_ITEMS = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bharat' as const, label: 'Bharat v3', icon: Activity },
  { id: 'map' as const, label: 'Map', icon: Map },
  { id: 'feeds' as const, label: 'Feeds', icon: Rss },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage, sidebarOpen } = useUIStore();
  const stats = useEventStore((s) => s.stats);
  const alerts = useFeedStore((s) => s.alerts);

  return (
    <aside
      className={cn(
        'bg-monitor-surface/90 backdrop-blur-xl border-r border-monitor-border flex flex-col transition-all duration-300 z-40',
        sidebarOpen ? 'w-56' : 'w-16',
      )}
    >
      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          const alertCount = item.id === 'feeds' ? alerts.length : 0;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{ animationDelay: `${index * 0.05}s` }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 text-sm font-medium animate-slide-in opacity-0 [animation-fill-mode:forwards]',
                isActive
                  ? 'bg-monitor-accent/15 text-monitor-accent border border-monitor-accent/30 shadow-subtle'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-monitor-surface2 hover:-translate-y-0.5',
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
              {sidebarOpen && alertCount > 0 && (
                <span className="ml-auto bg-monitor-critical text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {alertCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {sidebarOpen && stats && (
        <div className="p-3 border-t border-monitor-border">
          <div className="glass-panel p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <Activity className="w-3.5 h-3.5" />
              SYSTEM STATUS
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-gray-500">Events</div>
                <div className="text-gray-200 font-mono font-semibold">{stats.total}</div>
              </div>
              <div>
                <div className="text-gray-500">24h</div>
                <div className="text-gray-200 font-mono font-semibold">{stats.last24h}</div>
              </div>
              <div>
                <div className="text-gray-500">Critical</div>
                <div className="text-monitor-critical font-mono font-semibold">
                  {stats.bySeverity.critical}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Trend</div>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-monitor-accent" />
                  <span className="text-gray-200 font-mono">{stats.trend}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
