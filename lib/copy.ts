/**
 * Child-facing copy strings. DESIGN_SYSTEM.md §1-1 v8 (principle 6) requires that the
 * internal word "세션" never appears in copy the child sees — only easy phrasing like
 * "오늘의 학습" / "오늘 읽기" / "지금 시작하기".
 */

export const greeting = (name: string) => `${name}야, 오늘도 좋은 하루야!`;
export const greetingSub = '지금은 오늘의 학습을 시작할 시간이에요.';

export const todayLearningTitle = '오늘의 학습';

export const dayTypeLabel = {
  reading: '오늘 읽기',
  drawing: '오늘 그림 활동',
} as const;

export const nav = {
  notifications: '알림',
  library: '서재',
  home: '홈',
};
