import { useEffect, useRef } from 'react';
import { wsClient } from '../services/websocket';
import { useEventStore } from '../store/eventStore';
import { useFeedStore } from '../store/feedStore';
import { useUIStore } from '../store/uiStore';
import { useTelemetryStore } from '../store/telemetryStore';

export function useWebSocket(): void {
  const addEvent = useEventStore((s) => s.addEvent);
  const setStats = useEventStore((s) => s.setStats);
  const addFeed = useFeedStore((s) => s.addFeed);
  const addAlert = useFeedStore((s) => s.addAlert);
  const setWsConnected = useUIStore((s) => s.setWsConnected);
  const setConnectionCount = useUIStore((s) => s.setConnectionCount);
  const updateTelemetry = useTelemetryStore((s) => s.updateTelemetry);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    wsClient.connect((connected) => {
      setWsConnected(connected);
    });

    const unsubs = [
      wsClient.on('event', (msg) => {
        addEvent(msg.payload);
      }),
      wsClient.on('feed', (msg) => {
        addFeed(msg.payload);
      }),
      wsClient.on('alert', (msg) => {
        addAlert(msg.payload);
      }),
      wsClient.on('stats', (msg) => {
        setStats(msg.payload);
      }),
      wsClient.on('telemetryUpdate', (msg) => {
        updateTelemetry(msg.payload);
      }),
      wsClient.on('connection_count', (msg) => {
        setConnectionCount(msg.payload);
      }),
    ];

    return () => {
      unsubs.forEach((u) => u());
      wsClient.disconnect();
      initialized.current = false;
    };
  }, [addEvent, setStats, addFeed, addAlert, setWsConnected, setConnectionCount, updateTelemetry]);
}
