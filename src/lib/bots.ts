/**
 * 사람이 아닌 참여자(카카오톡 채팅방 봇 등) 추정.
 * 이름 기준의 추정일 뿐이므로 화면에서 사용자가 직접 켜고 끌 수 있다.
 */
const BOT_NAME_RE = /봇|bot|gpt|askup|아숙업|피에스|관상가양반|클로바|뤼튼|wrtn|알리미|오픈채팅봇/i;

export function looksLikeBot(name: string): boolean {
  return BOT_NAME_RE.test(name);
}

export function detectBots(names: string[]): string[] {
  return names.filter(looksLikeBot);
}
