# 여울 — 홈 화면

AI 번갈아읽기 학습 서비스 "여울"의 홈 화면 프로토타입입니다. Vite + React + TypeScript + Tailwind(v4) 구성이며, `PROJECT_BRIEF.md`(기능 명세)와 `DESIGN_SYSTEM.md`(디자인 토큰/원칙)를 기준으로 재설계되었습니다.

## 실행

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 타입체크 + 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
```

## 구조

- `src/App.tsx` — 홈 화면 전체 (헤더/단일 내비게이션, "오늘의 학습" 카드, 서재 바로가기, 여울 마스코트, 배경 장식)
- `src/index.css` — 디자인 토큰(CSS 변수)과 전역 스타일

화면 우측 하단의 "🛠 미리보기" 토글은 오늘이 읽기 활동인지 그림 활동인지에 따른 홈 화면 분기를 확인하기 위한 개발용 컨트롤입니다.
