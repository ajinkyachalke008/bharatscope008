import React from 'react';
import { useFeeds } from '@/hooks/useFeeds';
import { FeedCard } from '@/components/Feed/FeedCard';
import { FeedFilter } from '@/components/Feed/FeedFilter';
import { SignalPanel } from '@/components/Signals/SignalPanel';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const FeedsPage: React.FC = () => {
  const [filterType, setFilterType] = React.useState('');
  const { feeds, loading } = useFeeds(filterType || undefined);

  return (
    <div className="h-full w-full flex p-4 gap-4">
      {/* Main Feed Activity */}
      <div className="flex-1 glass-panel flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-monitor-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold mb-1">Intelligence Feeds</h2>
            <p className="text-xs text-gray-400">Real-time data streams from global sources</p>
          </div>
          <FeedFilter activeType={filterType} onTypeChange={setFilterType} />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading && feeds.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <LoadingSpinner />
            </div>
          ) : feeds.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
              No feed items match the current filter
            </div>
          ) : (
            feeds.map((item) => <FeedCard key={item.id} item={item} />)
          )}
        </div>
      </div>

      {/* Signals Panel */}
      <div className="w-80 flex flex-col h-full">
        <SignalPanel className="h-full" />
      </div>
    </div>
  );
};
