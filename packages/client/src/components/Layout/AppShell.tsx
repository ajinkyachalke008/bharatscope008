import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { PIPPlayer } from '@/components/Media/PIPPlayer';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-monitor-bg">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
      <StatusBar />
      {/* Global PIP video player overlay */}
      <PIPPlayer />
    </div>
  );
};
