# Architecture Decisions

## GPT 프롬프트 전략

- **결정**: GPT-4o를 시스템 프롬프트로 활용하여 한국어 자연어 → DALL·E 3 영문 프롬프트 변환
- **이유**: DALL·E 3는 영문 프롬프트에서 최적 성능을 발휘하며, GPT-4o가 문화적 맥락(강아지상, 차분한 분위기 등)을 적절히 해석함
- **max_tokens=300**: 프롬프트 품질을 유지하면서 비용 및 지연 최소화

## Supabase SSR 사용

- **결정**: `@supabase/ssr` 패키지의 `createBrowserClient` / `createServerClient` 분리 사용
- **이유**: Next.js App Router의 서버/클라이언트 컴포넌트 분리에 맞는 올바른 Supabase 인증 방식

## webpack 모드 강제

- **결정**: `next dev --webpack` 으로 Turbopack 비활성화
- **이유**: Turbopack이 한글 경로명(`개발/`)에서 UTF-8 바이트 경계 버그 발생 (Next.js 16.2.6 기준)

## Storage: 원본 URL 폴백

- **결정**: DALL·E 이미지를 Supabase Storage에 업로드 실패 시 원본 DALL·E URL을 사용
- **이유**: DALL·E URL은 1시간 후 만료되므로 Storage 저장이 우선이나, 업로드 실패 시 앱 전체가 중단되지 않도록 폴백 처리
