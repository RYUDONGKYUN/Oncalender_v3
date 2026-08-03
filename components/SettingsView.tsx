'use client';

import { useState } from 'react';

export default function SettingsView() {
  const [userId, setUserId] = useState(() => localStorage.getItem('userId') || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('userId', userId);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-4 pb-32 space-y-6">
      {/* Account section */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">👤 계정</h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              사용자 ID (데모용)
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="demo-user"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              API 요청에 사용할 사용자 ID입니다.
            </p>
          </div>
          <button
            onClick={handleSave}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              saved
                ? 'bg-orange-600 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            {saved ? '✓ 저장됨' : '저장'}
          </button>
        </div>
      </div>

      {/* Calendar settings */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">🗓️ 캘린더</h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer">
            <span className="text-slate-700 dark:text-slate-300">기본 캘린더</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">→</span>
          </div>
          <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer">
            <span className="text-slate-700 dark:text-slate-300">캘린더 관리</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">→</span>
          </div>
        </div>
      </div>

      {/* Notification settings */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">🔔 알림</h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">기념일 전날 알림</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">기념일 1일 전에 알림</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 cursor-pointer"
            />
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">당일 알림</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">기념일 당일 아침 09:00</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 cursor-pointer"
            />
          </div>
        </div>
      </div>


      {/* About */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">ℹ️ 정보</h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">앱 버전</span>
            <span className="text-slate-900 dark:text-white font-medium">v3.0.0</span>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">데이터베이스</span>
            <span className="text-slate-900 dark:text-white font-medium">PostgreSQL</span>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">프레임워크</span>
            <span className="text-slate-900 dark:text-white font-medium">Next.js 16</span>
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
        <p className="font-semibold text-blue-900 dark:text-blue-100">💬 피드백</p>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          문제가 있거나 기능을 건의하고 싶으신가요?
        </p>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          GitHub에서 보고하기
        </a>
      </div>
    </div>
  );
}
