import { Panel } from './Panel';
import { isDesktopRuntime, getApiBaseUrl } from '@/services/runtime';
import { escapeHtml } from '@/utils/sanitize';
import { t } from '../services/i18n';
import { trackWebcamSelected, trackWebcamRegionFiltered } from '@/services/analytics';
import { getStreamQuality, subscribeStreamQualityChange } from '@/services/ai-flow-settings';
import { fetchLiveVideoInfo } from '@/services/live-news';

type WebcamRegion = 'india' | 'middle-east' | 'europe' | 'asia' | 'americas';

interface WebcamFeed {
  id: string;
  city: string;
  country: string;
  region: WebcamRegion;
  channelHandle: string;
  fallbackVideoId: string;
}

// Verified YouTube live stream IDs — validated Feb 2026 via title cross-check.
// IDs may rotate; update when stale.
const WEBCAM_FEEDS: WebcamFeed[] = [
  // ─── India — 24/7 Live Broadcast & City Feeds ───
  {
    id: 'delhi-aajtak',
    city: 'Delhi (Aaj Tak)',
    country: 'India',
    region: 'india',
    channelHandle: '@aajtak',
    fallbackVideoId: '8LXzghudyLA',
  },
  {
    id: 'mumbai-abp',
    city: 'Mumbai (ABP News)',
    country: 'India',
    region: 'india',
    channelHandle: '@ABPNews',
    fallbackVideoId: 'ubOIfNDeimA',
  },
  {
    id: 'delhi-ndtv',
    city: 'Delhi (NDTV)',
    country: 'India',
    region: 'india',
    channelHandle: '@NDTV',
    fallbackVideoId: 'qPEoNHbCPQo',
  },
  {
    id: 'india-indiatv',
    city: 'India (India TV)',
    country: 'India',
    region: 'india',
    channelHandle: '@IndiaTV',
    fallbackVideoId: 'pIoTwiXgLdU',
  },
  {
    id: 'india-zeenews',
    city: 'India (Zee News)',
    country: 'India',
    region: 'india',
    channelHandle: '@zeenews',
    fallbackVideoId: 'g4EyETzyy40',
  },
  {
    id: 'india-news18',
    city: 'India (News18)',
    country: 'India',
    region: 'india',
    channelHandle: '@News18India',
    fallbackVideoId: 'HV-Lp-RTVl8',
  },
  {
    id: 'india-ndtv-hindi',
    city: 'Delhi (NDTV India)',
    country: 'India',
    region: 'india',
    channelHandle: '@NDTVIndia',
    fallbackVideoId: '5xy3gHT66WE',
  },
  {
    id: 'india-republic',
    city: 'Noida (Republic)',
    country: 'India',
    region: 'india',
    channelHandle: '@RepublicWorld',
    fallbackVideoId: 'RCB6c2nWhC8',
  },
  {
    id: 'india-wion',
    city: 'India (WION)',
    country: 'India',
    region: 'india',
    channelHandle: '@WION',
    fallbackVideoId: 'U7XCACq3HFg',
  },
  {
    id: 'india-timesnow',
    city: 'India (Times Now)',
    country: 'India',
    region: 'india',
    channelHandle: '@TimesNow',
    fallbackVideoId: 'DaWgCv-gbCQ',
  },
  // Middle East — Jerusalem & Tehran adjacent (conflict hotspots)
  {
    id: 'jerusalem',
    city: 'Jerusalem',
    country: 'Israel',
    region: 'middle-east',
    channelHandle: '@TheWesternWall',
    fallbackVideoId: 'W8Xqepd4DvE',
  },
  {
    id: 'tehran',
    city: 'Tehran',
    country: 'Iran',
    region: 'middle-east',
    channelHandle: '@IranHDCams',
    fallbackVideoId: '-zGuR1qVKrU',
  },
  {
    id: 'tel-aviv',
    city: 'Tel Aviv',
    country: 'Israel',
    region: 'middle-east',
    channelHandle: '@IsraelLiveCam',
    fallbackVideoId: '-VLcYT5QBrY',
  },
  {
    id: 'mecca',
    city: 'Mecca',
    country: 'Saudi Arabia',
    region: 'middle-east',
    channelHandle: '@MakkahLive',
    fallbackVideoId: 'DEcpmPUbkDQ',
  },
  // Europe
  {
    id: 'kyiv',
    city: 'Kyiv',
    country: 'Ukraine',
    region: 'europe',
    channelHandle: '@DWNews',
    fallbackVideoId: '-Q7FuPINDjA',
  },
  {
    id: 'odessa',
    city: 'Odessa',
    country: 'Ukraine',
    region: 'europe',
    channelHandle: '@UkraineLiveCam',
    fallbackVideoId: 'e2gC37ILQmk',
  },
  {
    id: 'paris',
    city: 'Paris',
    country: 'France',
    region: 'europe',
    channelHandle: '@PalaisIena',
    fallbackVideoId: 'OzYp4NRZlwQ',
  },
  {
    id: 'st-petersburg',
    city: 'St. Petersburg',
    country: 'Russia',
    region: 'europe',
    channelHandle: '@SPBLiveCam',
    fallbackVideoId: 'CjtIYbmVfck',
  },
  {
    id: 'london',
    city: 'London',
    country: 'UK',
    region: 'europe',
    channelHandle: '@EarthCam',
    fallbackVideoId: 'Lxqcg1qt0XU',
  },
  // Americas
  {
    id: 'washington',
    city: 'Washington DC',
    country: 'USA',
    region: 'americas',
    channelHandle: '@AxisCommunications',
    fallbackVideoId: '1wV9lLe14aU',
  },
  {
    id: 'new-york',
    city: 'New York',
    country: 'USA',
    region: 'americas',
    channelHandle: '@EarthCam',
    fallbackVideoId: '4qyZLflp-sI',
  },
  {
    id: 'los-angeles',
    city: 'Los Angeles',
    country: 'USA',
    region: 'americas',
    channelHandle: '@VeniceVHotel',
    fallbackVideoId: 'EO_1LWqsCNE',
  },
  {
    id: 'miami',
    city: 'Miami',
    country: 'USA',
    region: 'americas',
    channelHandle: '@FloridaLiveCams',
    fallbackVideoId: '5YCajRjvWCg',
  },
  // Asia-Pacific — Taipei first (strait hotspot), then Shanghai, Tokyo, Seoul
  {
    id: 'taipei',
    city: 'Taipei',
    country: 'Taiwan',
    region: 'asia',
    channelHandle: '@TaoyuanTravel',
    fallbackVideoId: '91PfFoqvuUk',
  },
  {
    id: 'shanghai',
    city: 'Shanghai',
    country: 'China',
    region: 'asia',
    channelHandle: '@SkylineWebcams',
    fallbackVideoId: '76EwqI5XZIc',
  },
  {
    id: 'tokyo',
    city: 'Tokyo',
    country: 'Japan',
    region: 'asia',
    channelHandle: '@KabukichoLive',
    fallbackVideoId: 'DjdUEyjx8GM',
  },
  {
    id: 'seoul',
    city: 'Seoul',
    country: 'South Korea',
    region: 'asia',
    channelHandle: '@UNvillage_live',
    fallbackVideoId: '-JhoMGoAfFc',
  },
  {
    id: 'sydney',
    city: 'Sydney',
    country: 'Australia',
    region: 'asia',
    channelHandle: '@WebcamSydney',
    fallbackVideoId: '7pcL-0Wo77U',
  },
];

