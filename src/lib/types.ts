import type { AwardId } from "./keywords";

/** 채팅 예시. ranges 는 강조할 키워드 위치 [start, end) */
export interface ChatExample {
  time: string;
  text: string;
  ranges: [number, number][];
}

export interface RankEntry {
  rank: number;
  name: string;
  /** 순위 기준 값: 키워드 어워즈는 실제 등장 횟수, 말 좀 해라 상은 메시지 수 */
  count: number;
  /** 키워드가 포함된 메시지 수 (키워드 어워즈만) */
  messageCount?: number;
  /** 전체 메시지 수 */
  totalMessages: number;
  /** 대표 키워드별 등장 횟수 (많은 순) */
  breakdown?: { label: string; count: number }[];
  /** 1위에게만 채운다 */
  examples?: ChatExample[];
}

export interface AwardResult {
  id: AwardId;
  ranking: RankEntry[];
}

/** 공유(파일/링크)되는 결과. 원본 대화는 포함하지 않는다. */
export interface AwardsResult {
  app: "danktalk-awards";
  version: 1;
  roomName?: string;
  createdAt: string;
  period: { start: string; end: string };
  totalMessages: number;
  participantCount: number;
  awards: AwardResult[];
}

/** 로컬 화면에서만 쓰는 참여자별 상세 통계 (공유 파일에는 넣지 않음) */
export interface ParticipantStat {
  name: string;
  messages: number;
  keywordCounts: Record<string, { occurrences: number; messages: number }>;
  left: boolean;
}
