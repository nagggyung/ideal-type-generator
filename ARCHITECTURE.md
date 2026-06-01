# Architecture

## 기술 스택

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Auth**: Supabase Auth
- **DB**: Supabase PostgreSQL + RLS
- **Storage**: Supabase Storage
- **AI**: OpenAI GPT-4o + DALL·E 3
- **Hosting**: Vercel

---

## 폴더 구조

```
my-app/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # 홈 — 이상형 조건 입력
│   │   ├── result/page.tsx           # 결과 — 생성 이미지 표시
│   │   ├── history/page.tsx          # 기록 — 저장 이미지 목록 (인증 필요)
│   │   ├── auth/
│   │   │   ├── login/page.tsx        # 로그인
│   │   │   └── callback/route.ts    # OAuth 콜백
│   │   └── api/
│   │       ├── generate/route.ts    # GPT 변환 + DALL·E 생성
│   │       └── save/route.ts        # 이미지 저장
│   ├── features/
│   │   └── goals/                   # (추후 확장용)
│   └── lib/
│       └── supabase/
│           ├── client.ts            # 클라이언트 Supabase 인스턴스
│           └── server.ts            # 서버 Supabase 인스턴스 (cookies)
├── supabase/                        # DB 마이그레이션 파일
├── docs/
│   ├── sprint-contracts/            # sprint-01/02/03.md
│   ├── PRODUCT_SPEC.md
│   ├── SECURITY.md
│   ├── RELIABILITY.md
│   ├── QUALITY_SCORE.md
│   └── DECISIONS.md
├── state/
│   ├── progress.json                # 현재 sprint 진행 상태
│   ├── handoff.md
│   └── trajectory.jsonl
├── eval/
│   └── final-report.md
├── scripts/guardrails/
├── CLAUDE.md
├── AGENTS.md
└── ARCHITECTURE.md
```

---

## 데이터 흐름

```
사용자 입력 (한국어 자연어)
  ↓
[POST /api/generate]
  ├── 입력 검증 (서버)
  ├── GPT-4o: 한국어 → DALL·E 영문 프롬프트
  └── DALL·E 3: 이미지 생성
        ↓
[result/page.tsx]
  ├── 이미지 표시
  ├── 프롬프트 표시
  └── 저장 버튼 (로그인 필요)
        ↓ (저장 클릭 시)
[POST /api/save]
  ├── auth.getUser() 로 user_id 추출
  ├── Supabase Storage 업로드
  └── generations 테이블 INSERT
        ↓
[history/page.tsx]
  └── 본인 저장 목록 조회 (RLS 적용)
```

---

## 보안 모델

- 모든 AI API 호출은 서버 Route Handler에서만 실행
- `OPENAI_API_KEY`는 서버 전용 환경변수
- Supabase RLS로 모든 DB/Storage 접근을 사용자 단위로 격리
- 상세 내용 → `docs/SECURITY.md`
