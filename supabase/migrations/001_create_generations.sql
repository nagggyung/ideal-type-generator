-- generations 테이블 생성
CREATE TABLE IF NOT EXISTS generations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_input  text NOT NULL,
  prompt      text NOT NULL,
  image_url   text NOT NULL,
  is_saved    boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- RLS 활성화
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- 본인 데이터만 조회
CREATE POLICY "select_own" ON generations
  FOR SELECT USING (auth.uid() = user_id);

-- 본인 데이터만 삽입
CREATE POLICY "insert_own" ON generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 본인 데이터만 업데이트
CREATE POLICY "update_own" ON generations
  FOR UPDATE USING (auth.uid() = user_id);

-- 본인 데이터만 삭제
CREATE POLICY "delete_own" ON generations
  FOR DELETE USING (auth.uid() = user_id);
