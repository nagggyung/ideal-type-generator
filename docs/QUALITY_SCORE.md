# Quality Score

## 완료 기준 체크리스트

각 sprint 완료 시 아래 항목을 확인한다.
모든 항목이 통과되어야 sprint가 완료된 것으로 간주한다.

---

## 코드 품질

- [ ] `npm run build` 오류 없음
- [ ] TypeScript strict 모드 오류 없음 (`tsc --noEmit`)
- [ ] 미사용 import/변수 없음
- [ ] `NEXT_PUBLIC_` 변수에 민감 정보 없음

## 보안

- [ ] 모든 테이블에 RLS 활성화 확인
- [ ] OpenAI API Key 서버 전용 확인
- [ ] Supabase Service Role Key 클라이언트 미노출 확인
- [ ] API Route에서 사용자 입력 검증 존재

## 기능

- [ ] 이상형 조건 입력 → 이미지 생성 전체 흐름 동작
- [ ] 비로그인 사용자: 이미지 생성 가능, 저장 불가 (로그인 유도)
- [ ] 로그인 사용자: 저장 및 기록 확인 가능
- [ ] 다시 생성하기 동작 확인
- [ ] 오류 상황에서 사용자에게 적절한 메시지 표시

## 문서

- [ ] `docs/SECURITY.md` — RLS 정책 최신 상태
- [ ] `docs/DECISIONS.md` — 아키텍처 결정 기록
- [ ] `state/progress.json` — 현재 sprint 상태 반영
- [ ] `ARCHITECTURE.md` — 폴더 구조 및 데이터 흐름 최신 상태

---

## Sprint별 점수 기준

| 항목 | 배점 |
|------|------|
| 빌드 통과 | 20점 |
| 보안 체크리스트 통과 | 30점 |
| 핵심 기능 동작 | 30점 |
| 문서 최신화 | 20점 |
| **합계** | **100점** |

80점 이상 = sprint 완료 승인
