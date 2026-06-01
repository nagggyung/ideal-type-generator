# Sprint 03 — 저장 & 기록

## 목표
이미지 저장, 히스토리 페이지, RLS 검증을 완료하여 MVP를 완성한다.

## 전제 조건
- sprint-01, sprint-02 완료

## 범위

### 포함
- [ ] `app/api/save/route.ts` — 이미지 저장 API
  - Supabase Auth 세션 검증 (미인증 → 401)
  - DALL·E 이미지 URL → Supabase Storage에 업로드
  - `generations` 테이블에 레코드 삽입 (`is_saved = true`)
  - `user_id`는 `auth.getUser()`에서 추출 (클라이언트 입력 불신)
- [ ] `app/result/page.tsx` — 저장 버튼 실제 동작 연결
  - 저장 성공/실패 토스트 메시지
- [ ] `app/history/page.tsx` — 기록 페이지
  - 로그인 필수 (미인증 → `/auth/login` 리다이렉트)
  - 저장한 이미지 목록 (생성일, 입력 조건, 프롬프트)
  - 저장 취소(삭제) 기능
- [ ] `middleware.ts` — `/history` 경로 인증 보호
- [ ] Supabase Storage `generation-images` 버킷 생성 및 RLS 적용
- [ ] `docs/QUALITY_SCORE.md` 최종 체크리스트 점검

### 제외
- Rate limiting (별도 인프라 필요, 추후 과제)
- 소셜 로그인 추가
- 이미지 공유 기능

## 완료 기준

1. `npm run verify` 통과
2. 로그인 사용자: 이미지 저장 → `/history`에서 확인 가능
3. 비로그인 사용자: `/history` 접근 시 로그인 페이지로 리다이렉트
4. 다른 사용자의 데이터 접근 불가 (RLS 검증)
5. Storage RLS: 본인 폴더 외 업로드/조회 불가 확인
6. `docs/QUALITY_SCORE.md` 80점 이상 달성
7. `state/progress.json` sprint-03 완료로 업데이트
8. `ARCHITECTURE.md` 최종 반영

## 예상 소요 시간
2~3일
