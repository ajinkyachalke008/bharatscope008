import React from 'react';
import type { MonitorEvent } from '@worldmonitor/shared';
import { TimelineItem } from './TimelineItem';
import { useEventStore } from '@/store/eventStore';
import { Clock } from 'lucide-react';

interface EventTimelineProps {
  events: MonitorEvent[];
  maxItems?: number;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ events, maxItems = 15 }) => {
  const selectEvent = useEventStore((s) => s.selectEvent);
  const displayEvents = events.slice(0, maxItems);

  return (
    <div className="glass-panel p-4 flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          Event Timeline
        </h3>
        <span className="text-xs text-gray-500 font-mono">{events.length} events</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {displayEvents.map((event, index) => (
          <TimelineItem key={event.id} event={event} onClick={() => selectEvent(event)} index={index} />
        ))}
        {displayEvents.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No events match filters
          </div>
        )}
      </div>
    </div>
  );
};
