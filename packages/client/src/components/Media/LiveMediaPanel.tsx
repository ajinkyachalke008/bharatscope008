import React from 'react';
import { Tv } from 'lucide-react';
import { useFeeds } from '@/hooks/useFeeds';
import { FeedCard } from '@/components/Feed/FeedCard';

export const LiveMediaPanel: React.FC = () => {
  const { feeds } = useFeeds();

  // Filter to only include items with a video URL
  const videoFeeds = feeds.filter((f) => f.videoUrl).slice(0, 10);

  return (
    <div className="glass-panel flex flex-col h-[400px] overflow-hidden">
      <div className="p-3 border-b border-white/5 flex items-center justify-between shadow-sm bg-white/5">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-red-500" />
          <h3 className="font-semibold text-sm text-gray-200 uppercase tracking-wider">
            Live Media
          </h3>
        </div>
        <span className="text-xs font-mono text-gray-400 bg-black/30 px-2 py-0.5 rounded">
          {videoFeeds.length} streams
        </span>
      </div>
      <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
        {videoFeeds.length > 0 ? (
          videoFeeds.map((feed) => <FeedCard key={feed.id} item={feed} compact={false} />)
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
            <Tv className="w-8 h-8 opacity-20" />
            <span className="text-sm">Awaiting video streams...</span>
          </div>
        )}
      </div>
    </div>
  );
};
