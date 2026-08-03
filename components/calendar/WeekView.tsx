'use client';

import { useState, useEffect } from 'react';

interface WeekViewProps {
  currentDate: Date;
  onDateClick?: (date: Date) => void;
}

export default function WeekView({ currentDate, onDateClick }: WeekViewProps) {
  const [events, setEvents] = useState<any[]>([]);

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = () => {
    try {
      // localStorage에서 기념일 가져오기
      const saved = localStorage.getItem('anniversaries_data');
      const anniversaries = saved ? JSON.parse(saved) : [];

      // 현재 주의 기념일만 필터링
      const weekEvents = anniversaries
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
          eventDate.setHours(0, 0, 0, 0); // 00:00에 설정

          return {
            id: ann.id,
            title: ann.title,
            startAt: eventDate.toISOString(),
            category: ann.category,
          };
        })
        .filter((event: any) => {
          const eventDate = new Date(event.startAt);
          return eventDate >= startOfWeek && eventDate <= endOfWeek;
        });

      setEvents(weekEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
    }
  };

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    weekDays.push(day);
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startAt);
      return eventDate.toDateString() === date.toDateString();
    });
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
                  {['일', '월', '화', '수', '목', '금', '토'][day.getDay()]}
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
                    className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 rounded"
                  >
                    <div className="font-semibold truncate">{event.title}</div>
                    <div className="text-xs opacity-75">
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
