# Sprint 01 — 기반 설정

## 목표
Supabase 연동, 인증, DB 스키마, 환경변수 설정을 완료하여 개발 기반을 구축한다.

## 범위

### 포함
- [ ] `.env.local` 환경변수 설정 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENAI_API_KEY`)
- [ ] `src/lib/supabase/client.ts` — 클라이언트용 Supabase 인스턴스
- [ ] `src/lib/supabase/server.ts` — 서버용 Supabase 인스턴스 (cookies 기반)
- [ ] Supabase `generations` 테이블 생성 마이그레이션 (`supabase/` 폴더)
- [ ] RLS 정책 적용 (docs/SECURITY.md 기준)
- [ ] Supabase Auth 설정 (이메일 로그인)
- [ ] `app/auth/login/page.tsx` — 로그인 페이지 (UI만)
- [ ] `app/auth/callback/route.ts` — OAuth 콜백 처리
- [ ] `npm run verify` 스크립트 추가 (`tsc --noEmit && next build`)
- [ ] `ARCHITECTURE.md` 초안 작성

### 제외
- GPT / DALL·E API 연동
- 이미지 생성 기능
- 기록 저장 기능

## 완료 기준

1. `npm run verify` 통과
2. Supabase에서 `generations` 테이블 확인 가능
3. RLS 정책 활성화 확인 (Supabase Dashboard)
4. 로그인 페이지 `/auth/login` 접근 가능
5. `state/progress.json` sprint-01 완료로 업데이트
6. `docs/SECURITY.md` RLS 정책 반영 확인

## 예상 소요 시간
1~2일
