import { t } from '@/services/i18n';

interface NavItem {
  id: string;
  labelKey: string;
  defaultLabel: string;
  icon: string;
  targetSelector: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'map', labelKey: 'mobileNav.map', defaultLabel: 'Map', icon: '🗺️', targetSelector: '#mapSection' },
  { id: 'live-news', labelKey: 'mobileNav.liveNews', defaultLabel: 'Live TV', icon: '🔴', targetSelector: '[data-panel="live-news"]' },
  { id: 'live-webcams', labelKey: 'mobileNav.webcams', defaultLabel: 'Webcams', icon: '📹', targetSelector: '[data-panel="live-webcams"]' },
  { id: 'india', labelKey: 'mobileNav.india', defaultLabel: 'India', icon: '🇮🇳', targetSelector: '[data-panel="india"]' },
  { id: 'markets', labelKey: 'mobileNav.markets', defaultLabel: 'Markets', icon: '📈', targetSelector: '[data-panel="markets"]' },
];

export class MobileNavBar {
  private element: HTMLElement;
  private activeId = 'map';
  private observer: IntersectionObserver | null = null;

  constructor() {
    this.element = document.createElement('nav');
    this.element.className = 'mobile-bottom-nav';
    this.element.id = 'mobileBottomNav';
    this.element.setAttribute('aria-label', 'Mobile navigation');
    this.render();
    this.bindEvents();
    this.setupIntersectionObserver();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  private render(): void {
    this.element.innerHTML = NAV_ITEMS.map((item) => {
      const isActive = item.id === this.activeId;
      const translated = t(item.labelKey);
      const label = translated && translated !== item.labelKey ? translated : item.defaultLabel;
      return `
        <button class="mobile-nav-btn ${isActive ? 'active' : ''}" data-nav-id="${item.id}" title="${label}">
          <span class="mobile-nav-icon">${item.icon}</span>
          <span class="mobile-nav-label">${label}</span>
          ${isActive ? '<span class="mobile-nav-indicator"></span>' : ''}
        </button>
      `;
    }).join('');
  }

  private bindEvents(): void {
    this.element.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.mobile-nav-btn') as HTMLButtonElement | null;
      if (!btn) return;
      const navId = btn.dataset.navId;
      if (!navId) return;

      this.setActive(navId);

      // If God's eye mode is open, switch back to dashboard first
      const godsEyeContainer = document.getElementById('godsEyeContainer');
      const mainContent = document.querySelector('.main-content') as HTMLElement | null;
      if (godsEyeContainer && godsEyeContainer.style.display !== 'none' && mainContent) {
        godsEyeContainer.style.display = 'none';
        mainContent.style.display = '';
        const godsEyeTab = document.getElementById('godsEyeTab');
        if (godsEyeTab) godsEyeTab.classList.remove('active');
      }

      const item = NAV_ITEMS.find((n) => n.id === navId);
      if (!item) return;

      const target = document.querySelector(item.targetSelector) as HTMLElement | null;
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  public setActive(id: string): void {
    this.activeId = id;
    const buttons = this.element.querySelectorAll('.mobile-nav-btn');
    buttons.forEach((btn) => {
      const b = btn as HTMLButtonElement;
      const matches = b.dataset.navId === id;
      b.classList.toggle('active', matches);
      const existingIndicator = b.querySelector('.mobile-nav-indicator');
      if (matches && !existingIndicator) {
        const ind = document.createElement('span');
        ind.className = 'mobile-nav-indicator';
        b.appendChild(ind);
      } else if (!matches && existingIndicator) {
        existingIndicator.remove();
      }
    });
  }

  private setupIntersectionObserver(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            const target = entry.target as HTMLElement;
            if (target.id === 'mapSection') {
              this.setActive('map');
            } else {
              const panelKey = target.dataset.panel;
              if (panelKey && NAV_ITEMS.some((item) => item.id === panelKey)) {
                this.setActive(panelKey);
              }
            }
          }
        }
      },
      {
        root: null,
        rootMargin: '-50px 0px -50% 0px',
        threshold: [0.25, 0.5],
      }
    );

    // Observe elements once DOM is ready
    setTimeout(() => {
      for (const item of NAV_ITEMS) {
        const target = document.querySelector(item.targetSelector);
        if (target && this.observer) {
          this.observer.observe(target);
        }
      }
    }, 1000);
  }

  public destroy(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.element.remove();
  }
}
