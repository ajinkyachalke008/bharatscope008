import { create } from 'zustand';

type ActivePage = 'dashboard' | 'map' | 'feeds' | 'settings' | 'bharat';
type MapView = 'markers' | 'heatmap' | 'clusters';

interface UIState {
  activePage: ActivePage;
  sidebarOpen: boolean;
  mapView: MapView;
  darkMode: boolean;
  wsConnected: boolean;
  connectionCount: number;
  setActivePage: (page: ActivePage) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setMapView: (view: MapView) => void;
  setWsConnected: (connected: boolean) => void;
  setConnectionCount: (count: number) => void;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activePage: 'dashboard',
  sidebarOpen: true,
  mapView: 'markers',
  darkMode: true,
  wsConnected: false,
  connectionCount: 0,
  setActivePage: (activePage) => set({ activePage }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setMapView: (mapView) => set({ mapView }),
  setWsConnected: (wsConnected) => set({ wsConnected }),
  setConnectionCount: (connectionCount) => set({ connectionCount }),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
}));
