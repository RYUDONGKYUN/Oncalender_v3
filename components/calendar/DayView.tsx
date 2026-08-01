'use client';

import { useState, useEffect } from 'react';

interface DayViewProps {
  currentDate: Date;
}

export default function DayView({ currentDate }: DayViewProps) {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      const start = new Date(currentDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(currentDate);
      end.setHours(23, 59, 59, 999);

      const userId = localStorage.getItem('userId') || 'demo-user';
      const response = await fetch(
        `/api/events?start=${start.toISOString()}&end=${end.toISOString()}`,
        {
          headers: {
            'x-user-id': userId,
          },
        }
      );
      if (response.ok) {
        setEvents(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {currentDate.getMonth() + 1}월 {currentDate.getDate()}일
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {['일', '월', '화', '수', '목', '금', '토'][currentDate.getDay()]}요일
            </p>
          </div>
          {currentDate.toDateString() === new Date().toDateString() && (
            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm font-medium">
              오늘
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
        {hours.map((hour) => {
          const hourEvents = events.filter((event) => {
            const eventTime = new Date(event.startAt);
            return eventTime.getHours() === hour;
          });

          return (
            <div key={hour} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0 flex">
              <div className="w-16 p-3 bg-slate-50 dark:bg-slate-700 border-r border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400">
                {String(hour).padStart(2, '0')}:00
              </div>
              <div className="flex-1 min-h-20 p-3 space-y-2">
                {hourEvents.map((event) => (
                  <div key={event.id} className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 p-2 rounded">
                    <div className="font-semibold">{event.title}</div>
                    <div className="text-xs opacity-75">
                      {new Date(event.startAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      ~ {new Date(event.endAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