const MAX_GRID_CELLS = 4;

type ViewMode = 'grid' | 'single';
type RegionFilter = 'all' | WebcamRegion;

export class LiveWebcamsPanel extends Panel {
  private viewMode: ViewMode = 'grid';
  private regionFilter: RegionFilter = 'all';
  private activeFeed: WebcamFeed = WEBCAM_FEEDS[0]!;
  private toolbar: HTMLElement | null = null;
  private iframes: HTMLIFrameElement[] = [];
  private observer: IntersectionObserver | null = null;
  private isVisible = false;
  private idleTimeout: ReturnType<typeof setTimeout> | null = null;
  private boundIdleResetHandler!: () => void;
  private boundVisibilityHandler!: () => void;
  private readonly IDLE_PAUSE_MS = 5 * 60 * 1000;
  private isIdle = false;
  private resolvedVideoIds = new Map<string, string>();

  constructor() {
    super({ id: 'live-webcams', title: t('panels.liveWebcams') });
    this.element.classList.add('panel-wide');
    this.createToolbar();
    this.setupIntersectionObserver();
    this.setupIdleDetection();
    subscribeStreamQualityChange(() => this.render());
    void this.resolveLiveFeeds();
    this.render();
  }

  private async resolveLiveFeeds(): Promise<void> {
    for (const feed of WEBCAM_FEEDS) {
      if (feed.channelHandle) {
        try {
          const info = await fetchLiveVideoInfo(feed.channelHandle);
          if (info.videoId && info.videoId !== feed.fallbackVideoId) {
            this.resolvedVideoIds.set(feed.id, info.videoId);
          }
        } catch {}
      }
    }
  }

