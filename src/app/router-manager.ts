import { trackDeeplinkOpened } from '@/services/analytics';
import { dataFreshness } from '@/services/data-freshness';
import { getCountryNameByCode } from '@/services/country-geometry';
import type { AppContext } from './app-context';
import type { CountryIntelManager } from './country-intel';
import type { EventHandlerManager } from './event-handlers';

export class AppDeepLinkRouter {
    private readonly state: AppContext;
    private readonly countryIntel: CountryIntelManager;
    private readonly eventHandlers: EventHandlerManager;

    constructor(state: AppContext, countryIntel: CountryIntelManager, eventHandlers: EventHandlerManager) {
        this.state = state;
        this.countryIntel = countryIntel;
        this.eventHandlers = eventHandlers;
    }

    public handleDeepLinks(): void {
        const url = new URL(window.location.href);
        const MAX_DEEP_LINK_RETRIES = 60;
        const DEEP_LINK_RETRY_INTERVAL_MS = 500;
        const DEEP_LINK_INITIAL_DELAY_MS = 2000;

        // Story deep link: /story?c=UA&t=ciianalysis
        if (url.pathname === '/story' || url.searchParams.has('c')) {
            const countryCode = url.searchParams.get('c');
            if (countryCode) {
                trackDeeplinkOpened('story', countryCode);
                const countryName = getCountryNameByCode(countryCode.toUpperCase()) || countryCode;

                let attempts = 0;
                const checkAndOpen = () => {
                    if (dataFreshness.hasSufficientData() && this.state.latestClusters.length > 0) {
                        this.countryIntel.openCountryStory(countryCode.toUpperCase(), countryName);
                        return;
                    }
                    attempts += 1;
                    if (attempts >= MAX_DEEP_LINK_RETRIES) {
                        this.eventHandlers.showToast('Data not available');
                    } else {
                        setTimeout(checkAndOpen, DEEP_LINK_RETRY_INTERVAL_MS);
                    }
                };
                setTimeout(checkAndOpen, DEEP_LINK_INITIAL_DELAY_MS);
                history.replaceState(null, '', '/');
                return;
            }
        }

        // Country brief deep link: ?country=UA
        const deepLinkCountry = this.state.initialUrlState?.country;
        if (deepLinkCountry) {
            trackDeeplinkOpened('country', deepLinkCountry);
            const cName = getCountryNameByCode(deepLinkCountry.toUpperCase()) || deepLinkCountry;

            let attempts = 0;
            const checkAndOpenBrief = () => {
                if (dataFreshness.hasSufficientData()) {
                    this.countryIntel.openCountryBriefByCode(deepLinkCountry, cName);
                    return;
                }
                attempts += 1;
                if (attempts >= MAX_DEEP_LINK_RETRIES) {
                    this.eventHandlers.showToast('Data not available');
                } else {
                    setTimeout(checkAndOpenBrief, DEEP_LINK_RETRY_INTERVAL_MS);
                }
            };
            setTimeout(checkAndOpenBrief, DEEP_LINK_INITIAL_DELAY_MS);
        }
    }
}
