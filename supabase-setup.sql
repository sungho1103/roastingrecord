-- 로스팅 레코드 테이블 생성
CREATE TABLE roasting_records (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  time TEXT,
  bean_name TEXT NOT NULL,
  bean_origin TEXT,
  green_weight DECIMAL(10, 2) NOT NULL,
  roasted_weight DECIMAL(10, 2),
  yield DECIMAL(5, 2),
  
  -- 초기 세팅값
  fan1 DECIMAL(5, 2),
  heater DECIMAL(5, 2),
  fan2 DECIMAL(5, 2),
  
  -- 온도별 시간 기록 (JSON)
  temps JSONB NOT NULL DEFAULT '{}',
  
  -- 자동 계산 구간
  maillard_time TEXT,
  develop_time TEXT,
  dtr DECIMAL(5, 2),
  total_time TEXT,
  
  -- 메모
  notes TEXT,
  cupping_notes TEXT,
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX idx_roasting_records_date ON roasting_records(date DESC);
CREATE INDEX idx_roasting_records_bean_name ON roasting_records(bean_name);

-- Row Level Security (RLS) 활성화
ALTER TABLE roasting_records ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능하도록 정책 설정 (개인 사용이므로)
CREATE POLICY "Enable all access for all users" ON roasting_records
  FOR ALL
  USING (true)
  WITH CHECK (true);
