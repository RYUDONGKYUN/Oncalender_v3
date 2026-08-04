'use client';

// 요일 상수
export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

// 기념일 데이터 인터페이스
export interface Anniversary {
  id: string;
  title: string;
  category: string;
  originYear: number;
  originMonth: number;
  originDay: number;
  calendarType: string;
  endDate?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startAt: string;
  endAt?: string;
  category: string;
}

// localStorage에서 기념일 데이터 가져오기
export const getAnniversariesFromStorage = (): Anniversary[] => {
  try {
    const saved = localStorage.getItem('anniversaries_data');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load anniversaries:', error);
    return [];
  }
};

// 기념일을 캘린더 이벤트로 변환
export const convertAnniversariesToEvents = (
  anniversaries: Anniversary[],
  targetMonth?: number,
  targetYear?: number
): CalendarEvent[] => {
  const currentYear = targetYear || new Date().getFullYear();

  return anniversaries
    .map((ann) => {
      let month = ann.originMonth;
      let day = ann.originDay;

      // 음력인 경우 양력으로 근사 변환
      if (ann.calendarType === 'lunar') {
        month = month + 1;
        if (month > 12) month = 1;
      }

      const eventDate = new Date(currentYear, month - 1, day);
      eventDate.setHours(0, 0, 0, 0);

      const endDate = new Date(eventDate);
      endDate.setHours(0, 30, 0, 0);

      return {
        id: ann.id,
        title: ann.title,
        startAt: eventDate.toISOString(),
        endAt: endDate.toISOString(),
        category: ann.category,
      };
    })
    .filter((event) => {
      // targetMonth 지정 시에만 필터링
      if (targetMonth !== undefined) {
        const eventDate = new Date(event.startAt);
        return eventDate.getMonth() === targetMonth &&
               eventDate.getFullYear() === currentYear;
      }
      return true;
    });
};

// 날짜별 이벤트 인덱싱 (빠른 조회용)
export const indexEventsByDate = (events: CalendarEvent[]): Map<string, CalendarEvent[]> => {
  const indexed = new Map<string, CalendarEvent[]>();

  events.forEach((event) => {
    const date = new Date(event.startAt).toDateString();
    if (!indexed.has(date)) {
      indexed.set(date, []);
    }
    indexed.get(date)!.push(event);
  });

  return indexed;
};

// 시간별 이벤트 인덱싱 (DayView용)
export const indexEventsByHour = (events: CalendarEvent[]): Map<number, CalendarEvent[]> => {
  const indexed = new Map<number, CalendarEvent[]>();

  events.forEach((event) => {
    const hour = new Date(event.startAt).getHours();
    if (!indexed.has(hour)) {
      indexed.set(hour, []);
    }
    indexed.get(hour)!.push(event);
  });

  return indexed;
};
