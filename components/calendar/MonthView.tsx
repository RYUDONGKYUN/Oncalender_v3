'use client';

import { useState, useEffect } from 'react';

interface MonthViewProps {
  currentDate: Date;
}

export default function MonthView({ currentDate }: MonthViewProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);

  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

  useEffect(() => {
    fetchEvents();
  }, [year, month]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId') || 'demo-user';
      const response = await fetch(
        `/api/events?start=${startDate.toISOString()}&end=${endDate.toISOString()}`,
        {
          headers: {
            'x-user-id': userId,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const days = [];
  let currentDay = new Date(startDate);

  while (currentDay <= endDate) {
    days.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startAt);
      return (
        eventDate.toDateString() === date.toDateString()
      );
    });
  };

  return (
    <div className="space-y-4">
      {/* Month title */}
      <div className="text-center bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {year}년 {month + 1}월
        </h2>
      </div>

      {/* Calendar grid */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center font-semibold text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const isCurrentMonth = day.getMonth() === month;
            const isToday = day.toDateString() === new Date().toDateString();
            const dayEvents = getEventsForDate(day);

            return (
              <div
                key={idx}
                className={`min-h-24 border-r border-b border-slate-200 dark:border-slate-700 p-2 ${
                  isCurrentMonth ? '' : 'bg-slate-50 dark:bg-slate-900'
                } ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
              >
                <div
                  className={`text-sm font-semibold mb-1 ${
                    isToday
                      ? 'text-blue-600 dark:text-blue-400'
                      : isCurrentMonth
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 p-1 rounded truncate"
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      +{dayEvents.length - 2}개
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="text-center text-slate-500 dark:text-slate-400">
          일정 로드 중...
        </div>
      )}
    </div>
  );
}
