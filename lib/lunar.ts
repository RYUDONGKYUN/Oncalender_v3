// @ts-ignore
import { Lunar, Solar } from 'lunar-javascript';

export function lunarToSolar(year: number, month: number, day: number, isLeapMonth: boolean = false) {
  try {
    const lunar = new Lunar(year, month, day, isLeapMonth);
    const solar = lunar.getSolar();
    return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
  } catch (error) {
    console.error('Error converting lunar to solar:', error);
    return null;
  }
}

export function solarToLunar(year: number, month: number, day: number) {
  try {
    const solar = new Solar(year, month, day);
    const lunar = solar.getLunar();
    return {
      year: lunar.getYear(),
      month: lunar.getMonth(),
      day: lunar.getDay(),
      isLeapMonth: lunar.isLeap(),
    };
  } catch (error) {
    console.error('Error converting solar to lunar:', error);
    return null;
  }
}

export function getAnniversarySolarDate(
  originYear: number,
  originMonth: number,
  originDay: number,
  targetYear: number,
  calendarType: 'solar' | 'lunar',
  leapPolicy: 'nearest_normal' | 'exact_only' = 'nearest_normal'
) {
  if (calendarType === 'solar') {
    return new Date(targetYear, originMonth - 1, originDay);
  }

  // Lunar calendar
  try {
    const lunar = new Lunar(targetYear, originMonth, originDay, false);
    const solar = lunar.getSolar();
    return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
  } catch (error) {
    if (leapPolicy === 'exact_only') {
      return null;
    }
    // nearest_normal: try without leap month
    try {
      const lunar = new Lunar(targetYear, originMonth, originDay, false);
      const solar = lunar.getSolar();
      return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
    } catch {
      return null;
    }
  }
}

export function calculateDday(targetDate: Date, fromDate: Date = new Date()): number {
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const from = new Date(fromDate);
  from.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - from.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function getAnniversaryAge(originYear: number, targetYear: number): number {
  return targetYear - originYear;
}
