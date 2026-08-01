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
    { id: 'calendar' as Tab, label: '📅 캘린더', icon: '📅' },
    { id: 'anniversaries' as Tab, label: '⭐ 기념일', icon: '⭐' },
    { id: 'connected' as Tab, label: '🔗 연동', icon: '🔗' },
    { id: 'settings' as Tab, label: '⚙️ 설정', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">OnCalendar</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">양력·음력 기념일 관리</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto">
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'anniversaries' && <AnniversariesView />}
        {activeTab === 'connected' && <ConnectedView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <div className="max-w-md mx-auto">
          <div className="flex justify-around">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-2 text-sm font-medium transition-colors border-t-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                <div className="text-xl mb-1">{tab.icon}</div>
                <div className="text-xs hidden sm:block">{tab.label.split(' ')[1]}</div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content padding for bottom nav */}
      <div className="h-24" />
    </div>
  );
}
