import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '여울 — 오늘의 학습',
  description: 'AI와 번갈아 읽으며 이해력과 독서 습관을 기르는 아이들을 위한 학습 서비스',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/*
          그리운 코코초이툰(여울이 말풍선 전용 폰트)은 웹 CDN이 없어 확정 문서 기준
          Gamja Flower로 임시 대체 중입니다. next/font/google이 아니라 표준 <link>로
          불러오는 이유: 빌드 타임이 아니라 런타임(브라우저)에서 로드되게 하여, 이 실행
          환경의 네트워크 제약이 `next build`/`next dev` 자체를 막지 않도록 하기 위함입니다.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Gamja+Flower&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
