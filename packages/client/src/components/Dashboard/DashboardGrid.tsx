import React from 'react';
import { Activity, AlertTriangle, Shield, Zap, TrendingUp, Eye } from 'lucide-react';
import { StatCard } from './StatCard';
import { ThreatGauge } from './ThreatGauge';
import { CategoryBreakdown } from './CategoryBreakdown';
import { RegionSummary } from './RegionSummary';
import { EventDetailModal } from './EventDetailModal';
import { EventTimeline } from '@/components/Timeline/EventTimeline';
import { LiveFeed } from '@/components/Feed/LiveFeed';
import { SignalPanel } from '@/components/Signals/SignalPanel';
import { LiveMediaPanel } from '@/components/Media/LiveMediaPanel';
import { useEvents } from '@/hooks/useEvents';
import { useFeeds } from '@/hooks/useFeeds';
import { useEventStore } from '@/store/eventStore';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatNumber } from '@/utils/formatters';

export const DashboardGrid: React.FC = () => {
  const { stats, events, loading: eventsLoading } = useEvents();
  const { alerts } = useFeeds();
  const selectedEvent = useEventStore((s) => s.selectedEvent);
  const selectEvent = useEventStore((s) => s.selectEvent);

  if (eventsLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const threatLevel = stats
    ? Math.min(
        100,
        Math.round(
          (((stats.bySeverity.critical || 0) * 20 +
            (stats.bySeverity.high || 0) * 10 +
            (stats.bySeverity.medium || 0) * 5) /
            Math.max(stats.total, 1)) *
            10,
        ),
      )
    : 0;

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Total Events"
          value={stats?.total || 0}
          icon={Activity}
          color="text-monitor-accent"
          format={formatNumber}
        />
        <StatCard
          title="Last 24h"
          value={stats?.last24h || 0}
          icon={TrendingUp}
          color="text-cyan-400"
        />
        <StatCard
          title="Last Hour"
          value={stats?.lastHour || 0}
          icon={Zap}
          color="text-yellow-400"
        />
        <StatCard
          title="Critical"
          value={stats?.bySeverity.critical || 0}
          icon={AlertTriangle}
          color="text-monitor-critical"
        />
        <StatCard
          title="Active"
          value={stats?.byStatus.active || 0}
          icon={Eye}
          color="text-monitor-success"
        />
        <StatCard
          title="Active Alerts"
          value={alerts.length}
          icon={Shield}
          color="text-monitor-high"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ThreatGauge level={threatLevel} />
        {stats && <CategoryBreakdown stats={stats} />}
        <RegionSummary />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <SignalPanel />
        </div>
        <div className="lg:col-span-1">
          <LiveMediaPanel />
        </div>
        <div className="lg:col-span-1">
          <EventTimeline events={events.slice(0, 20)} />
        </div>
        <div className="lg:col-span-1">
          <LiveFeed compact />
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={() => selectEvent(null)} />
      )}
    </div>
  );
};
