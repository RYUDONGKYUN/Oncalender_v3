'use client';

import { useState, useEffect } from 'react';

interface MonthViewProps {
  currentDate: Date;
  onDateClick?: (date: Date) => void;
}

export default function MonthView({ currentDate, onDateClick }: MonthViewProps) {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = () => {
    try {
      // localStorage에서 기념일 가져오기
      const saved = localStorage.getItem('anniversaries_data');
      const anniversaries = saved ? JSON.parse(saved) : [];

      // 현재 월의 기념일만 필터링
      const monthEvents = anniversaries
        .map((ann: any) => {
          const currentYear = new Date().getFullYear();
          let month = ann.originMonth;
          let day = ann.originDay;

          // 음력인 경우 양력으로 근사 변환
          if (ann.calendarType === 'lunar') {
            month = month + 1;
            if (month > 12) month = 1;
          }

          const eventDate = new Date(currentYear, month - 1, day);
          return {
            id: ann.id,
            title: ann.title,
            startAt: eventDate.toISOString(),
            category: ann.category,
          };
        })
        .filter((event: any) => {
          const eventDate = new Date(event.startAt);
          return eventDate.getMonth() === currentDate.getMonth() &&
                 eventDate.getFullYear() === currentDate.getFullYear();
        });

      setEvents(monthEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startAt);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const weekDayLabels = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
          {weekDayLabels.map((label) => (
            <div key={label} className="p-3 text-center bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const isToday = day && day.toDateString() === new Date().toDateString();
            const dayEvents = day ? getEventsForDate(day) : [];

            return (
              <div
                key={idx}
                onClick={() => day && onDateClick?.(day)}
                className={`min-h-24 p-2 border border-slate-200 dark:border-slate-700 transition-colors ${
                  isToday ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-slate-800'
                } ${day ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-semibold mb-1 ${
                      isToday ? 'text-gray-700 dark:text-gray-300' : 'text-slate-900 dark:text-white'
                    }`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div key={event.id} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-1 rounded truncate">
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          +{dayEvents.length - 2}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
