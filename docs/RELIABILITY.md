# Reliability

## 오류 처리 전략

### AI API 오류
| 상황 | 대응 |
|------|------|
| GPT 응답 실패 | 사용자에게 "프롬프트 변환에 실패했습니다. 다시 시도해 주세요." 표시 |
| DALL·E 생성 실패 | 사용자에게 "이미지 생성에 실패했습니다. 다시 시도해 주세요." 표시 |
| OpenAI Rate Limit | 429 상태코드 반환, 재시도 안내 메시지 |
| 타임아웃 (30s 초과) | 생성 중단, 안내 메시지 표시 |

### Supabase 오류
| 상황 | 대응 |
|------|------|
| 저장 실패 | 이미지는 표시 유지, "저장에 실패했습니다." 토스트 표시 |
| 인증 만료 | `/auth/login`으로 리다이렉트 |
| RLS 위반 | 403 반환, 일반 오류 메시지 표시 (내부 정보 노출 금지) |

---

## 사용자 경험 보호

- **낙관적 UI 금지**: 저장 확인 전까지 "저장됨" 상태 표시 금지
- **로딩 상태**: 이미지 생성 중 스피너 + "이상형을 그리는 중..." 메시지
- **결과 유지**: 페이지 이탈 전 생성 결과를 세션에 임시 보존 (sessionStorage)

---

## 타임아웃 설정

```typescript
// app/api/generate/route.ts
export const maxDuration = 30; // Vercel Serverless Function 최대 30초
```

---

## 모니터링 (추후 적용)

- Vercel Analytics로 페이지 응답 시간 모니터링
- Supabase Dashboard에서 DB 오류 및 RLS 위반 로그 확인
- OpenAI API 사용량 대시보드 주기적 점검
