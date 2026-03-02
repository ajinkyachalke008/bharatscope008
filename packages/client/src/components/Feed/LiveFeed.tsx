import React from 'react';
import { useFeedStore } from '@/store/feedStore';
import { FeedCard } from './FeedCard';
import { Rss } from 'lucide-react';

interface LiveFeedProps {
  compact?: boolean;
}

export const LiveFeed: React.FC<LiveFeedProps> = ({ compact = false }) => {
  const feeds = useFeedStore((s) => s.feeds);
  const displayFeeds = feeds.slice(0, compact ? 10 : 30);

  return (
    <div className="glass-panel p-4 flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-2">
          <Rss className="w-3.5 h-3.5" />
          Live Feed
        </h3>
        <span className="text-xs text-gray-500 font-mono">{feeds.length} items</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {displayFeeds.map((item) => (
          <FeedCard key={item.id} item={item} compact={compact} />
        ))}
        {displayFeeds.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No feed data
          </div>
        )}
      </div>
    </div>
  );
};