  private getFeedVideoId(feed: WebcamFeed): string {
    return this.resolvedVideoIds.get(feed.id) || feed.fallbackVideoId;
  }

  private get filteredFeeds(): WebcamFeed[] {
    if (this.regionFilter === 'all') return WEBCAM_FEEDS;
    return WEBCAM_FEEDS.filter((f) => f.region === this.regionFilter);
  }

  private static readonly ALL_GRID_IDS = ['delhi-aajtak', 'mumbai-abp', 'delhi-ndtv', 'india-indiatv'];

  private get gridFeeds(): WebcamFeed[] {
    if (this.regionFilter === 'all') {
      return LiveWebcamsPanel.ALL_GRID_IDS.map(
        (id) => WEBCAM_FEEDS.find((f) => f.id === id)!,
      ).filter(Boolean);
    }
    return this.filteredFeeds.slice(0, MAX_GRID_CELLS);
  }

  private createToolbar(): void {
    this.toolbar = document.createElement('div');
    this.toolbar.className = 'webcam-toolbar';

    const regionGroup = document.createElement('div');
    regionGroup.className = 'webcam-toolbar-group';

    const regions: { key: RegionFilter; label: string }[] = [
      { key: 'all', label: t('components.webcams.regions.all') },
      { key: 'india', label: '🇮🇳 India' },
      { key: 'middle-east', label: t('components.webcams.regions.mideast') },
      { key: 'europe', label: t('components.webcams.regions.europe') },
      { key: 'americas', label: t('components.webcams.regions.americas') },
      { key: 'asia', label: t('components.webcams.regions.asia') },
    ];

    regions.forEach(({ key, label }) => {
      const btn = document.createElement('button');
      btn.className = `webcam-region-btn${key === this.regionFilter ? ' active' : ''}`;
      btn.dataset.region = key;
      btn.textContent = label;
      btn.addEventListener('click', () => this.setRegionFilter(key));
      regionGroup.appendChild(btn);
    });

    const viewGroup = document.createElement('div');
    viewGroup.className = 'webcam-toolbar-group';

    const gridBtn = document.createElement('button');
    gridBtn.className = `webcam-view-btn${this.viewMode === 'grid' ? ' active' : ''}`;
    gridBtn.dataset.mode = 'grid';
    gridBtn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>';
    gridBtn.title = 'Grid view';
    gridBtn.addEventListener('click', () => this.setViewMode('grid'));

    const singleBtn = document.createElement('button');
    singleBtn.className = `webcam-view-btn${this.viewMode === 'single' ? ' active' : ''}`;
    singleBtn.dataset.mode = 'single';
    singleBtn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3" y="3" width="18" height="14" rx="2"/><rect x="3" y="19" width="18" height="2" rx="1"/></svg>';
    singleBtn.title = 'Single view';
    singleBtn.addEventListener('click', () => this.setViewMode('single'));

    viewGroup.appendChild(gridBtn);
    viewGroup.appendChild(singleBtn);

    this.toolbar.appendChild(regionGroup);
    this.toolbar.appendChild(viewGroup);
    this.element.insertBefore(this.toolbar, this.content);
  }

