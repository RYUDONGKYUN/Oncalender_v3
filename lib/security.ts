// 보안 유틸리티 함수들

export const SecurityConfig = {
  // 연도 범위
  MIN_YEAR: 1900,
  MAX_YEAR: 2100,

  // 제목 최대 길이
  MAX_TITLE_LENGTH: 100,

  // localStorage 데이터 버전 (손상된 데이터 감지용)
  DATA_VERSION: '1',
};

// localStorage에서 안전하게 데이터 읽기
export function safeJsonParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;

  try {
    const parsed = JSON.parse(json);

    // 데이터 무결성 검사
    if (!Array.isArray(parsed)) {
      console.warn('Invalid data format detected');
      return fallback;
    }

    return parsed as T;
  } catch (err) {
    console.warn('Failed to parse localStorage data, using fallback');
    return fallback;
  }
}

// 제목 검증 및 정제
export function sanitizeTitle(title: string): string {
  return title
    .trim()
    .slice(0, SecurityConfig.MAX_TITLE_LENGTH)
    .replace(/[<>]/g, ''); // XSS 방지
}

// 카테고리 검증
export function validateCategory(
  category: string,
  validCategories: string[]
): boolean {
  return validCategories.includes(category);
}

// 연도 검증
export function validateYear(year: number): boolean {
  return (
    Number.isInteger(year) &&
    year >= SecurityConfig.MIN_YEAR &&
    year <= SecurityConfig.MAX_YEAR
  );
}

// 날짜 범위 검증
export function validateDateRange(
  startDate: string | undefined,
  endDate: string | undefined
): boolean {
  if (!startDate || !endDate) return true;

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  } catch {
    return false;
  }
}

// 안전한 에러 메시지 (민감 정보 제거)
export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // 개발 환경에서만 상세 정보 표시
    if (process.env.NODE_ENV === 'development') {
      return error.message;
    }
  }

  return '문제가 발생했습니다. 다시 시도해주세요.';
}

// localStorage 데이터 마이그레이션 (향후 스키마 변경 대비)
export function migrateLocalStorageData(data: any): any {
  // 현재는 버전 1만 지원
  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data.map((item) => ({
    id: item.id || Date.now().toString(),
    title: sanitizeTitle(item.title || ''),
    category: item.category || '기타',
    originYear: validateYear(item.originYear) ? item.originYear : new Date().getFullYear(),
    originMonth: Math.max(1, Math.min(12, item.originMonth || 1)),
    originDay: Math.max(1, Math.min(31, item.originDay || 1)),
    calendarType: ['solar', 'lunar'].includes(item.calendarType) ? item.calendarType : 'solar',
    endDate: item.endDate || undefined,
  }));
}
