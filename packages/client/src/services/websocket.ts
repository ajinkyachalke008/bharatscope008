type MessageHandler = (msg: any) => void;

export class WSClient {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 20;
  private baseDelay = 1000;
  private url: string;
  private _onStatusChange?: (connected: boolean) => void;

  constructor(url: string) {
    this.url = url;
  }

  connect(onStatusChange?: (connected: boolean) => void): void {
    this._onStatusChange = onStatusChange;
    this._connect();
  }

  private _connect(): void {
    try {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this._onStatusChange?.(true);
      };
      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handlers.get(msg.type)?.forEach((h) => h(msg));
          this.handlers.get('*')?.forEach((h) => h(msg));
        } catch {
          /* ignore */
        }
      };
      this.ws.onclose = () => {
        this._onStatusChange?.(false);
        this.scheduleReconnect();
      };
      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    const delay = Math.min(this.baseDelay * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this._connect();
    }, delay);
  }

  on(type: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  send(msg: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg));
  }

  disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }
}

const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
export const wsClient = new WSClient(
  import.meta.env.VITE_WS_URL ? `${import.meta.env.VITE_WS_URL}/ws` : wsUrl,
);