  private setRegionFilter(filter: RegionFilter): void {
    if (filter === this.regionFilter) return;
    trackWebcamRegionFiltered(filter);
    this.regionFilter = filter;
    this.toolbar?.querySelectorAll('.webcam-region-btn').forEach((btn) => {
      (btn as HTMLElement).classList.toggle(
        'active',
        (btn as HTMLElement).dataset.region === filter,
      );
    });
    const feeds = this.filteredFeeds;
    if (feeds.length > 0 && !feeds.includes(this.activeFeed)) {
      this.activeFeed = feeds[0]!;
    }
    this.render();
  }

  private setViewMode(mode: ViewMode): void {
    if (mode === this.viewMode) return;
    this.viewMode = mode;
    this.toolbar?.querySelectorAll('.webcam-view-btn').forEach((btn) => {
      (btn as HTMLElement).classList.toggle('active', (btn as HTMLElement).dataset.mode === mode);
    });
    this.render();
  }

  private buildEmbedUrl(videoId: string): string {
    const quality = getStreamQuality();
    if (isDesktopRuntime()) {
      // Use local sidecar embed — YouTube rejects tauri:// parent origin with error 153.
      // The sidecar serves the embed from http://127.0.0.1:PORT which YouTube accepts.
      const params = new URLSearchParams({ videoId, autoplay: '1', mute: '1' });
      if (quality !== 'auto') params.set('vq', quality);
      return `${getApiBaseUrl()}/api/youtube-embed?${params.toString()}`;
    }
    const origin =
      typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null'
        ? `&origin=${encodeURIComponent(window.location.origin)}`
        : '';
    const vq = quality !== 'auto' ? `&vq=${quality}` : '';
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&rel=0&enablejsapi=1${origin}${vq}`;
  }

  private createIframe(feed: WebcamFeed): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    iframe.className = 'webcam-iframe';
    iframe.src = this.buildEmbedUrl(this.getFeedVideoId(feed));
    iframe.title = `${feed.city} live webcam`;
    iframe.allow =
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;
    return iframe;
  }

  private render(): void {
    this.destroyIframes();

    if (!this.isVisible || this.isIdle) {
      this.content.innerHTML = '<div class="webcam-placeholder">Webcams paused</div>';
      return;
    }

    if (this.viewMode === 'grid') {
      this.renderGrid();
    } else {
      this.renderSingle();
    }
  }

  private renderGrid(): void {
    this.content.innerHTML = '';
    this.content.className = 'panel-content webcam-content';

    const grid = document.createElement('div');
    grid.className = 'webcam-grid';

    const feeds = this.gridFeeds;
    const desktop = isDesktopRuntime();

    feeds.forEach((feed, i) => {
      const cell = document.createElement('div');
      cell.className = 'webcam-cell';
      cell.addEventListener('click', () => {
        trackWebcamSelected(feed.id, feed.city, 'grid');
        this.activeFeed = feed;
        this.setViewMode('single');
      });

      const label = document.createElement('div');
      label.className = 'webcam-cell-label';
      label.innerHTML = `<span class="webcam-live-dot"></span><span class="webcam-city">${escapeHtml(feed.city.toUpperCase())}</span>`;

      cell.appendChild(label);
      grid.appendChild(cell);

      if (desktop && i > 0) {
        // Stagger iframe creation on desktop — WKWebView throttles concurrent autoplay.
        setTimeout(() => {
          if (!this.isVisible || this.isIdle) return;
          const iframe = this.createIframe(feed);
          cell.insertBefore(iframe, label);
          this.iframes.push(iframe);
        }, i * 800);
      } else {
        const iframe = this.createIframe(feed);
        cell.insertBefore(iframe, label);
        this.iframes.push(iframe);
      }
    });

    this.content.appendChild(grid);
  }

  private renderSingle(): void {
    this.content.innerHTML = '';
    this.content.className = 'panel-content webcam-content';

    const wrapper = document.createElement('div');
    wrapper.className = 'webcam-single';

    const iframe = this.createIframe(this.activeFeed);
    wrapper.appendChild(iframe);
    this.iframes.push(iframe);

    const switcher = document.createElement('div');
    switcher.className = 'webcam-switcher';

    const backBtn = document.createElement('button');
    backBtn.className = 'webcam-feed-btn webcam-back-btn';
    backBtn.innerHTML =
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg> Grid';
    backBtn.addEventListener('click', () => this.setViewMode('grid'));
    switcher.appendChild(backBtn);

    this.filteredFeeds.forEach((feed) => {
      const btn = document.createElement('button');
      btn.className = `webcam-feed-btn${feed.id === this.activeFeed.id ? ' active' : ''}`;
      btn.textContent = feed.city;
      btn.addEventListener('click', () => {
        trackWebcamSelected(feed.id, feed.city, 'single');
        this.activeFeed = feed;
        this.render();
      });
      switcher.appendChild(btn);
    });

    this.content.appendChild(wrapper);
    this.content.appendChild(switcher);
  }

  private destroyIframes(): void {
    this.iframes.forEach((iframe) => {
      iframe.src = 'about:blank';
      iframe.remove();
    });
    this.iframes = [];
  }

  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        const wasVisible = this.isVisible;
        this.isVisible = entries.some((e) => e.isIntersecting);
        if (this.isVisible && !wasVisible && !this.isIdle) {
          this.render();
        } else if (!this.isVisible && wasVisible) {
          this.destroyIframes();
        }
      },
      { threshold: 0.1 },
    );
    this.observer.observe(this.element);
  }

  private setupIdleDetection(): void {
    this.boundVisibilityHandler = () => {
      if (document.hidden) {
        if (this.idleTimeout) clearTimeout(this.idleTimeout);
      } else {
        if (this.isIdle) {
          this.isIdle = false;
          if (this.isVisible) this.render();
        }
        this.boundIdleResetHandler();
      }
    };
    document.addEventListener('visibilitychange', this.boundVisibilityHandler);

    this.boundIdleResetHandler = () => {
      if (this.idleTimeout) clearTimeout(this.idleTimeout);
      if (this.isIdle) {
        this.isIdle = false;
        if (this.isVisible) this.render();
      }
      this.idleTimeout = setTimeout(() => {
        this.isIdle = true;
        this.destroyIframes();
        this.content.innerHTML =
          '<div class="webcam-placeholder">Webcams paused — move mouse to resume</div>';
      }, this.IDLE_PAUSE_MS);
    };

    ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'].forEach((event) => {
      document.addEventListener(event, this.boundIdleResetHandler, { passive: true });
    });

    this.boundIdleResetHandler();
  }

  public refresh(): void {
    if (this.isVisible && !this.isIdle) {
      this.render();
    }
  }

  public destroy(): void {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }
    document.removeEventListener('visibilitychange', this.boundVisibilityHandler);
    ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'].forEach((event) => {
      document.removeEventListener(event, this.boundIdleResetHandler);
    });
    this.observer?.disconnect();
    this.destroyIframes();
    super.destroy();
  }
}
