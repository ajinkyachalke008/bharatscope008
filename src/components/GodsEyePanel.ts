export class GodsEyePanel {
  private container: HTMLElement;
  private iframe: HTMLIFrameElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  init(): void {
    this.iframe = this.container.querySelector('iframe');
  }

  show(): void {
    this.container.style.display = 'block';
    if (!this.iframe) {
      this.iframe = this.container.querySelector('iframe');
    }
    if (this.iframe && (!this.iframe.src || this.iframe.src === 'about:blank')) {
      this.iframe.src = '/gods-eye/index.html';
    }
  }

  hide(): void {
    this.container.style.display = 'none';
  }

  destroy(): void {
    if (this.iframe) {
      this.iframe.src = 'about:blank';
    }
    this.container.style.display = 'none';
  }
}

