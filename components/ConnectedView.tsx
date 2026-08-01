'use client';

import { useState } from 'react';

export default function ConnectedView() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      // Google OAuth would be implemented here
      alert('Google OAuth 로그인이 아직 구현되지 않았습니다.\n설정에서 Google Access Token을 입력하세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-32 space-y-6">
      {/* Connection status */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border-2 border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Google Calendar</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isConnected
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100'
          }`}>
            {isConnected ? '연결됨' : '미연결'}
          </div>
        </div>

        {!isConnected && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Google Calendar를 연동하면 구글 캘린더의 일정을 온캘린더에서 볼 수 있습니다.
            </p>
            <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? '연결 중...' : 'Google로 연결'}
            </button>
          </div>
        )}

        {isConnected && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              ✅ Google Calendar가 연결되었습니다.
            </p>
            <button
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              연결 해제
            </button>
          </div>
        )}
      </div>

      {/* Calendar list */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">📋 연동 중인 캘린더</h3>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 text-center text-slate-600 dark:text-slate-400">
          <p>아직 연동된 캘린더가 없습니다</p>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">✨ 기능</h3>
        <div className="space-y-2">
          {[
            '🔄 Google Calendar의 일정 읽기',
            '📱 모바일 앱에서 실시간 동기화',
            '⏱️ 15분마다 자동 갱신',
            '🔒 읽기 전용 (데이터 안전)',
          ].map((feature, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300"
            >
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300">
        <p className="font-semibold mb-2">📌 Google Calendar API v3</p>
        <p>
          Google Calendar 연동은 Google Calendar API v3를 통해 안전하게 처리됩니다.
          개인정보는 저장되지 않습니다.
        </p>
      </div>
    </div>
  );
}
