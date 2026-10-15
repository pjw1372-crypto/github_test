/**
 * 어워즈별 키워드 사전.
 *
 * 집계 규칙 (matcher.ts 참고)
 *  - 메시지 안에서 "실제 등장 횟수"를 센다. "롤 롤 롤" → 롤 3회.
 *  - 긴 표현을 먼저 매칭하고 그 구간은 소비한다 → "여자친구"는 여자친구 1회 (여자 +1 중복 없음).
 *  - start(기본 true): 단어의 시작에서만 매칭한다 → "참여자"의 "여자", "컨트롤"의 "롤"은 제외.
 *    단, 같은 키워드가 붙어서 반복되는 경우("롤롤롤")는 연속 매칭을 허용한다.
 *  - allowNext: 키워드 바로 뒤에 한글 음절이 붙으면 이 목록에 있는 음절만 허용한다.
 *    ("롤이랑", "롤하자" 허용 / "롤케이크", "롤러코스터", "롤모델" 제외)
 *  - denyNext: 키워드 뒤에 이어지면 매칭하지 않는 문자열 ("운지법", "듀오링고" 제외)
 *  - 친구 이름과 겹칠 수 있는 애칭("재명이", "석열이" 등)은 일부러 넣지 않았다.
 */

export type AwardId = "quiet" | "lol" | "yeomisae" | "ilbe";
export type KeywordAwardId = Exclude<AwardId, "quiet">;

export interface KeywordRule {
  /** 집계/표시용 대표 키워드 (같은 의미의 표현은 하나로 묶는다) */
  label: string;
  /** 실제로 찾을 표기들 */
  forms: string[];
  start?: boolean;
  allowNext?: string;
  denyNext?: string[];
}

/** 조사·어미 및 롤 관련 합성어의 첫 음절 */
const LOL_ALLOW_NEXT =
  "이은을는가도만에으로와과랑나하할함해했한합좀판창게겜계접친각티랭체토드챔롤고대유충중";

export const KEYWORD_RULES: Record<KeywordAwardId, KeywordRule[]> = {
  yeomisae: [
    { label: "여자친구·여친", forms: ["여자친구", "여친", "전여친", "구여친", "전여자친구", "구여자친구"] },
    { label: "여사친", forms: ["여사친"] },
    { label: "여자", forms: ["여자"] },
    { label: "소개팅", forms: ["소개팅"], start: false },
    { label: "썸녀", forms: ["썸녀"], start: false },
  ],
  lol: [
    { label: "롤하자", forms: ["롤하자", "롤ㄱ", "롤 ㄱ"] },
    { label: "롤", forms: ["롤"], allowNext: LOL_ALLOW_NEXT, denyNext: ["로노아"] },
    { label: "게임하자", forms: ["게임하자", "겜하자", "게임ㄱ", "겜ㄱ"] },
    { label: "솔랭", forms: ["솔랭", "솔로랭크"], start: false },
    { label: "자랭", forms: ["자랭", "자유랭크"] },
    { label: "듀오", forms: ["듀오"], denyNext: ["링고"] },
    { label: "랭크", forms: ["랭크", "랭겜"], denyNext: ["뉴스"] },
    { label: "칼바람", forms: ["칼바람"], start: false },
    { label: "협곡", forms: ["협곡"], start: false },
    { label: "소환사", forms: ["소환사"], start: false },
    { label: "리그오브레전드", forms: ["리그오브레전드", "리그 오브 레전드"], start: false },
  ],
  ilbe: [
    { label: "운지", forms: ["운지"], denyNext: ["법"] },
    { label: "응디", forms: ["응디"] },
    { label: "이기야", forms: ["이기야"], start: false, denyNext: ["지", "겠"] },
    { label: "부엉이바위", forms: ["부엉이바위", "부엉이 바위"], start: false },
    { label: "노무현", forms: ["노무현", "노무노무"], start: false },
    { label: "이명박", forms: ["이명박", "쥐명박"], start: false },
    { label: "박근혜", forms: ["박근혜", "닭근혜"], start: false },
    { label: "문재인", forms: ["문재인", "문재앙"], start: false },
    { label: "윤석열", forms: ["윤석열"], start: false },
    { label: "윤석열", forms: ["윤통"] },
    { label: "이재명", forms: ["이재명", "찢재명"], start: false },
    { label: "이승만", forms: ["이승만"], start: false },
    { label: "박정희", forms: ["박정희"], start: false },
    { label: "전두환", forms: ["전두환"], start: false },
    { label: "노태우", forms: ["노태우"], start: false },
    { label: "김영삼", forms: ["김영삼"], start: false },
    { label: "김대중", forms: ["김대중"], start: false },
    { label: "한동훈", forms: ["한동훈"], start: false },
    { label: "이준석", forms: ["이준석"], start: false },
    { label: "홍준표", forms: ["홍준표"], start: false },
  ],
};
