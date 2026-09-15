import { GODS_EYE_TEMPLATES_MARKUP } from '@/gods-eye/ui/templatesMarkup';
import '@/gods-eye/style.css';

export class GodsEyePanel {
  private container: HTMLElement;
  private isInitialized = false;
  private isLoading = false;
  private app: any = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async init(): Promise<void> {
    if (this.isInitialized || this.isLoading) return;
    this.isLoading = true;

    // Inject God's Eye component markup
    this.container.innerHTML = GODS_EYE_TEMPLATES_MARKUP;

    try {
      // @ts-expect-error - JavaScript module without types
      const { createStandaloneApplication } = await import('@/gods-eye/standalone/application.js');

      this.app = createStandaloneApplication({
        googleApiKey: (import.meta as any).env.GOOGLE_MAPS_API_KEY,
        cesiumToken: (import.meta as any).env.CESIUM_ION_TOKEN,
        allowQaRegistration: (import.meta as any).env.DEV,
      });

      await this.app.start();
      this.isInitialized = true;
    } catch (error) {
      console.error("God's Eye View initialization failed:", error);
      const loaderStatus = this.container.querySelector('#loading-screen .loader-status') as HTMLElement | null;
      if (loaderStatus) {
        loaderStatus.textContent = `Error: ${error instanceof Error ? error.message : String(error)}`;
        loaderStatus.style.color = '#ff4444';
      }
    } finally {
      this.isLoading = false;
    }
  }

  show(): void {
    this.container.style.display = 'block';
    if (!this.isInitialized && !this.isLoading) {
      this.init();
      return;
    }

    // Trigger Cesium viewer resize and repaint once visible
    const gev = (window as any).__godsEyeView;
    if (gev?.viewer && !gev.viewer.isDestroyed()) {
      gev.viewer.resize();
      if (gev.requestRender) {
        gev.requestRender();
      }
    }
  }

  hide(): void {
    this.container.style.display = 'none';
  }

  destroy(): void {
    if (this.app?.destroy) {
      this.app.destroy().catch(console.error);
    }
    this.isInitialized = false;
    this.isLoading = false;
    this.app = null;
    this.container.innerHTML = '';
  }
}
