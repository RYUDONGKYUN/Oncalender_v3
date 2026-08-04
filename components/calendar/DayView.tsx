'use client';

import { useState, useEffect } from 'react';
import { getAnniversariesFromStorage, convertAnniversariesToEvents, indexEventsByHour, CalendarEvent } from '@/lib/eventUtils';

interface DayViewProps {
  currentDate: Date;
}

export default function DayView({ currentDate }: DayViewProps) {
  const [eventsByHour, setEventsByHour] = useState<Map<number, CalendarEvent[]>>(new Map());

  useEffect(() => {
    const anniversaries = getAnniversariesFromStorage();
    const events = convertAnniversariesToEvents(anniversaries);
    const dayEvents = events.filter(
      (event) => new Date(event.startAt).toDateString() === currentDate.toDateString()
    );
    setEventsByHour(indexEventsByHour(dayEvents));
  }, [currentDate]);

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
            <div className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm font-medium">
              오늘
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
        {hours.map((hour) => {
          const hourEvents = eventsByHour.get(hour) || [];

          return (
            <div key={hour} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0 flex">
              <div className="w-16 p-3 bg-slate-50 dark:bg-slate-700 border-r border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400">
                {String(hour).padStart(2, '0')}:00
              </div>
              <div className="flex-1 min-h-20 p-3 space-y-2">
                {hourEvents.map((event) => (
                  <div key={event.id} className="text-sm bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200 p-2 rounded">
                    <div className="font-semibold">{event.title}</div>
                    <div className="text-xs opacity-75">
                      {new Date(event.startAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      ~ {new Date(event.endAt || event.startAt).toLocaleTimeString('ko-KR', {
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
