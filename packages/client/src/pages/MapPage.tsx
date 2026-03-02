import React from 'react';
import { GlobeScene } from '@/components/Globe/GlobeScene';
import { EventTimeline } from '@/components/Timeline/EventTimeline';
import { TimelineFilter } from '@/components/Timeline/TimelineFilter';
import { MapControls } from '@/components/Map/MapControls';
import { useEvents } from '@/hooks/useEvents';

export const MapPage: React.FC = () => {
  const { events } = useEvents();

  return (
    <div className="flex h-full">
      {/* Globe - takes most of the space */}
      <div className="flex-1 relative">
        <GlobeScene />
        {/* Layer controls overlay */}
        <MapControls />
      </div>

      {/* Right sidebar: filters + timeline */}
      <div className="w-80 border-l border-monitor-border bg-monitor-surface/50 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-monitor-border">
          <TimelineFilter />
        </div>
        <div className="flex-1 overflow-hidden p-3">
          <EventTimeline events={events} maxItems={30} />
        </div>
      </div>
    </div>
  );
};
