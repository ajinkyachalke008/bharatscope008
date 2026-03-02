import React from 'react';
import type { FeedItem } from '@worldmonitor/shared';
import { CATEGORY_ICONS } from '@worldmonitor/shared';
import { timeAgo, capitalize, truncate } from '@/utils/formatters';
import { Badge } from '@/components/common/Badge';
import { ExternalLink, MapPin, TrendingUp, Play, Tv } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useMediaStore } from '@/store/mediaStore';

interface FeedCardProps {
  item: FeedItem;
  compact?: boolean;
  index?: number;
}

const TYPE_COLORS: Record<string, string> = {
  news: 'border-l-blue-500',
  social: 'border-l-pink-500',
  government: 'border-l-purple-500',
  sensor: 'border-l-cyan-500',
  satellite: 'border-l-green-500',
  intelligence: 'border-l-amber-500',
};

export const FeedCard: React.FC<FeedCardProps> = ({ item, compact = false, index = 0 }) => {
  const playVideo = useMediaStore((s) => s.playVideo);
  const hasVideo = !!(item.videoUrl && item.thumbnailUrl);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.videoUrl) {
      playVideo({
        url: item.videoUrl,
        title: item.title,
        source: item.source,
        thumbnailUrl: item.thumbnailUrl,
        channelName: item.channelName,
        isLive: item.isLive,
      });
    }
  };

  return (
    <div
      className={cn(
        'feed-item animate-slide-down opacity-0 [animation-fill-mode:forwards] transition-all duration-300 hover:-translate-y-1 hover:shadow-subtle hover:bg-monitor-surface2/80',
        TYPE_COLORS[item.type] || 'border-l-gray-500'
      )}
      style={{ animationDelay: `${Math.min(index * 0.05, 1)}s` }}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Video thumbnail */}
        {hasVideo && !compact && (
          <div
            className="relative flex-shrink-0 w-28 h-16 rounded overflow-hidden cursor-pointer group"
            onClick={handlePlay}
          >
            <img
              src={item.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            {/* Play overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              </div>
            </div>
            {/* YouTube badge */}
            <div className="absolute top-1 left-1">
              <Tv className="w-3 h-3 text-red-500" />
            </div>
            {item.isLive && (
              <div className="absolute top-1 right-1 px-1 py-0.5 bg-red-600 rounded text-[8px] font-bold text-white">
                LIVE
              </div>
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs">{CATEGORY_ICONS[item.category] || '📌'}</span>
            <span className="text-xs font-medium text-gray-200 truncate">
              {compact ? truncate(item.title, 50) : item.title}
            </span>
            {hasVideo && compact && (
              <button onClick={handlePlay} className="flex-shrink-0">
                <Play className="w-3 h-3 text-red-500 fill-red-500" />
              </button>
            )}
          </div>
          {!compact && <p className="text-xs text-gray-400 mb-1.5 line-clamp-2">{item.summary}</p>}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="default">{capitalize(item.type)}</Badge>
            {item.severity && (
              <Badge variant={item.severity as any}>{capitalize(item.severity)}</Badge>
            )}
            {item.videoType && (
              <Badge variant="default">
                <span className="flex items-center gap-0.5">
                  <Tv className="w-2.5 h-2.5" />
                  {item.channelName || 'Video'}
                </span>
              </Badge>
            )}
            <span className="text-xs text-gray-500">{item.source}</span>
            {item.location && (
              <span className="text-xs text-gray-500 flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {item.location.name}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-gray-500 font-mono whitespace-nowrap">
            {timeAgo(item.timestamp)}
          </span>
          {item.credibility >= 0.8 && <TrendingUp className="w-3 h-3 text-monitor-success" />}
          {hasVideo ? (
            <button
              onClick={handlePlay}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title="Play video"
            >
              <Play className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            </button>
          ) : item.sourceUrl ? (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3 text-gray-600 hover:text-gray-400 cursor-pointer transition-colors" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
};
