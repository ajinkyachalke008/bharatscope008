import axios from 'axios';
import type { FeedItem } from '@worldmonitor/shared';
import { logger } from '../../utils/logger';

// YouTube RSS feeds for major live news channels (free, no API key needed)
const YOUTUBE_NEWS_CHANNELS = [
  { id: 'UCNye-wNBqNL5ZzHSJj3l8Bg', name: 'Al Jazeera English' },
  { id: 'UCoMdktPbSTixAyNGwb-UYkQ', name: 'Sky News' },
  { id: 'UC_gUM8rL-Lrg6O3adPW9K1g', name: 'WION' },
  { id: 'UCknLrEdhRCp1aegoMqRaCZg', name: 'DW News' },
  { id: 'UCupvZG-5ko_eiXAupbDfxWw', name: 'CNN' },
  { id: 'UCeY0bbntWzzVIaj2z3QigXg', name: 'NBC News' },
];

interface YouTubeVideoEntry {
  id: string;
  title: string;
  published: string;
  channelName: string;
  channelId: string;
  thumbnailUrl: string;
  videoUrl: string;
}

export class YouTubeIngester {
  private seenIds: Set<string> = new Set();
  private callbacks: Array<(feed: FeedItem) => void> = [];

  onNewFeed(cb: (feed: FeedItem) => void) {
    this.callbacks.push(cb);
  }

  private emit(feed: FeedItem) {
    for (const cb of this.callbacks) cb(feed);
  }

  async poll() {
    logger.info('Polling YouTube RSS feeds...');
    let totalNew = 0;

    for (const channel of YOUTUBE_NEWS_CHANNELS) {
      try {
        const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`;
        const response = await axios.get(url, {
          timeout: 15000,
          headers: { 'User-Agent': 'WorldMonitor/3.0' },
          responseType: 'text',
        });

        const entries = this.parseXMLEntries(response.data, channel.name, channel.id);

        for (const entry of entries) {
          if (this.seenIds.has(entry.id)) continue;
          this.seenIds.add(entry.id);

          const feed = this.transformToFeedItem(entry);
          this.emit(feed);
          totalNew++;
        }

        // Keep only last 500 seen IDs
        if (this.seenIds.size > 500) {
          const arr = Array.from(this.seenIds);
          this.seenIds = new Set(arr.slice(arr.length - 500));
        }
      } catch (err: any) {
        logger.error(`Error polling YouTube channel ${channel.name}: ${err.message}`);
      }
    }

    if (totalNew > 0) {
      logger.info(`YouTube: Ingested ${totalNew} new video feeds`);
    }
  }

  private parseXMLEntries(
    xml: string,
    channelName: string,
    channelId: string,
  ): YouTubeVideoEntry[] {
    const entries: YouTubeVideoEntry[] = [];

    // Simple XML regex parser (avoids heavyweight XML dependency)
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;

    while ((match = entryRegex.exec(xml)) !== null) {
      const entry = match[1];

      const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
      const titleMatch = entry.match(/<title>(.*?)<\/title>/);
      const publishedMatch = entry.match(/<published>(.*?)<\/published>/);

      if (!videoIdMatch || !titleMatch) continue;

      const videoId = videoIdMatch[1];
      const title = this.decodeXMLEntities(titleMatch[1]);
      const published = publishedMatch?.[1] || new Date().toISOString();

      entries.push({
        id: videoId,
        title,
        published,
        channelName,
        channelId,
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      });
    }

    return entries.slice(0, 5); // Only take 5 most recent per channel
  }

  private decodeXMLEntities(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  private transformToFeedItem(entry: YouTubeVideoEntry): FeedItem {
    return {
      id: `yt-${entry.id}`,
      type: 'news',
      title: entry.title,
      summary: `${entry.channelName} — Watch on YouTube`,
      source: entry.channelName,
      sourceUrl: entry.videoUrl,
      timestamp: entry.published,
      category: 'political',
      severity: 'medium',
      tags: ['video', 'youtube', 'news', entry.channelName.toLowerCase()],
      credibility: 0.9,
      // Multimedia fields
      videoUrl: entry.videoUrl,
      thumbnailUrl: entry.thumbnailUrl,
      videoType: 'youtube',
      channelName: entry.channelName,
      isLive: false,
    };
  }
}
