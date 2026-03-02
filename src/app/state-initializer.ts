import {
    STORAGE_KEYS,
    SITE_VARIANT,
    DEFAULT_PANELS,
    DEFAULT_MAP_LAYERS,
    MOBILE_DEFAULT_MAP_LAYERS
} from '@/config';
import { loadFromStorage, isMobileDevice, parseMapUrlState } from '@/utils';
import type { MapLayers, PanelConfig, Monitor } from '@/types';
import type { MapView } from '@/components/MapContainer';
import type { AppContext } from './app-context';

export class AppStateInitializer {
    public createInitialContext(el: HTMLElement, isDesktopApp: boolean): AppContext {
        const isMobile = isMobileDevice();
        const monitors = loadFromStorage<Monitor[]>(STORAGE_KEYS.monitors, []);
        const defaultLayers = isMobile ? MOBILE_DEFAULT_MAP_LAYERS : DEFAULT_MAP_LAYERS;

        let mapLayers = loadFromStorage<MapLayers>(STORAGE_KEYS.mapLayers, defaultLayers);
        let panelSettings = loadFromStorage<Record<string, PanelConfig>>(
            STORAGE_KEYS.panels,
            DEFAULT_PANELS
        );

        // Merge in any new panels that didn't exist when settings were saved
        for (const [key, config] of Object.entries(DEFAULT_PANELS)) {
            if (!(key in panelSettings)) {
                panelSettings[key] = { ...config };
            }
        }

        // Apply variant overrides
        mapLayers = this.applyVariantLayerOverrides(mapLayers);

        const initialUrlState = parseMapUrlState(window.location.search, mapLayers);
        if (initialUrlState.layers) {
            mapLayers = this.applyVariantLayerOverrides(initialUrlState.layers);
        }

        if (import.meta.env.VITE_ENABLE_CYBER_LAYER !== 'true') {
            mapLayers.cyberThreats = false;
        }

        const disabledSources = new Set(loadFromStorage<string[]>(STORAGE_KEYS.disabledFeeds, []));

        let activeRegion = loadFromStorage<MapView>(STORAGE_KEYS.activeRegion, 'global');
        if (initialUrlState.view && initialUrlState.view !== 'global') {
            activeRegion = initialUrlState.view;
        }

        return {
            map: null,
            isMobile,
            isDesktopApp,
            container: el,
            panels: {},
            newsPanels: {},
            panelSettings,
            mapLayers,
            allNews: [],
            newsByCategory: {},
            latestMarkets: [],
            latestPredictions: [],
            latestClusters: [],
            intelligenceCache: {},
            cyberThreatsCache: null,
            disabledSources,
            currentTimeRange: '7d',
            inFlight: new Set(),
            seenGeoAlerts: new Set(),
            monitors,
            signalModal: null,
            statusPanel: null,
            searchModal: null,
            findingsBadge: null,
            playbackControl: null,
            exportPanel: null,
            unifiedSettings: null,
            mobileWarningModal: null,
            pizzintIndicator: null,
            countryBriefPage: null,
            countryTimeline: null,
            positivePanel: null,
            countersPanel: null,
            progressPanel: null,
            breakthroughsPanel: null,
            heroPanel: null,
            digestPanel: null,
            speciesPanel: null,
            renewablePanel: null,
            tvMode: null,
            happyAllItems: [],
            isDestroyed: false,
            isPlaybackMode: false,
            isIdle: false,
            initialLoadComplete: false,
            initialUrlState,
            PANEL_ORDER_KEY: 'panel-order',
            PANEL_SPANS_KEY: 'worldmonitor-panel-spans',
            activeRegion,
        };
    }

    private applyVariantLayerOverrides(layers: MapLayers): MapLayers {
        const newLayers = { ...layers };
        const currentVariant = SITE_VARIANT;

        if (currentVariant === 'happy') {
            const unhappyLayers: (keyof MapLayers)[] = [
                'conflicts', 'bases', 'hotspots', 'nuclear', 'irradiators', 'sanctions',
                'military', 'protests', 'pipelines', 'waterways', 'ais', 'flights',
                'spaceports', 'minerals', 'natural', 'fires', 'outages', 'cyberThreats',
                'weather', 'economic', 'cables', 'datacenters', 'ucdpEvents',
                'displacement', 'climate'
            ];
            unhappyLayers.forEach(layer => { newLayers[layer] = false; });
        }

        if (currentVariant === 'tech') {
            const geoLayers: (keyof MapLayers)[] = [
                'conflicts', 'bases', 'hotspots', 'nuclear', 'irradiators', 'sanctions',
                'military', 'protests', 'pipelines', 'waterways', 'ais', 'flights',
                'spaceports', 'minerals'
            ];
            geoLayers.forEach(layer => { newLayers[layer] = false; });
        }

        return newLayers;
    }
}
