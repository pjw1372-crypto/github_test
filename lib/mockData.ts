import type { TodayLearning } from './types';

/**
 * Static mock data — no backend integration in scope for this screen.
 * Two ready-made day states so the "오늘의 학습" card's reading/drawing branch can be
 * demoed by swapping which constant `todayLearning` points to.
 */

export const mockReadingDay: TodayLearning = {
  dayType: 'reading',
  ctaLabel: '오늘 읽기 시작하기',
  mascotSpeech: '오늘도 같이 읽어볼까?',
  reading: {
    bookTitle: '나는 커서 어떤 일을 할까?',
    author: '김민지 글·그림',
    progressPercent: 40,
    supportingText: '조금만 더 읽으면 다음 활동으로 넘어가요.',
  },
};

export const mockDrawingDay: TodayLearning = {
  dayType: 'drawing',
  ctaLabel: '오늘 그림 그리기 시작하기',
  mascotSpeech: '오늘은 그림을 그려볼까?',
  drawing: {
    sourceBookTitle: '나는 커서 어떤 일을 할까?',
    supportingText: '이번 주에 읽은 이야기 중 하나를 골라 그려봐요.',
  },
};

export const childName = '지우';

/** Swap to mockDrawingDay to preview the drawing-day branch. */
export const todayLearning: TodayLearning = mockReadingDay;
