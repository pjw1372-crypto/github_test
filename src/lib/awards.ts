import type { AwardId } from "./keywords";

export interface AwardMeta {
  id: AwardId;
  title: string;
  emoji: string;
  quote: string;
  /** 발표 전 소개 멘트 */
  intro: string;
  /** 기록 표시 단위 */
  unit: string;
  /** 기록 설명 (예: "키워드 사용") */
  metric: string;
  /** 마지막 대상(大賞) 연출 여부 */
  grand?: boolean;
  disclaimer?: string;
}

/** 발표 순서 고정: 말 좀 해라 → 롤대남 → 여미새 → 일베(대상) */
export const AWARDS: AwardMeta[] = [
  {
    id: "quiet",
    title: "말 좀 해라 상",
    emoji: "🎤",
    quote: "혹시 단톡방 알림을 꺼놓으셨나요?",
    intro: "존재는 하지만 목소리는 들리지 않았던 그 사람…",
    unit: "개",
    metric: "분석 기간 동안 보낸 메시지",
  },
  {
    id: "lol",
    title: "롤대남 상",
    emoji: "🎮",
    quote: "현실보다 소환사의 협곡에서 더 많은 시간을 보냈습니다.",
    intro: "\"롤 한 판만\"을 외치던 그 목소리, 아직도 귓가에 맴돕니다.",
    unit: "회",
    metric: "롤 관련 키워드",
  },
  {
    id: "yeomisae",
    title: "여미새 상",
    emoji: "💘",
    quote: "그의 모든 대화는 결국 여자 이야기로 귀결되었다.",
    intro: "어떤 주제로 시작해도 결말은 늘 같았던 그 사람…",
    unit: "회",
    metric: "여자 관련 키워드",
  },
  {
    id: "ilbe",
    title: "일베 상",
    emoji: "🦅",
    quote: "인터넷 밈과 정치 이야기만큼은 누구보다 진심이었습니다.",
    intro: "그리고 마지막… 올해의 대상을 발표하겠습니다.",
    unit: "회",
    metric: "정치인 이름·밈 키워드",
    grand: true,
    disclaimer:
      "※ 친구들끼리 즐기는 가상의 유머 시상식입니다. 특정 단어의 사용 횟수만 센 결과이며, 실제 정치 성향이나 특정 커뮤니티 활동 여부와는 아무 관련이 없습니다.",
  },
];

export const AWARD_BY_ID = Object.fromEntries(AWARDS.map((a) => [a.id, a])) as Record<AwardId, AwardMeta>;
