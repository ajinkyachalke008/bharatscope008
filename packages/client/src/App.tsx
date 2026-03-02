import React from 'react';
import { useUIStore } from '@/store';
import { useWebSocket } from '@/hooks/useWebSocket';
import { AppShell } from '@/components/Layout/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { MapPage } from '@/pages/MapPage';
import { FeedsPage } from '@/pages/FeedsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AlertBanner } from '@/components/Signals/AlertBanner';
import { BharatMonitorV3 } from '@/components/Dashboard/BharatMonitorV3';
import { cn } from '@/utils/cn';

export const App: React.FC = () => {
  const activePage = useUIStore((s) => s.activePage);
  const darkMode = useUIStore((s) => s.darkMode);

  // Initialize WebSocket connection
  useWebSocket();

  // Apply dark mode class to root
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={cn('h-screen w-screen overflow-hidden', darkMode ? 'dark' : '')}>
      <AppShell>
        <div className="flex flex-col h-full w-full">
          <AlertBanner />
          <div className="flex-1 overflow-hidden relative">
            {activePage === 'dashboard' && <DashboardPage />}
            {activePage === 'map' && <MapPage />}
            {activePage === 'feeds' && <FeedsPage />}
            {activePage === 'settings' && <SettingsPage />}
            {activePage === 'bharat' && <BharatMonitorV3 onClose={() => useUIStore.getState().setActivePage('dashboard')} />}
          </div>
        </div>
      </AppShell>
    </div>
  );
};

export default App;
