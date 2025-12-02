-- 원두명 목록을 저장할 테이블 생성
CREATE TABLE IF NOT EXISTS bean_names (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 기본 원두명 삽입
INSERT INTO bean_names (name) VALUES
  ('에티오피아 예가체프'),
  ('콜롬비아 수프리모'),
  ('브라질 산토스'),
  ('과테말라 안티구아'),
  ('케냐 AA'),
  ('코스타리카 따라주'),
  ('인도네시아 만델링'),
  ('온두라스 SHG')
ON CONFLICT (name) DO NOTHING;
