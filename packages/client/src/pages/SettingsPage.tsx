import React from 'react';
import { Settings, Shield, Globe, Bell, Database } from 'lucide-react';
import { useUIStore } from '@/store';
import { cn } from '@/utils/cn';

export const SettingsPage: React.FC = () => {
  const { darkMode, sidebarOpen, toggleDarkMode, setSidebarOpen } = useUIStore();

  return (
    <div className="h-full w-full p-4 lg:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="border-b border-monitor-border pb-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-monitor-accent" />
            System Configuration
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your monitoring dashboard preferences and data streams
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General */}
          <section className="glass-panel p-5 space-y-4 shadow-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated hover:border-monitor-accent/30">
            <h2 className="text-sm font-semibold flex items-center gap-2 border-b border-monitor-border pb-2">
              <Globe className="w-4 h-4 text-gray-400" />
              General Preferences
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-200">Dark Mode</div>
                  <div className="text-xs text-gray-500">Enable high-contrast dark theme</div>
                </div>
                <Toggle checked={darkMode} onChange={toggleDarkMode} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-200">Auto-expand Sidebar</div>
                  <div className="text-xs text-gray-500">Keep navigation visible by default</div>
                </div>
                <Toggle checked={sidebarOpen} onChange={() => setSidebarOpen(!sidebarOpen)} />
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="glass-panel p-5 space-y-4 shadow-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated hover:border-monitor-accent/30">
            <h2 className="text-sm font-semibold flex items-center gap-2 border-b border-monitor-border pb-2">
              <Bell className="w-4 h-4 text-gray-400" />
              Alert Subscriptions
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-200">Critical Alerts</div>
                  <div className="text-xs text-gray-500">
                    Push notifications for mass casualty events
                  </div>
                </div>
                <Toggle checked={true} onChange={() => { }} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-200">System Warnings</div>
                  <div className="text-xs text-gray-500">Alerts for data feed interruptions</div>
                </div>
                <Toggle checked={true} onChange={() => { }} />
              </div>
            </div>
          </section>

          {/* Data Sources */}
          <section className="glass-panel p-5 space-y-4 md:col-span-2 shadow-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated hover:border-monitor-accent/30">
            <h2 className="text-sm font-semibold flex items-center gap-2 border-b border-monitor-border pb-2">
              <Database className="w-4 h-4 text-gray-400" />
              Data Intelligence Feeds
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              <FeedToggle name="GDELT Project" status="Active" color="success" />
              <FeedToggle name="USGS Earthquake" status="Active" color="success" />
              <FeedToggle name="NASA EONET" status="Active" color="success" />
              <FeedToggle name="OpenWeather" status="Disabled" color="gray" />
              <MockToggle name="Mock Generator" />
            </div>
          </section>

          {/* Security */}
          <section className="glass-panel p-5 space-y-4 md:col-span-2 border-red-500/20 shadow-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated hover:border-red-500/40">
            <h2 className="text-sm font-semibold flex items-center gap-2 border-b border-monitor-border pb-2 text-monitor-critical">
              <Shield className="w-4 h-4 text-monitor-critical" />
              Access & Security
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-200">API Credentials</div>
                <div className="text-xs text-gray-500 mb-2">
                  Manage your access tokens for external integrations
                </div>
                <input
                  type="password"
                  value="•••••••••••••••••••••••••"
                  className="w-full bg-monitor-surface2 border border-monitor-border rounded px-3 py-1.5 text-sm font-mono text-gray-400 cursor-not-allowed transition-colors hover:border-monitor-border/80"
                  disabled
                />
              </div>
              <button className="px-5 py-2 bg-monitor-surface2 border border-monitor-border rounded-lg hover:bg-monitor-border transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] text-sm mt-4 sm:mt-0 whitespace-nowrap h-fit self-end font-medium">
                Rotate Keys
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// Local component for the toggle switch UI
const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button
    className={cn(
      'w-10 h-5 rounded-full relative transition-colors duration-200 focus:outline-none',
      checked ? 'bg-monitor-accent' : 'bg-gray-600',
    )}
    onClick={onChange}
  >
    <span
      className={cn(
        'absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200',
        checked ? 'translate-x-5' : 'translate-x-0',
      )}
    />
  </button>
);

const FeedToggle: React.FC<{ name: string; status: string; color: 'success' | 'gray' }> = ({
  name,
  status,
  color,
}) => (
  <div className="border border-monitor-border rounded p-3 flex justify-between items-center bg-monitor-surface2/50">
    <span className="text-sm text-gray-300">{name}</span>
    <span
      className={cn(
        'text-xs px-2 py-0.5 rounded-full border',
        color === 'success'
          ? 'border-monitor-success/50 text-monitor-success bg-monitor-success/10'
          : 'border-gray-500/50 text-gray-400 bg-gray-500/10',
      )}
    >
      {status}
    </span>
  </div>
);

const MockToggle: React.FC<{ name: string }> = ({ name }) => (
  <div className="border border-monitor-accent/30 rounded p-3 flex justify-between items-center bg-monitor-accent/5 transition-all duration-300 hover:bg-monitor-accent/10 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:-translate-y-0.5">
    <span className="text-sm text-gray-300">{name}</span>
    <span className="text-xs px-2 py-0.5 rounded-full border border-monitor-accent/50 text-monitor-accent bg-monitor-accent/10 animate-pulse">
      Simulating
    </span>
  </div>
);
