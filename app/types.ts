export interface RoastingRecord {
  id: string; // 5자리 숫자
  date: string; // YYYY-MM-DD
  beanName: string; // 원두 이름
  beanOrigin?: string; // 원산지
  greenWeight: number; // 생두 투입량 (g)
  roastedWeight?: number; // 배출량 (g)
  yield?: number; // 수율 (%)
  
  // 온도별 시간 기록
  temps: {
    [key: string]: string; // 온도: 시간(MM:SS)
  };
  
  // 자동 계산 구간
  maillardTime?: string; // 150도-180도
  developTime?: string; // 183도-배출
  dtr?: number; // Development Time Ratio (%)
  
  totalTime?: string; // 전체 로스팅 시간
  
  notes?: string; // 메모
  cuppingNotes?: string; // 컵핑 노트
  createdAt: string;
  updatedAt: string;
}

export const TEMP_BUTTONS = [
  100, 200, 300, 150, 180, 182, 183, 190, 191, 192, 193, 194, 195
] as const;
