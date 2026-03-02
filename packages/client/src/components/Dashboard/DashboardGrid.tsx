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
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/utils/cn';

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

  const { isVisible: isStatsVisible, domRef: statsRef } = useIntersectionObserver();
  const { isVisible: isChartsVisible, domRef: chartsRef } = useIntersectionObserver();
  const { isVisible: isWidgetsVisible, domRef: widgetsRef } = useIntersectionObserver();

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <div
        ref={statsRef}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        <div className={cn('opacity-0 transition-all duration-700 ease-out', isStatsVisible ? 'opacity-100 translate-y-0' : 'translate-y-8')} style={{ transitionDelay: '0ms' }}>
          <StatCard
            title="Total Events"
            value={stats?.total || 0}
            icon={Activity}
            color="text-monitor-accent"
            format={formatNumber}
          />
        </div>
        <div className={cn('opacity-0 transition-all duration-700 ease-out', isStatsVisible ? 'opacity-100 translate-y-0' : 'translate-y-8')} style={{ transitionDelay: '100ms' }}>
          <StatCard
            title="Last 24h"
            value={stats?.last24h || 0}
            icon={TrendingUp}
            color="text-cyan-400"
          />
        </div>
        <div className={cn('opacity-0 transition-all duration-700 ease-out', isStatsVisible ? 'opacity-100 translate-y-0' : 'translate-y-8')} style={{ transitionDelay: '200ms' }}>
          <StatCard
            title="Last Hour"
            value={stats?.lastHour || 0}
            icon={Zap}
            color="text-yellow-400"
          />
        </div>
        <div className={cn('opacity-0 transition-all duration-700 ease-out', isStatsVisible ? 'opacity-100 translate-y-0' : 'translate-y-8')} style={{ transitionDelay: '300ms' }}>
          <StatCard
            title="Critical"
            value={stats?.bySeverity.critical || 0}
            icon={AlertTriangle}
            color="text-monitor-critical"
          />
        </div>
        <div className={cn('opacity-0 transition-all duration-700 ease-out', isStatsVisible ? 'opacity-100 translate-y-0' : 'translate-y-8')} style={{ transitionDelay: '400ms' }}>
          <StatCard
            title="Active"
            value={stats?.byStatus.active || 0}
            icon={Eye}
            color="text-monitor-success"
          />
        </div>
        <div className={cn('opacity-0 transition-all duration-700 ease-out', isStatsVisible ? 'opacity-100 translate-y-0' : 'translate-y-8')} style={{ transitionDelay: '500ms' }}>
          <StatCard
            title="Active Alerts"
            value={alerts.length}
            icon={Shield}
            color="text-monitor-high"
          />
        </div>
      </div>
      <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={cn('opacity-0 transition-all duration-700 ease-out', isChartsVisible ? 'opacity-100 translate-y-0' : 'translate-y-8')} style={{ transitionDelay: '100ms' }}>
          <ThreatGauge level={threatLevel} />
        </div>
        <div className={cn('opacity-0 transition-all duration-700 ease-out', isChartsVisible ? 'opacity-100 translate-y-0' : 'translate-y-8')} style={{ transitionDelay: '200ms' }}>
          {stats && <CategoryBreakdown stats={stats} />}
        </div>
        <div className={cn('opacity-0 transition-all duration-700 ease-out', isChartsVisible ? 'opacity-100 translate-y-0' : 'translate-y-8')} style={{ transitionDelay: '300ms' }}>
          <RegionSummary />
        </div>
      </div>
      <div ref={widgetsRef} className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className={cn('opacity-0 transition-all duration-700 ease-out lg:col-span-1', isWidgetsVisible ? 'opacity-100 translate-y-0' : 'translate-y-8')} style={{ transitionDelay: '100ms' }}>
          <SignalPanel />
        </div>
        <div className={cn('opacity-0 transition-all duration-700 ease-out lg:col-span-1', isWidgetsVisible ? 'opacity-100 translate-y-0' : 'translate-y-8')} style={{ transitionDelay: '200ms' }}>
          <LiveMediaPanel />
        </div>
        <div className={cn('opacity-0 transition-all duration-700 ease-out lg:col-span-1', isWidgetsVisible ? 'opacity-100 translate-y-0' : 'translate-y-8')} style={{ transitionDelay: '300ms' }}>
          <EventTimeline events={events.slice(0, 20)} />
        </div>
        <div className={cn('opacity-0 transition-all duration-700 ease-out lg:col-span-1', isWidgetsVisible ? 'opacity-100 translate-y-0' : 'translate-y-8')} style={{ transitionDelay: '400ms' }}>
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
