export type FeedType = 'news' | 'social' | 'government' | 'sensor' | 'satellite' | 'intelligence';

export interface FeedItem {
  id: string;
  type: FeedType;
  title: string;
  summary: string;
  source: string;
  sourceUrl?: string;
  timestamp: string;
  category: string;
  severity?: string;
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
  tags: string[];
  sentiment?: number;
  credibility: number;
  relatedEventId?: string;
  // Phase 2: Multimedia fields
  videoUrl?: string;
  thumbnailUrl?: string;
  videoType?: 'youtube' | 'twitch' | 'hls' | 'mp4';
  videoDuration?: string;
  channelName?: string;
  isLive?: boolean;
}

export interface FeedChannel {
  id: string;
  name: string;
  type: FeedType;
  active: boolean;
  lastUpdate: string;
  itemCount: number;
  reliability: number;
}

export interface SignalAlert {
  id: string;
  level: 'critical' | 'warning' | 'watch' | 'info';
  title: string;
  message: string;
  timestamp: string;
  source: string;
  acknowledged: boolean;
  eventId?: string;
}

export interface WebSocketMessage {
  type: 'event' | 'feed' | 'alert' | 'stats' | 'heartbeat';
  payload: unknown;
  timestamp: string;
}
