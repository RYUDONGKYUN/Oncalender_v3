'use client';

import { useState, useEffect } from 'react';

interface Anniversary {
  id: string;
  title: string;
  category: string;
  originYear: number;
  originMonth: number;
  originDay: number;
  calendarType: string;
}

interface SummaryAnniversary {
  id: string;
  title: string;
  category: string;
  date: string;
  year: number;
  dday: number;
  age: number;
  originYear: number;
}

export default function AnniversariesView() {
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [summary, setSummary] = useState<SummaryAnniversary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId') || 'demo-user';

      // Fetch all anniversaries
      const annResponse = await fetch('/api/anniversaries', {
        headers: { 'x-user-id': userId },
      });
      if (annResponse.ok) {
        setAnniversaries(await annResponse.json());
      }

      // Fetch summary
      const sumResponse = await fetch('/api/anniversaries/summary?days=30', {
        headers: { 'x-user-id': userId },
      });
      if (sumResponse.ok) {
        const data = await sumResponse.json();
        setSummary(data.upcoming);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      '생일': '🎂',
      '결혼기념일': '💍',
      '기일': '🕯️',
      '기타': '⭐',
    };
    return labels[category] || '⭐';
  };

  return (
    <div className="p-4 pb-32 space-y-6">
      {/* Summary section */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">📅 다가오는 30일</h2>
        {summary.length > 0 ? (
          <div className="space-y-2">
            {summary.map((ann) => {
              const targetDate = new Date(ann.date);
              const isToday = new Date().toDateString() === targetDate.toDateString();
              const isSoon = ann.dday >= 0 && ann.dday <= 3;

              return (
                <div
                  key={`${ann.id}-${ann.year}`}
                  className={`p-4 rounded-lg border-l-4 ${
                    ann.category === '기일'
                      ? 'border-gray-400 bg-gray-50 dark:bg-gray-900'
                      : 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getCategoryLabel(ann.category)}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {ann.title}
                        </span>
                        {isToday && (
                          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                            오늘
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {ann.year}년 {targetDate.getMonth() + 1}월 {targetDate.getDate()}일 ({
                        ['일', '월', '화', '수', '목', '금', '토'][targetDate.getDay()]
                        }요일)
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {ann.age}세 / {ann.year - ann.originYear}주년
                      </div>
                    </div>
                    <div
                      className={`text-right ${
                        isSoon ? 'font-bold' : ''
                      }`}
                    >
                      {ann.dday === 0 ? (
                        <span className="text-xl font-bold text-red-500">D-DAY</span>
                      ) : ann.dday > 0 ? (
                        <span
                          className={`text-2xl font-bold ${
                            isSoon ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          D-{ann.dday}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          D+{Math.abs(ann.dday)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            다가오는 기념일이 없습니다
          </div>
        )}
      </div>

      {/* All anniversaries section */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">📋 모든 기념일</h2>
        {anniversaries.length > 0 ? (
          <div className="space-y-2">
            {anniversaries.map((ann) => (
              <div
                key={ann.id}
                className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getCategoryLabel(ann.category)}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {ann.title}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {ann.originYear}년 {ann.originMonth}월 {ann.originDay}일 (
                      {ann.calendarType === 'solar' ? '양력' : '음력'})
                    </div>
                  </div>
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
                    ⋮
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            기념일을 추가해 보세요
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center text-slate-500 dark:text-slate-400">
          로드 중...
        </div>
      )}
    </div>
  );
}
