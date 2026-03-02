import React from 'react';
import { cn } from '@/utils/cn';

const FEED_TYPES = [
  { id: '', label: 'All' },
  { id: 'news', label: '📰 News' },
  { id: 'social', label: '💬 Social' },
  { id: 'government', label: '🏛️ Gov' },
  { id: 'sensor', label: '📡 Sensor' },
  { id: 'satellite', label: '🛰️ Satellite' },
  { id: 'intelligence', label: '🔍 Intel' },
];

interface FeedFilterProps {
  activeType: string;
  onTypeChange: (type: string) => void;
}

export const FeedFilter: React.FC<FeedFilterProps> = ({ activeType, onTypeChange }) => {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {FEED_TYPES.map((type) => (
        <button
          key={type.id}
          onClick={() => onTypeChange(type.id)}
          className={cn(
            'px-3 py-1.5 text-xs rounded-full border transition-all duration-200 hover:scale-105 active:scale-95',
            activeType === type.id
              ? 'border-monitor-accent/50 text-monitor-accent bg-monitor-accent/15 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
              : 'border-monitor-border text-gray-400 hover:border-gray-500 hover:text-gray-200 hover:bg-monitor-surface2',
          )}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
};
