# Security

## 원칙

1. **서버에서만 AI API 호출** — OpenAI API Key는 절대 클라이언트에 노출하지 않는다.
2. **RLS 필수** — 모든 DB 접근은 Supabase RLS를 통해 사용자 격리가 보장되어야 한다.
3. **Service Role Key 금지** — `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용이며 클라이언트 번들에 포함되지 않는다.
4. **입력 검증** — 사용자 입력은 서버 사이드에서 길이·형식 검증 후 AI API에 전달한다.

---

## 환경변수 분류

| 변수명 | 위치 | 설명 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 클라이언트 허용 | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 클라이언트 허용 | RLS가 적용된 공개 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | **서버 전용** | RLS 우회 가능 — 절대 클라이언트 노출 금지 |
| `OPENAI_API_KEY` | **서버 전용** | OpenAI API 호출 전용 |

> `NEXT_PUBLIC_` 접두사가 없는 변수는 자동으로 서버 전용으로 처리된다.

---

## Supabase RLS 정책

### `generations` 테이블

```sql
-- 활성화
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- 본인 데이터만 조회
CREATE POLICY "select_own" ON generations
  FOR SELECT USING (auth.uid() = user_id);

-- 본인 데이터만 삽입 (user_id를 직접 설정 불가 — auth.uid() 강제)
CREATE POLICY "insert_own" ON generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- is_saved 필드만 업데이트 허용
CREATE POLICY "update_own" ON generations
  FOR UPDATE USING (auth.uid() = user_id);

-- 본인 데이터만 삭제
CREATE POLICY "delete_own" ON generations
  FOR DELETE USING (auth.uid() = user_id);
```

### Supabase Storage (`generation-images` bucket)

```sql
-- 로그인한 사용자만 업로드 (본인 폴더에만)
CREATE POLICY "upload_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'generation-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 본인 이미지만 조회
CREATE POLICY "select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'generation-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## API Route 보안

### `/api/generate`
- 요청 본문 검증: `user_input` 필드 존재 여부, 최대 500자 제한
- OpenAI 응답 오류 시 사용자에게 내부 오류 메시지 노출 금지
- Rate limit: 추후 sprint-03에서 Vercel Edge Config 또는 Upstash 적용 검토

### `/api/save`
- Supabase Auth 세션 확인 → 미인증 요청은 401 반환
- `user_id`는 클라이언트 입력값이 아닌 `auth.getUser()`에서 추출

---

## 하지 말 것

- `SUPABASE_SERVICE_ROLE_KEY`를 클라이언트 컴포넌트나 `NEXT_PUBLIC_` 변수로 사용
- OpenAI API Key를 클라이언트 코드에서 직접 호출
- RLS 없이 테이블 접근 허용
- 사용자 입력을 검증 없이 AI 프롬프트에 그대로 삽입
