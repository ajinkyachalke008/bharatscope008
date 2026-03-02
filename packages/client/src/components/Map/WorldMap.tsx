import React, { useMemo } from 'react';
import { useEventStore } from '@/store/eventStore';
import { useUIStore } from '@/store/uiStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { MapControls } from './MapControls';
import { SEVERITY_COLORS, CATEGORY_ICONS } from '@worldmonitor/shared';
import { timeAgo, capitalize } from '@/utils/formatters';
import { Badge } from '@/components/common/Badge';
import { cn } from '@/utils/cn';

// Full SVG world map with event overlays
// Uses a simple Equirectangular projection
export const WorldMap: React.FC = () => {
  const events = useEventStore((s) => s.events);
  const selectEvent = useEventStore((s) => s.selectEvent);
  const selectedEvent = useEventStore((s) => s.selectedEvent);
  const mapView = useUIStore((s) => s.mapView);
  const { heatmap } = useGeolocation();

  const toSVGCoords = (lat: number, lng: number): [number, number] => {
    const x = ((lng + 180) / 360) * 1000;
    const y = ((90 - lat) / 180) * 500;
    return [x, y];
  };

  const continentPaths = useMemo(
    () =>
      // Simplified continent outlines
      [
        // North America
        'M 140 80 L 180 70 L 220 60 L 250 80 L 270 100 L 280 130 L 270 160 L 250 170 L 220 190 L 200 200 L 180 190 L 160 180 L 150 160 L 140 130 Z',
        // South America
        'M 220 220 L 240 210 L 260 220 L 270 250 L 260 290 L 250 330 L 230 370 L 210 380 L 200 350 L 210 310 L 200 270 L 210 240 Z',
        // Europe
        'M 440 60 L 480 50 L 520 60 L 540 80 L 530 100 L 510 110 L 490 120 L 470 110 L 450 100 L 440 80 Z',
        // Africa
        'M 440 130 L 480 120 L 520 140 L 540 170 L 550 210 L 540 260 L 520 300 L 500 330 L 480 340 L 460 320 L 440 280 L 430 240 L 420 200 L 430 160 Z',
        // Asia
        'M 540 50 L 600 40 L 680 30 L 750 50 L 800 80 L 810 110 L 790 140 L 750 150 L 700 160 L 650 150 L 620 130 L 580 110 L 550 90 Z',
        // Middle East
        'M 540 110 L 580 100 L 620 110 L 610 140 L 590 160 L 560 150 L 540 130 Z',
        // South Asia
        'M 620 130 L 670 120 L 700 140 L 690 170 L 660 190 L 630 180 L 620 160 Z',
        // Southeast Asia
        'M 700 140 L 740 130 L 780 150 L 790 180 L 770 200 L 740 210 L 710 190 L 700 170 Z',
        // Oceania
        'M 760 250 L 820 230 L 870 250 L 880 290 L 860 320 L 820 330 L 780 310 L 760 280 Z',
      ],
    [],
  );

  return (
    <div className="relative w-full h-full bg-monitor-bg">
      <MapControls />

      <svg viewBox="0 0 1000 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="blur">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Grid pattern */}
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(31,41,55,0.5)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Background grid */}
        <rect width="1000" height="500" fill="url(#grid)" />

        {/* Continent outlines */}
        {continentPaths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="rgba(31,41,55,0.4)"
            stroke="rgba(55,65,81,0.6)"
            strokeWidth="1"
          />
        ))}

        {/* Latitude/Longitude lines */}
        {[0, 30, 60, -30, -60].map((lat) => {
          const y = ((90 - lat) / 180) * 500;
          return (
            <g key={`lat-${lat}`}>
              <line
                x1="0"
                y1={y}
                x2="1000"
                y2={y}
                stroke="rgba(55,65,81,0.3)"
                strokeWidth="0.5"
                strokeDasharray="4 4"
              />
              <text
                x="5"
                y={y - 3}
                fill="rgba(107,114,128,0.5)"
                fontSize="8"
                fontFamily="monospace"
              >
                {lat}°
              </text>
            </g>
          );
        })}
        {[0, 60, 120, 180, -60, -120].map((lng) => {
          const x = ((lng + 180) / 360) * 1000;
          return (
            <line
              key={`lng-${lng}`}
              x1={x}
              y1="0"
              x2={x}
              y2="500"
              stroke="rgba(55,65,81,0.3)"
              strokeWidth="0.5"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Equator */}
        <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />

        {/* Heatmap layer */}
        {mapView === 'heatmap' &&
          heatmap.map((point, i) => {
            const [x, y] = toSVGCoords(point.lat, point.lng);
            const radius = 5 + point.intensity * 15;
            return (
              <circle
                key={`heat-${i}`}
                cx={x}
                cy={y}
                r={radius}
                fill={`rgba(239, 68, 68, ${0.1 + point.intensity * 0.3})`}
                filter="url(#blur)"
              />
            );
          })}

        {/* Event markers */}
        {(mapView === 'markers' || mapView === 'clusters') &&
          events.map((event) => {
            const [x, y] = toSVGCoords(event.location.lat, event.location.lng);
            const color = SEVERITY_COLORS[event.severity];
            const isSelected = selectedEvent?.id === event.id;
            const isCritical = event.severity === 'critical';
            const radius = isCritical ? 5 : event.severity === 'high' ? 4 : 3;

            return (
              <g key={event.id} className="cursor-pointer" onClick={() => selectEvent(event)}>
                {/* Pulse animation for critical */}
                {isCritical && (
                  <circle
                    cx={x}
                    cy={y}
                    r={radius * 2}
                    fill="none"
                    stroke={color}
                    strokeWidth="0.5"
                    opacity="0.3"
                  >
                    <animate
                      attributeName="r"
                      values={`${radius};${radius * 3};${radius}`}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.5;0;0.5"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Ping animation for selected */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r={radius * 4}
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    opacity="0.5"
                  >
                    <animate
                      attributeName="r"
                      values={`${radius};${radius * 6}`}
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Core marker */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? radius * 1.5 : radius}
                  fill={`${color}CC`}
                  stroke={color}
                  strokeWidth={isSelected ? 1.5 : 0.5}
                  filter={isCritical || isSelected ? 'url(#glow)' : undefined}
                  className="transition-all duration-300"
                />

                {/* Icon for selected */}
                {isSelected && (
                  <text
                    x={x}
                    y={y}
                    fontSize={radius * 1.5}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="pointer-events-none"
                  >
                    {CATEGORY_ICONS[event.category]}
                  </text>
                )}
              </g>
            );
          })}
      </svg>

      {/* Selected Event Popup */}
      {selectedEvent && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-20 pointer-events-none">
          <div className="glass-panel p-4 pointer-events-auto shadow-2xl animate-slide-in relative overflow-hidden">
            {/* Severity border top */}
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ backgroundColor: SEVERITY_COLORS[selectedEvent.severity] }}
            />

            <button
              onClick={() => selectEvent(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              ×
            </button>

            <div className="flex gap-3 mb-2 pr-6">
              <div className="text-2xl">{CATEGORY_ICONS[selectedEvent.category]}</div>
              <div>
                <h3 className="text-sm font-semibold text-gray-100 leading-tight">
                  {selectedEvent.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <span>{selectedEvent.location.name}</span>
                  <span>•</span>
                  <span>{timeAgo(selectedEvent.timestamp)}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-300 mb-3 line-clamp-2">{selectedEvent.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Badge variant={selectedEvent.severity as any}>
                  {capitalize(selectedEvent.severity)}
                </Badge>
                <Badge variant="default">{capitalize(selectedEvent.category)}</Badge>
              </div>
              <button className="text-xs text-monitor-accent hover:underline">
                View Details →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
