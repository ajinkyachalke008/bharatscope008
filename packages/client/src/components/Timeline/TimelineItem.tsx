import React from 'react';
import type { MonitorEvent } from '@worldmonitor/shared';
import { CATEGORY_ICONS, SEVERITY_COLORS } from '@worldmonitor/shared';
import { timeAgo, capitalize } from '@/utils/formatters';
import { Badge } from '@/components/common/Badge';
import { MapPin, CheckCircle } from 'lucide-react';

interface TimelineItemProps {
  event: MonitorEvent;
  onClick?: () => void;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ event, onClick }) => {
  return (
    <div
      className="feed-item animate-fade-in cursor-pointer"
      style={{ borderLeftColor: SEVERITY_COLORS[event.severity] }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm">{CATEGORY_ICONS[event.category]}</span>
            <span className="text-xs font-medium text-gray-300 truncate">{event.title}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={event.severity as any}>{capitalize(event.severity)}</Badge>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {event.location.name}
            </span>
            {event.verified && <CheckCircle className="w-3 h-3 text-monitor-success" />}
          </div>
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap font-mono">
          {timeAgo(event.timestamp)}
        </span>
      </div>
    </div>
  );
};
