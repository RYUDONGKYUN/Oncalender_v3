# OnCalendar v3

양력·음력 반복 기념일을 2100년까지 자동으로 관리하는 네이티브 Android 앱

## 기술 스택

- **프론트엔드**: Next.js 16.2, React 19, TypeScript, Tailwind CSS
- **백엔드**: Node.js, Prisma ORM
- **데이터베이스**: PostgreSQL (Neon/Supabase)
- **모바일**: Capacitor 6.1
- **기타**: React Query, Google Calendar API

## 개발 단계

### Phase 1: 기본 캘린더 (진행 중)
- [x] 월/주/일 뷰 API
- [x] 일정 CRUD API
- [x] 다중 캘린더 지원

### Phase 2: 반복 기념일 (예정)
- [ ] 양력/음력 자동 변환
- [ ] 기념일 관리 API
- [ ] 반복 기념일 생성

### Phase 3: 구글 캘린더 연동 (예정)
- [ ] Google OAuth 로그인
- [ ] 구글 캘린더 API 연동
- [ ] 15분 캐싱

### Phase 4: D-day 및 요약 (예정)
- [ ] D-day 자동 계산
- [ ] 요약 카드

### Phase 5: 기일 카테고리 및 알림 (예정)
- [ ] 기일(忌日) 카테고리
- [ ] 로컬 알림 기능

## 설치 및 실행

```bash
npm install
npm run dev
```

## API 문서

### 캘린더
- `GET /api/calendars` - 모든 캘린더 조회
- `POST /api/calendars` - 캘린더 생성
- `PUT /api/calendars/[id]` - 캘린더 수정
- `DELETE /api/calendars/[id]` - 캘린더 삭제

### 일정
- `GET /api/events?start=&end=` - 일정 조회
- `POST /api/events` - 일정 생성
- `PUT /api/events/[id]` - 일정 수정
- `DELETE /api/events/[id]` - 일정 삭제
