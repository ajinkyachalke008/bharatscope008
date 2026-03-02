import React from 'react';
import type { MonitorEvent } from '@worldmonitor/shared';
import { CATEGORY_ICONS, SEVERITY_COLORS } from '@worldmonitor/shared';
import { capitalize, timeAgo } from '@/utils/formatters';
import { Badge } from '@/components/common/Badge';
import { X, MapPin, Clock, Radio, Tag, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface EventDetailModalProps {
  event: MonitorEvent;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose }) => {
  const icon = CATEGORY_ICONS[event.category] || '📌';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="rounded-xl border border-white/10 overflow-hidden shadow-2xl"
          style={{ background: 'rgba(10, 15, 30, 0.95)', backdropFilter: 'blur(24px)' }}
        >
          {/* Header stripe by severity */}
          <div
            className="h-1 w-full"
            style={{ backgroundColor: SEVERITY_COLORS[event.severity] }}
          />

          {/* Title bar */}
          <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-white/5">
            <div className="flex items-start gap-3 min-w-0">
              <span className="text-2xl flex-shrink-0">{icon}</span>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-gray-100 leading-snug">{event.title}</h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge variant={event.severity as any}>{capitalize(event.severity)}</Badge>
                  <Badge variant="default">{capitalize(event.category)}</Badge>
                  <Badge variant={event.status === 'active' ? 'default' : 'default'}>
                    {capitalize(event.status)}
                  </Badge>
                  {event.verified && (
                    <span className="flex items-center gap-1 text-xs text-monitor-success">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4">
            {/* Description */}
            {event.description && (
              <p className="text-sm text-gray-300 leading-relaxed">{event.description}</p>
            )}

            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2 text-gray-400">
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-monitor-accent" />
                <div>
                  <div className="text-gray-500 uppercase tracking-wide mb-0.5">Location</div>
                  <span className="text-gray-200">
                    {event.location.name}
                    {event.location.region && event.location.region !== event.location.name
                      ? ` · ${event.location.region}`
                      : ''}
                  </span>
                  {event.location.lat && event.location.lng && (
                    <div className="font-mono text-gray-500 mt-0.5">
                      {event.location.lat.toFixed(2)}°, {event.location.lng.toFixed(2)}°
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2 text-gray-400">
                <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-monitor-accent" />
                <div>
                  <div className="text-gray-500 uppercase tracking-wide mb-0.5">Timestamp</div>
                  <span className="text-gray-200">{timeAgo(event.timestamp)}</span>
                  <div className="font-mono text-gray-500 mt-0.5">
                    {new Date(event.timestamp).toISOString().slice(0, 19)}Z
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 text-gray-400">
                <Radio className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-monitor-accent" />
                <div>
                  <div className="text-gray-500 uppercase tracking-wide mb-0.5">Source</div>
                  <span className="text-gray-200">{event.source}</span>
                </div>
              </div>

              {event.casualties != null && event.casualties > 0 && (
                <div className="flex items-start gap-2 text-gray-400">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-monitor-high" />
                  <div>
                    <div className="text-gray-500 uppercase tracking-wide mb-0.5">Casualties</div>
                    <span className="text-gray-200">
                      {event.casualties.toLocaleString()} reported
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-3 h-3 text-gray-500 flex-shrink-0" />
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full bg-monitor-surface2 border border-monitor-border text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Source / URL */}
            {event.sourceUrl ? (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Source</div>
                <a
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-monitor-accent hover:underline truncate block font-mono"
                >
                  {event.source} ↗
                </a>
              </div>
            ) : (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Source</div>
                <span className="text-xs text-gray-400">{event.source}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-600 font-mono">
            <span>ID: {event.id}</span>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded bg-monitor-surface2 border border-monitor-border text-gray-400 hover:text-gray-200 hover:border-monitor-accent/40 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
