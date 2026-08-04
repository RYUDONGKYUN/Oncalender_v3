'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAnniversariesFromStorage, convertAnniversariesToEvents, indexEventsByDate, WEEKDAY_LABELS, CalendarEvent } from '@/lib/eventUtils';

interface WeekViewProps {
  currentDate: Date;
  onDateClick?: (date: Date) => void;
}

export default function WeekView({ currentDate, onDateClick }: WeekViewProps) {
  const [eventsByDate, setEventsByDate] = useState<Map<string, CalendarEvent[]>>(new Map());

  const startOfWeek = useMemo(() => {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - currentDate.getDay());
    return date;
  }, [currentDate]);

  const endOfWeek = useMemo(() => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + 6);
    return date;
  }, [startOfWeek]);

  useEffect(() => {
    const anniversaries = getAnniversariesFromStorage();
    const events = convertAnniversariesToEvents(anniversaries);
    const weekEvents = events.filter((event) => {
      const eventDate = new Date(event.startAt);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });
    setEventsByDate(indexEventsByDate(weekEvents));
  }, [startOfWeek, endOfWeek]);

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, [startOfWeek]);

  const getEventsForDate = (date: Date) => {
    return eventsByDate.get(date.toDateString()) || [];
  };

  return (
    <div className="space-y-4">
      <div className="text-center bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {startOfWeek.getMonth() + 1}월 {startOfWeek.getDate()}일 ~ {endOfWeek.getMonth() + 1}월 {endOfWeek.getDate()}일
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
          {weekDays.map((day, idx) => {
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div
                key={idx}
                onClick={() => onDateClick?.(day)}
                className={`p-3 text-center border-r border-slate-200 dark:border-slate-700 last:border-r-0 cursor-pointer transition-colors ${
                  isToday ? 'bg-gray-50 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {WEEKDAY_LABELS[day.getDay()]}
                </div>
                <div
                  className={`text-lg font-bold mt-1 ${
                    isToday ? 'text-gray-700 dark:text-gray-300' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-7">
          {weekDays.map((day, idx) => {
            const dayEvents = getEventsForDate(day);
            return (
              <div
                key={idx}
                className="min-h-64 p-2 border-r border-slate-200 dark:border-slate-700 last:border-r-0 space-y-2"
              >
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="text-xs bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200 p-2 rounded"
                  >
                    <div className="font-semibold truncate">{event.title}</div>
                    <div className="text-xs opacity-75 mt-1">
                      {new Date(event.startAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
