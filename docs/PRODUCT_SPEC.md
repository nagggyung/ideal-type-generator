# Product Spec — 이상형 이미지 생성기

## 개요

사용자가 자연어로 이상형 조건을 입력하면 GPT가 이미지 생성 프롬프트로 변환하고,
DALL·E로 이상형 이미지를 생성하여 결과를 보여주는 웹앱.

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js Route Handlers (API) |
| Auth | Supabase Auth (이메일/소셜 로그인) |
| DB | Supabase PostgreSQL + RLS |
| Storage | Supabase Storage (생성 이미지 저장) |
| AI | OpenAI GPT-4o (프롬프트 변환) + DALL·E 3 (이미지 생성) |
| Hosting | Vercel |

---

## 페이지 구조 (App Router)

```
app/
├── page.tsx                  # 홈 — 이상형 조건 입력 폼
├── result/page.tsx           # 결과 — 생성된 이미지 표시
├── history/page.tsx          # 기록 — 내가 저장한 이미지 목록 (로그인 필요)
├── auth/
│   ├── login/page.tsx        # 로그인
│   └── callback/route.ts     # OAuth 콜백
└── api/
    ├── generate/route.ts     # GPT 프롬프트 변환 + DALL·E 이미지 생성
    └── save/route.ts         # 이미지 저장
```

---

## 핵심 기능 (MVP)

### 1. 이상형 조건 입력
- 사용자가 자유 형식 텍스트로 이상형 키워드 입력
- 예시 키워드 제공 (차분한 분위기, 강아지상, 다정한 느낌 등)
- 입력 후 "이미지 생성" 버튼 클릭

### 2. GPT 프롬프트 변환
- `/api/generate` Route Handler에서 처리
- GPT-4o가 자연어 → DALL·E용 영문 프롬프트로 변환
- 변환된 프롬프트를 결과 화면에 표시

### 3. 이미지 생성
- DALL·E 3으로 이미지 생성 (1024×1024)
- 생성된 이미지 URL 반환

### 4. 결과 화면
- 생성된 이미지 표시
- 변환된 프롬프트 확인 가능
- "다시 생성하기" 버튼 (같은 조건으로 재생성)
- "저장하기" 버튼 (로그인 필요)

### 5. 생성 기록
- 로그인한 사용자만 접근 가능
- 저장한 이미지 목록 표시 (생성일, 입력 조건, 프롬프트 포함)
- 저장 취소 기능

---

## 데이터 모델

### `generations` 테이블
```sql
CREATE TABLE generations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_input  text NOT NULL,           -- 사용자가 입력한 원문 조건
  prompt      text NOT NULL,           -- GPT가 변환한 DALL·E 프롬프트
  image_url   text NOT NULL,           -- Supabase Storage URL
  is_saved    boolean DEFAULT false,   -- 저장 여부
  created_at  timestamptz DEFAULT now()
);
```

### RLS 정책
- `SELECT`: `auth.uid() = user_id`
- `INSERT`: `auth.uid() = user_id`
- `UPDATE`: `auth.uid() = user_id` (is_saved 필드만)
- `DELETE`: `auth.uid() = user_id`

---

## 사용자 흐름

```
[홈] 이상형 조건 입력
  ↓
[API] GPT로 프롬프트 변환
  ↓
[API] DALL·E로 이미지 생성
  ↓
[결과] 이미지 + 프롬프트 표시
  ↓ (로그인 시)
[저장] Supabase Storage + generations 테이블에 기록
  ↓
[기록] /history 에서 확인
```

---

## Sprint 계획

| Sprint | 범위 | 목표 |
|--------|------|------|
| sprint-01 | 기반 설정 | Supabase 연동, Auth, DB 스키마, 환경변수 |
| sprint-02 | 핵심 기능 | 입력 → GPT 변환 → 이미지 생성 → 결과 화면 |
| sprint-03 | 저장 & 기록 | 이미지 저장, 히스토리 페이지, RLS 검증 |
