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

  const fetchEvents = () => {
    try {
      // localStorage에서 기념일 가져오기
      const saved = localStorage.getItem('anniversaries_data');
      const anniversaries = saved ? JSON.parse(saved) : [];

      // 현재 날짜의 기념일만 필터링
      const dayEvents = anniversaries
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

          const endDate = new Date(eventDate);
          endDate.setHours(0, 30, 0, 0); // 00:30 종료

          return {
            id: ann.id,
            title: ann.title,
            startAt: eventDate.toISOString(),
            endAt: endDate.toISOString(),
            category: ann.category,
          };
        })
        .filter((event: any) => {
          const eventDate = new Date(event.startAt);
          return eventDate.toDateString() === currentDate.toDateString();
        });

      setEvents(dayEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
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
            <div className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm font-medium">
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
                  <div key={event.id} className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 rounded">
                    <div className="font-semibold">{event.title}</div>
                    <div className="text-xs opacity-75">
                      {new Date(event.startAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })} ~ {new Date(event.endAt).toLocaleTimeString('ko-KR', {
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
