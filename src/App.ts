import {
  AppMigrationManager,
  AppStateInitializer,
  AppDeepLinkRouter,
  DesktopUpdater,
  CountryIntelManager,
  SearchManager,
  RefreshScheduler,
  PanelLayoutManager,
  DataLoaderManager,
  EventHandlerManager,
  type AppContext,
} from '@/app/index';
import {
  initDB,
  cleanOldSnapshots,
  isAisConfigured,
  initAisStream,
  isOutagesConfigured,
  disconnectAisStream,
} from '@/services';
import { mlWorker } from '@/services/ml-worker';
import { getAiFlowSettings, subscribeAiFlowChange } from '@/services/ai-flow-settings';
import { startLearning } from '@/services/country-instability';
import { SignalModal, IntelligenceGapBadge, LiveNewsPanel } from '@/components';
import { isDesktopRuntime } from '@/services/runtime';
import { trackEvent } from '@/services/analytics';
import { preloadCountryGeometry } from '@/services/country-geometry';
import { initI18n } from '@/services/i18n';
import { SITE_VARIANT, REFRESH_INTERVALS } from '@/config';
import type { MapLayers } from '@/types';
import type { TheaterPostureSummary } from '@/services/military-surge';

const CYBER_LAYER_ENABLED = import.meta.env.VITE_ENABLE_CYBER_LAYER === 'true';

export type { CountryBriefSignals } from '@/app/app-context';

export class App {
  private state: AppContext;
  private panelLayout: PanelLayoutManager;
  private dataLoader: DataLoaderManager;
  private eventHandlers: EventHandlerManager;
  private searchManager: SearchManager;
  private countryIntel: CountryIntelManager;
  private refreshScheduler: RefreshScheduler;
  private desktopUpdater: DesktopUpdater;
  private router: AppDeepLinkRouter;

  private modules: { destroy(): void }[] = [];
  private unsubAiFlow: (() => void) | null = null;

