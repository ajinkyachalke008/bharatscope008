import React from 'react';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/utils/cn';
import { Layers, Circle, Flame } from 'lucide-react';

export const MapControls: React.FC = () => {
  const { mapView, setMapView } = useUIStore();

  const views = [
    { id: 'markers' as const, label: 'Markers', icon: Circle },
    { id: 'heatmap' as const, label: 'Heatmap', icon: Flame },
    { id: 'clusters' as const, label: 'Clusters', icon: Layers },
  ];

  return (
    <div className="absolute top-4 right-4 z-10 glass-panel p-1 flex gap-1">
      {views.map((view) => {
        const Icon = view.icon;
        return (
          <button
            key={view.id}
            onClick={() => setMapView(view.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-all',
              mapView === view.id
                ? 'bg-monitor-accent/20 text-monitor-accent'
                : 'text-gray-400 hover:text-gray-200',
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {view.label}
          </button>
        );
      })}
    </div>
  );
};
