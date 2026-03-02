import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebSocketOptions {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

interface WebSocketState {
  isConnected: boolean;
  reconnectAttempts: number;
  lastMessageTime: string | null;
  messageCount: number;
}

export function useWebSocket({
  url,
  reconnectInterval = 3000,
  maxReconnectAttempts = 50,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const reconnectAttemptsRef = useRef(0);

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    reconnectAttempts: 0,
    lastMessageTime: null,
    messageCount: 0,
  });

  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`[WS] Connected to ${url}`);
        reconnectAttemptsRef.current = 0;
        setState((prev) => ({ ...prev, isConnected: true, reconnectAttempts: 0 }));
        onConnect?.();
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          setState((prev) => ({
            ...prev,
            lastMessageTime: new Date().toISOString(),
            messageCount: prev.messageCount + 1,
          }));
          onMessage?.(data);
        } catch (e) {
          console.warn('[WS] Failed to parse message:', e);
        }
      };

      ws.onclose = (event) => {
        console.log(`[WS] Disconnected (code: ${event.code})`);
        setState((prev) => ({ ...prev, isConnected: false }));
        onDisconnect?.();

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          setState((prev) => ({ ...prev, reconnectAttempts: reconnectAttemptsRef.current }));

          const delay = Math.min(
            reconnectInterval * Math.pow(1.5, reconnectAttemptsRef.current - 1),
            30000,
          );
          console.log(
            `[WS] Reconnecting in ${(delay / 1000).toFixed(1)}s (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`,
          );
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        } else {
          console.error('[WS] Max reconnect attempts reached');
        }
      };

      ws.onerror = (error) => {
        console.error('[WS] Error:', error);
        onError?.(error);
      };
    } catch (e) {
      console.error('[WS] Failed to create WebSocket:', e);
    }
  }, [url, reconnectInterval, maxReconnectAttempts, onMessage, onConnect, onDisconnect, onError]);

  const sendMessage = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return { ...state, sendMessage, reconnect: connect };
}
