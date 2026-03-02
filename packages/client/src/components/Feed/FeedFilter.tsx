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
            'px-2.5 py-1 text-xs rounded-full border transition-all',
            activeType === type.id
              ? 'border-monitor-accent/50 text-monitor-accent bg-monitor-accent/10'
              : 'border-gray-700 text-gray-500 hover:text-gray-300',
          )}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
};
