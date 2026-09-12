/**
 * "dayType" is the internal name for what PROJECT_BRIEF.md §1-1 calls a 세션(session) —
 * a day's fixed learning slot (3-4x/week, exactly one of which is a drawing day per week).
 * The word must never leak into UI copy (see lib/copy.ts) — this type is for
 * data/props only.
 */
export type DayType = 'reading' | 'drawing';

export interface ReadingDayDetails {
  bookTitle: string;
  author: string;
  /** 0-100. Progress within today's reading, not a weekly/dashboard stat. */
  progressPercent: number;
  supportingText: string;
}

export interface DrawingDayDetails {
  /** The story picked from this week's reading, to be drawn today. */
  sourceBookTitle: string;
  supportingText: string;
}

export interface TodayLearning {
  dayType: DayType;
  ctaLabel: string;
  /** Text shown in 여울's speech bubble next to the mascot. */
  mascotSpeech: string;
  /** Present only when dayType === 'reading'. */
  reading?: ReadingDayDetails;
  /** Present only when dayType === 'drawing'. */
  drawing?: DrawingDayDetails;
}