  constructor(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Container ${containerId} not found`);

    const isDesktopApp = isDesktopRuntime();

    // 1. Run migrations
    const migrationManager = new AppMigrationManager();
    migrationManager.runMigrations(isDesktopApp);

    // 2. Initialize state
    const stateInitializer = new AppStateInitializer();
    this.state = stateInitializer.createInitialContext(el, isDesktopApp);

    // 3. Instantiate modules
    this.refreshScheduler = new RefreshScheduler(this.state);
    this.countryIntel = new CountryIntelManager(this.state);
    this.desktopUpdater = new DesktopUpdater(this.state);

    this.dataLoader = new DataLoaderManager(this.state, {
      renderCriticalBanner: (postures: TheaterPostureSummary[]) =>
        this.panelLayout.renderCriticalBanner(postures),
    });

    this.searchManager = new SearchManager(this.state, {
      openCountryBriefByCode: (code: string, country: string) =>
        this.countryIntel.openCountryBriefByCode(code, country),
    });

    this.panelLayout = new PanelLayoutManager(this.state, {
      openCountryStory: (code: string, name: string) => this.countryIntel.openCountryStory(code, name),
      loadAllData: () => this.dataLoader.loadAllData(),
      updateMonitorResults: () => this.dataLoader.updateMonitorResults(),
    });

    this.eventHandlers = new EventHandlerManager(this.state, {
      updateSearchIndex: () => this.searchManager.updateSearchIndex(),
      loadAllData: () => this.dataLoader.loadAllData(),
      flushStaleRefreshes: () => this.refreshScheduler.flushStaleRefreshes(),
      setHiddenSince: (ts: number | null) => {
        if (ts !== null) this.refreshScheduler.setHiddenSince(ts);
      },
      loadDataForLayer: (layer: string) => {
        void this.dataLoader.loadDataForLayer(layer as keyof MapLayers);
      },
      waitForAisData: () => this.dataLoader.waitForAisData(),
      syncDataFreshnessWithLayers: () => this.dataLoader.syncDataFreshnessWithLayers(),
      onRegionChange: (region) => this.handleRegionChange(region),
    });

    this.router = new AppDeepLinkRouter(this.state, this.countryIntel, this.eventHandlers);

    // 4. Wire cross-module callback: DataLoader → SearchManager
    this.dataLoader.updateSearchIndex = () => this.searchManager.updateSearchIndex();

    // 5. Track destroy order (reverse of init)
    this.modules = [
      this.desktopUpdater,
      this.panelLayout,
      this.countryIntel,
      this.searchManager,
      this.dataLoader,
      this.refreshScheduler,
      this.eventHandlers,
    ];
  }

  public async init(): Promise<void> {
    const initStart = performance.now();
    await initDB();
    await initI18n();
    const aiFlow = getAiFlowSettings();
    if (aiFlow.browserModel || isDesktopRuntime()) {
      await mlWorker.init();
    }

    this.unsubAiFlow = subscribeAiFlowChange((key) => {
      if (key === 'browserModel') {
        const s = getAiFlowSettings();
        if (s.browserModel) {
          mlWorker.init();
        } else {
          mlWorker.terminate();
        }
      }
    });

    // Check AIS configuration before init
    if (!isAisConfigured()) {
      this.state.mapLayers.ais = false;
    } else if (this.state.mapLayers.ais) {
      initAisStream();
    }

    // Phase 1: Layout (creates map + panels)
    this.panelLayout.init();

    // Happy variant: pre-populate panels from persistent cache for instant render
    if (SITE_VARIANT === 'happy') {
      await this.dataLoader.hydrateHappyPanelsFromCache();
    }

    // Phase 2: Shared UI components
    this.state.signalModal = new SignalModal();
    this.state.signalModal.setLocationClickHandler((lat, lon) => {
      this.state.map?.setCenter(lat, lon, 4);
    });
    if (!this.state.isMobile) {
      this.state.findingsBadge = new IntelligenceGapBadge();
      this.state.findingsBadge.setOnSignalClick((signal) => {
        if (this.state.countryBriefPage?.isVisible()) return;
        if (localStorage.getItem('wm-settings-open') === '1') return;
        this.state.signalModal?.showSignal(signal);
      });
      this.state.findingsBadge.setOnAlertClick((alert) => {
        if (this.state.countryBriefPage?.isVisible()) return;
        if (localStorage.getItem('wm-settings-open') === '1') return;
        this.state.signalModal?.showAlert(alert);
      });
    }

    // Phase 3: UI setup methods
    this.eventHandlers.startHeaderClock();
    this.eventHandlers.setupMobileWarning();
    this.eventHandlers.setupPlaybackControl();
    this.eventHandlers.setupStatusPanel();
    this.eventHandlers.setupPizzIntIndicator();
    this.eventHandlers.setupExportPanel();
    this.eventHandlers.setupUnifiedSettings();

    // Phase 4: SearchManager, MapLayerHandlers, CountryIntel
    this.searchManager.init();
    this.eventHandlers.setupMapLayerHandlers();
    this.countryIntel.init();

    // Phase 5: Event listeners + URL sync
    this.eventHandlers.init();
    this.eventHandlers.setupUrlStateSync();

    // Phase 6: Data loading
    this.dataLoader.syncDataFreshnessWithLayers();
    await preloadCountryGeometry();
    await this.dataLoader.loadAllData();

    startLearning();

    // Hide unconfigured layers after first data load
    if (!isAisConfigured()) {
      this.state.map?.hideLayerToggle('ais');
    }
    if (isOutagesConfigured() === false) {
      this.state.map?.hideLayerToggle('outages');
    }
    if (!CYBER_LAYER_ENABLED) {
      this.state.map?.hideLayerToggle('cyberThreats');
    }

    // Phase 7: Refresh scheduling
    this.setupRefreshIntervals();
    this.eventHandlers.setupSnapshotSaving();
    cleanOldSnapshots().catch((e) => console.warn('[Storage] Snapshot cleanup failed:', e));

    // Phase 8: Deep links + update checks
    this.router.handleDeepLinks();
    this.desktopUpdater.init();

    // Analytics
    trackEvent('wm_app_loaded', {
      load_time_ms: Math.round(performance.now() - initStart),
      panel_count: Object.keys(this.state.panels).length,
    });
    this.eventHandlers.setupPanelViewTracking();
  }

  public destroy(): void {
    this.state.isDestroyed = true;

    // Destroy all modules in reverse order
    for (let i = this.modules.length - 1; i >= 0; i--) {
      this.modules[i]!.destroy();
    }

    // Clean up subscriptions, map, and AIS
    this.unsubAiFlow?.();
    this.state.map?.destroy();
    disconnectAisStream();
  }

  private handleRegionChange(region: string): void {
    console.log(`[App] Region changed to: ${region}`);
    if (region === 'india') {
      this.activateIndiaFocusMode();
    } else {
      this.deactivateIndiaFocusMode();
    }
  }

  private activateIndiaFocusMode(): void {
    console.log('[App] Activating India Focus Mode (Bharat Monitor)');
    document.body.classList.add('india-focus-mode');
    this.panelLayout.setBharatMonitorBranding(true);
    // Phase 2: Map transformation
    this.state.map?.fitToRegion('india');
    // Phase 5: Live news pivot
    const liveNews = this.state.panels['live-news'] as LiveNewsPanel;
    if (liveNews) {
      void liveNews.pivotToIndiaNews();
    }
  }

  private deactivateIndiaFocusMode(): void {
    console.log('[App] Deactivating India Focus Mode');
    document.body.classList.remove('india-focus-mode');
    this.panelLayout.setBharatMonitorBranding(false);

    const liveNews = this.state.panels['live-news'] as LiveNewsPanel;
    if (liveNews) {
      void liveNews.revertFromIndiaNews();
    }
  }

  private setupRefreshIntervals(): void {
    // Always refresh news for all variants
    this.refreshScheduler.scheduleRefresh(
      'news',
      () => this.dataLoader.loadNews(),
      REFRESH_INTERVALS.feeds,
    );

    // Happy variant only refreshes news -- skip all geopolitical/financial/military refreshes
    if (SITE_VARIANT !== 'happy') {
      this.refreshScheduler.registerAll([
        {
          name: 'markets',
          fn: () => this.dataLoader.loadMarkets(),
          intervalMs: REFRESH_INTERVALS.markets,
        },
        {
          name: 'predictions',
          fn: () => this.dataLoader.loadPredictions(),
          intervalMs: REFRESH_INTERVALS.predictions,
        },
        { name: 'pizzint', fn: () => this.dataLoader.loadPizzInt(), intervalMs: 10 * 60 * 1000 },
        {
          name: 'natural',
          fn: () => this.dataLoader.loadNatural(),
          intervalMs: 5 * 60 * 1000,
          condition: () => this.state.mapLayers.natural,
        },
        {
          name: 'weather',
          fn: () => this.dataLoader.loadWeatherAlerts(),
          intervalMs: 10 * 60 * 1000,
          condition: () => this.state.mapLayers.weather,
        },
        { name: 'fred', fn: () => this.dataLoader.loadFredData(), intervalMs: 30 * 60 * 1000 },
        { name: 'oil', fn: () => this.dataLoader.loadOilAnalytics(), intervalMs: 30 * 60 * 1000 },
        {
          name: 'spending',
          fn: () => this.dataLoader.loadGovernmentSpending(),
          intervalMs: 60 * 60 * 1000,
        },
        { name: 'bis', fn: () => this.dataLoader.loadBisData(), intervalMs: 60 * 60 * 1000 },
        { name: 'firms', fn: () => this.dataLoader.loadFirmsData(), intervalMs: 30 * 60 * 1000 },
        {
          name: 'ais',
          fn: () => this.dataLoader.loadAisSignals(),
          intervalMs: REFRESH_INTERVALS.ais,
          condition: () => this.state.mapLayers.ais,
        },
        {
          name: 'cables',
          fn: () => this.dataLoader.loadCableActivity(),
          intervalMs: 30 * 60 * 1000,
          condition: () => this.state.mapLayers.cables,
        },
        {
          name: 'cableHealth',
          fn: () => this.dataLoader.loadCableHealth(),
          intervalMs: 5 * 60 * 1000,
          condition: () => this.state.mapLayers.cables,
        },
        {
          name: 'flights',
          fn: () => this.dataLoader.loadFlightDelays(),
          intervalMs: 10 * 60 * 1000,
          condition: () => this.state.mapLayers.flights,
        },
        {
          name: 'cyberThreats',
          fn: () => {
            this.state.cyberThreatsCache = null;
            return this.dataLoader.loadCyberThreats();
          },
          intervalMs: 10 * 60 * 1000,
          condition: () => CYBER_LAYER_ENABLED && this.state.mapLayers.cyberThreats,
        },
      ]);
    }

    if (SITE_VARIANT === 'full' || SITE_VARIANT === 'finance') {
      this.refreshScheduler.scheduleRefresh(
        'tradePolicy',
        () => this.dataLoader.loadTradePolicy(),
        10 * 60 * 1000,
      );
      this.refreshScheduler.scheduleRefresh(
        'supplyChain',
        () => this.dataLoader.loadSupplyChain(),
        10 * 60 * 1000,
      );
    }

    if (SITE_VARIANT === 'full') {
      this.refreshScheduler.scheduleRefresh(
        'intelligence',
        () => {
          const { military } = this.state.intelligenceCache;
          this.state.intelligenceCache = {};
          if (military) this.state.intelligenceCache.military = military;
          return this.dataLoader.loadIntelligenceSignals();
        },
        15 * 60 * 1000,
      );
    }
  }
}
