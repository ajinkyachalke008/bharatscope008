import { STORAGE_KEYS, SITE_VARIANT } from '@/config';
import { saveToStorage } from '@/utils';

export class AppMigrationManager {
    private readonly PANEL_ORDER_KEY = 'panel-order';
    private readonly PANEL_SPANS_KEY = 'worldmonitor-panel-spans';

    public runMigrations(isDesktopApp: boolean): void {
        this.handleVariantChange();
        this.migratePanelOrderV19();
        this.migrateTechInsights();
        this.runLayoutResetV25();
        this.ensureDesktopConfigPanel(isDesktopApp);
    }

    private handleVariantChange(): void {
        const storedVariant = localStorage.getItem('worldmonitor-variant');
        const currentVariant = SITE_VARIANT;

        if (storedVariant !== currentVariant) {
            console.log(`[Migration] Variant changed: stored="${storedVariant}", current="${currentVariant}" - resetting to defaults`);
            localStorage.setItem('worldmonitor-variant', currentVariant);
            localStorage.removeItem(STORAGE_KEYS.mapLayers);
            localStorage.removeItem(STORAGE_KEYS.panels);
            localStorage.removeItem(this.PANEL_ORDER_KEY);
            localStorage.removeItem(this.PANEL_SPANS_KEY);
        }
    }

    private migratePanelOrderV19(): void {
        const MIGRATION_KEY = 'worldmonitor-panel-order-v1.9';
        if (localStorage.getItem(MIGRATION_KEY)) return;

        const savedOrder = localStorage.getItem(this.PANEL_ORDER_KEY);
        if (savedOrder) {
            try {
                const order: string[] = JSON.parse(savedOrder);
                const priorityPanels = ['insights', 'strategic-posture', 'cii', 'strategic-risk'];
                const filtered = order.filter(k => !priorityPanels.includes(k) && k !== 'live-news');

                const newOrder = order.indexOf('live-news') !== -1 ? ['live-news'] : [];
                newOrder.push(...priorityPanels.filter(p => order.includes(p)));
                newOrder.push(...filtered);

                localStorage.setItem(this.PANEL_ORDER_KEY, JSON.stringify(newOrder));
                console.log('[Migration] Migrated panel order to v1.8 layout');
            } catch (e) {
                console.warn('[Migration] Failed to migrate panel order v1.9:', e);
            }
        }
        localStorage.setItem(MIGRATION_KEY, 'done');
    }

    private migrateTechInsights(): void {
        if (SITE_VARIANT !== 'tech') return;

        const MIGRATION_KEY = 'worldmonitor-tech-insights-top-v1';
        if (localStorage.getItem(MIGRATION_KEY)) return;

        const savedOrder = localStorage.getItem(this.PANEL_ORDER_KEY);
        if (savedOrder) {
            try {
                const order: string[] = JSON.parse(savedOrder);
                const filtered = order.filter(k => k !== 'insights' && k !== 'live-news');
                const newOrder: string[] = [];
                if (order.includes('live-news')) newOrder.push('live-news');
                if (order.includes('insights')) newOrder.push('insights');
                newOrder.push(...filtered);
                localStorage.setItem(this.PANEL_ORDER_KEY, JSON.stringify(newOrder));
                console.log('[Migration] Tech variant: Migrated insights panel to top');
            } catch (e) {
                console.warn('[Migration] Failed to migrate tech insights:', e);
            }
        }
        localStorage.setItem(MIGRATION_KEY, 'done');
    }

    private runLayoutResetV25(): void {
        const MIGRATION_KEY = 'worldmonitor-layout-reset-v2.5';
        if (localStorage.getItem(MIGRATION_KEY)) return;

        const hadSavedOrder = !!localStorage.getItem(this.PANEL_ORDER_KEY);
        const hadSavedSpans = !!localStorage.getItem(this.PANEL_SPANS_KEY);

        if (hadSavedOrder || hadSavedSpans) {
            localStorage.removeItem(this.PANEL_ORDER_KEY);
            localStorage.removeItem(this.PANEL_SPANS_KEY);
            console.log('[Migration] Applied layout reset migration (v2.5)');
        }
        localStorage.setItem(MIGRATION_KEY, 'done');
    }

    private ensureDesktopConfigPanel(isDesktopApp: boolean): void {
        if (!isDesktopApp) return;

        const panelSettings = (JSON.parse(localStorage.getItem(STORAGE_KEYS.panels) || '{}')) as any;
        const runtimePanel = panelSettings['runtime-config'] ?? {
            name: 'Desktop Configuration',
            enabled: true,
            priority: 2,
        };
        runtimePanel.enabled = true;
        panelSettings['runtime-config'] = runtimePanel;
        saveToStorage(STORAGE_KEYS.panels, panelSettings);
    }
}
