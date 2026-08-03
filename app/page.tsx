'use client';

import { useState } from 'react';
import CalendarView from '../components/CalendarView';
import AnniversariesView from '../components/AnniversariesView';
import ConnectedView from '../components/ConnectedView';
import SettingsView from '../components/SettingsView';

type Tab = 'calendar' | 'anniversaries' | 'connected' | 'settings';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('calendar');

  const tabs = [
    { id: 'calendar' as const, label: '📅', name: 'Calendar' },
    { id: 'anniversaries' as const, label: '⭐', name: 'Anniversaries' },
    { id: 'connected' as const, label: '🔗', name: 'Connected' },
    { id: 'settings' as const, label: '⚙️', name: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="sticky top-0 z-40 border-b border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-black dark:text-white">Record Calendar</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">양력·음력 기념일 관리</p>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'anniversaries' && <AnniversariesView />}
        {activeTab === 'connected' && <ConnectedView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
        <div className="max-w-md mx-auto">
          <div className="flex justify-around">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-2 text-sm font-medium transition-colors border-t-2 ${
                  activeTab === tab.id
                    ? 'border-orange-500 dark:border-orange-400 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400'
                }`}
              >
                <div className="text-xl">{tab.label}</div>
                <div className="text-xs hidden sm:block">{tab.name}</div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="h-24" />
    </div>
  );
}
