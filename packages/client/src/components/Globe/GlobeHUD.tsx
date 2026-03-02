import React from 'react';
import { Shield, Activity, Globe, Zap, Plane, Ship, ShieldAlert, Cpu } from 'lucide-react';
import { useTelemetryStore } from '../../store/telemetryStore';
import { useEventStore } from '../../store/eventStore';
import { useUIStore } from '../../store/uiStore';
import './GlobeHUD.css';

export function GlobeHUD() {
  const events = useEventStore((s) => s.events);
  const mapView = useUIStore((s) => s.mapView);
  const { aircraftCount, vesselCount, militaryCount } = useTelemetryStore();

  const quakeCount = events.filter((e) => e.category === 'natural_disaster').length;
  const alertCount = events.filter((e) =>
    ['conflict', 'cyber', 'health', 'military'].includes(e.category),
  ).length;

  return (
    <div className="globe-hud">
      <div className="hud-corner top-left">
        <div className="hud-metric">
          <Cpu className="hud-icon pulse" size={16} />
          <div className="hud-label">TELEMETRY ENGINE</div>
          <div className="hud-value active">v3.0 LIVE</div>
        </div>
        <div className="hud-divider" />
        <div className="hud-stats">
          <div className="stat-item">
            <Plane size={14} />
            <span>{aircraftCount} AIRCRAFT</span>
          </div>
          <div className="stat-item">
            <Ship size={14} />
            <span>{vesselCount} VESSELS</span>
          </div>
          <div className="stat-item tactical">
            <ShieldAlert size={14} />
            <span>{militaryCount} TACTICAL ASSETS</span>
          </div>
        </div>
      </div>

      <div className="hud-counters">
        <div className="hud-badge pink">
          <Activity size={12} />
          <span>{quakeCount} SEISMIC</span>
        </div>
        <div className="hud-badge amber">
          <Shield size={12} />
          <span>{alertCount} THREATS</span>
        </div>
        <div className="hud-badge cyan">
          <Globe size={12} />
          <span>{mapView.toUpperCase()} VIEW</span>
        </div>
      </div>
    </div>
  );
}
