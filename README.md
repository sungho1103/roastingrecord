# TELA Coffee - Roasting Record System

커피 로스팅 기록 관리 시스템

## 주요 기능

- 📝 로스팅 배치 기록 관리
- ⏱️ 실시간 스톱워치 타이머
- 🌡️ 온도별 시간 자동 기록
- 📊 메일라드 반응 시간 자동 계산
- 📈 디벨롭 타임 및 DTR 자동 계산
- 💾 로컬 스토리지 저장
- 📱 모바일 반응형 디자인
- ✏️ 기록 수정 기능
- 🔍 검색 및 필터링

## 기술 스택

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Local Storage

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

## Vercel 배포

1. GitHub에 리포지토리 생성 및 푸시
2. Vercel에서 프로젝트 import
3. 자동 배포 완료

## 사용 방법

1. **새 로스팅 기록 추가**
   - "새 로스팅 기록" 버튼 클릭
   - 원두 정보 입력
   - 타이머 시작
   - 온도별 버튼 클릭으로 시간 기록
   - 배출 버튼으로 로스팅 완료
   - 저장

2. **기록 조회 및 관리**
   - 목록에서 기록 확인
   - 상세 보기로 전체 정보 확인
   - 수정 또는 삭제

3. **자동 계산**
   - 메일라드 반응 시간 (150°C - 180°C)
   - 디벨롭 타임 (183°C - 배출)
   - DTR (Development Time Ratio)
   - 수율 계산

## 라이선스

MIT
