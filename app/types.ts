export interface RoastingRecord {
  id: string // 5자리 숫자 (빈 문자열로 시작 가능)
  date: string // YYYY-MM-DD
  time?: string // HH:MM 로스팅 시작 시간
  beanName: string // 원두 이름
  beanOrigin?: string // 원산지
  greenWeight: number // 생두 투입량 (g)
  roastedWeight?: number // 배출량 (g)
  yield?: number // 수율 (%)
  // 초기 세팅값
  fan1?: number // FAN1 세팅
  heater?: number // Heater 세팅
  fan2?: number // FAN2 세팅
  // 온도별 시간 기록
  temps: {
    [key: string]: string // 온도: 시간(MM:SS)
  }
  // 자동 계산 구간
  maillardTime?: string // 150도-180도
  developTime?: string // 182도 또는 183도-배출
  dtr?: number // Development Time Ratio (%)
  totalTime?: string // 전체 로스팅 시간
  notes?: string // 메모
  cuppingNotes?: string // 컵핑 노트
  memo?: string // 메모
  createdAt: string
  updatedAt: string
}

// 100-180: 10도 단위, 180-195: 1도 단위
export const TEMP_BUTTONS = [
  100, 110, 120, 130, 140, 150, 160, 170, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194,
  195,
] as const

export const WEIGHT_OPTIONS = [
  { label: "50g", value: 50 },
  { label: "60g", value: 60 },
  { label: "100g", value: 100 },
  { label: "120g", value: 120 },
  { label: "150g", value: 150 },
  { label: "180g", value: 180 },
  { label: "기타", value: 0 },
] as const

export const DEFAULT_BEANS = [
  "Ethiopia Yirgacheffe",
  "Colombia Supremo",
  "Kenya AA",
  "Brazil Santos",
  "Guatemala Antigua",
  "Costa Rica Tarrazu",
  "Indonesia Sumatra",
  "Panama Geisha",
] as const
