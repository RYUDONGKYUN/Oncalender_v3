'use client';

import { useState } from 'react';
import MonthView from './calendar/MonthView';
import WeekView from './calendar/WeekView';
import DayView from './calendar/DayView';

type CalendarViewType = 'month' | 'week' | 'day';

export default function CalendarView() {
  const [viewType, setViewType] = useState<CalendarViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewType === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewType === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="p-4 pb-32 space-y-4">
      {/* View controls */}
      <div className="flex gap-2 bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm">
        <button
          onClick={() => setViewType('month')}
          className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
            viewType === 'month'
              ? 'bg-blue-500 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          월
        </button>
        <button
          onClick={() => setViewType('week')}
          className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
            viewType === 'week'
              ? 'bg-blue-500 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          주
        </button>
        <button
          onClick={() => setViewType('day')}
          className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
            viewType === 'day'
              ? 'bg-blue-500 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          일
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm">
        <button
          onClick={handlePrevious}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
        >
          ← 이전
        </button>
        <button
          onClick={handleToday}
          className="px-3 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          오늘
        </button>
        <button
          onClick={handleNext}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
        >
          다음 →
        </button>
      </div>

      {/* Calendar views */}
      {viewType === 'month' && <MonthView currentDate={currentDate} />}
      {viewType === 'week' && <WeekView currentDate={currentDate} />}
      {viewType === 'day' && <DayView currentDate={currentDate} />}
    </div>
  );
}
