# Record Calendar v3

양력·음력 반복 기념일을 2100년까지 자동으로 관리하는 네이티브 Android 앱

## 기술 스택

- **프론트엔드**: Next.js 16.2, React 19, TypeScript, Tailwind CSS
- **백엔드**: Node.js, Prisma ORM
- **데이터베이스**: PostgreSQL (Neon/Supabase)
- **모바일**: Capacitor 6.1
- **기타**: React Query, Google Calendar API

## 개발 단계

### Phase 1: 기본 캘린더 ✅
- [x] 월/주/일 뷰 API
- [x] 일정 CRUD API
- [x] 다중 캘린더 지원

### Phase 2: 반복 기념일 ✅
- [x] 양력/음력 자동 변환
- [x] 기념일 CRUD API
- [x] 2100년까지 반복 기념일 자동 생성
- [x] 윤달 정책 (nearest_normal, exact_only)

### Phase 3: 구글 캘린더 연동 ✅
- [x] Google Calendar API v3 연동
- [x] 구글 캘린더 일정 조회 (읽기 전용)
- [x] 15분 캐싱

### Phase 4: D-day 및 요약 ✅
- [x] D-day 자동 계산
- [x] 다가오는 기념일 요약 API
- [x] 기념일 나이/연차 표시

### Phase 5: 기일 카테고리 및 알림 ✅
- [x] 기일(忌日) 카테고리 지원
- [x] 알림 설정 API
- [x] 알림 로그 추적

## 설치 및 실행

```bash
npm install
npm run dev
```

## API 문서

### 인증
모든 요청에 `x-user-id` 헤더 필수 (임시 - Google OAuth 구현 예정)

### 캘린더
- `GET /api/calendars` - 모든 캘린더 조회
- `POST /api/calendars` - 캘린더 생성
- `PUT /api/calendars/[id]` - 캘린더 수정
- `DELETE /api/calendars/[id]` - 캘린더 삭제

### 일정
- `GET /api/events?start=YYYY-MM-DD&end=YYYY-MM-DD` - 일정 조회
- `POST /api/events` - 일정 생성
- `PUT /api/events/[id]` - 일정 수정
- `DELETE /api/events/[id]` - 일정 삭제

### 기념일
- `GET /api/anniversaries` - 모든 기념일 조회
- `POST /api/anniversaries` - 기념일 생성 (자동으로 2100년까지 발생 기록 생성)
- `PUT /api/anniversaries/[id]` - 기념일 수정
- `DELETE /api/anniversaries/[id]` - 기념일 삭제
- `GET /api/anniversaries/summary?days=30` - 다가오는 기념일 요약 (D-day 포함)

### 구글 캘린더
- `GET /api/google/calendars` (헤더: x-google-access-token) - 구글 캘린더 목록 조회
- `POST /api/google/calendars` - 구글 캘린더 동기화
- `GET /api/google/events?start=&end=&calendarId=` - 구글 캘린더 일정 조회

### 알림
- `GET /api/notifications/settings` - 모든 알림 설정 조회
- `GET /api/notifications/settings?anniversaryId=` - 특정 기념일 알림 설정 조회
- `POST /api/notifications/settings` - 알림 설정 생성/수정
- `GET /api/notifications/logs` - 알림 로그 조회
- `PUT /api/notifications/logs` - 알림 읽음 표시

## 데이터 모델

### Anniversary (기념일)
- `id`: UUID
- `title`: 기념일 제목
- `category`: '생일', '결혼기념일', '기일', '기타'
- `originYear`, `originMonth`, `originDay`: 기원 날짜
- `calendarType`: 'solar' (양력) 또는 'lunar' (음력)
- `isLeapMonth`: 음력 윤달 여부
- `leapPolicy`: 'nearest_normal' 또는 'exact_only'
- `repeatUntilYear`: 반복 종료 연도 (기본 2100)

### AnniversaryOccurrence (기념일 발생)
- `id`: UUID
- `anniversaryId`: 기념일 ID
- `year`: 발생 연도
- `resolvedSolarDate`: 계산된 양력 날짜
