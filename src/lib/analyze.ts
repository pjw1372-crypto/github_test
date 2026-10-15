import { AWARDS } from "./awards";
import { KEYWORD_RULES, type KeywordAwardId } from "./keywords";
import { compileRules, findKeywordMatches, type KeywordMatch } from "./matcher";
import type { ChatMessage, ParsedChat } from "./parser";
import type { AwardResult, AwardsResult, ChatExample, ParticipantStat, RankEntry } from "./types";

const KEYWORD_AWARDS: KeywordAwardId[] = ["lol", "yeomisae", "ilbe"];
export const MAX_RANK = 3;
const MAX_EXAMPLES = 3;
const EXAMPLE_MAX_LEN = 120;

/** 사진/이모티콘/삭제 등 내용이 없는 메시지 (메시지 수에는 포함, 예시에서는 제외) */
const PLACEHOLDER_RE =
  /^(?:사진|사진 \d+장|동영상|이모티콘|\(이모티콘\)|음성메시지|보이스톡.*|페이스톡.*|파일:.*|삭제된 메시지입니다\.?|메시지가 삭제되었습니다\.?|송금.*|.*님에게 송금.*|지도:.*|연락처:.*|라이브톡.*|투표:.*|일정:.*|샵검색:.*)$/;

export interface Analysis {
  result: AwardsResult;
  participants: ParticipantStat[];
}

/**
 * 순위 매기기 (공동 순위: 1, 1, 3 …). maxRank 이하만 반환한다.
 */
export function rankBy<T extends { name: string }>(
  items: T[],
  score: (t: T) => number,
  order: "asc" | "desc",
  maxRank = MAX_RANK,
): (T & { rank: number })[] {
  const sorted = [...items].sort((a, b) => {
    const d = order === "desc" ? score(b) - score(a) : score(a) - score(b);
    return d !== 0 ? d : a.name.localeCompare(b.name, "ko");
  });
  const out: (T & { rank: number })[] = [];
  let rank = 0;
  sorted.forEach((item, idx) => {
    if (idx === 0 || score(item) !== score(sorted[idx - 1])) rank = idx + 1;
    if (rank <= maxRank) out.push({ ...item, rank });
  });
  return out;
}

/** 긴 메시지는 첫 키워드 주변만 잘라 예시로 만든다 */
export function makeExample(msg: ChatMessage, matches: KeywordMatch[]): ChatExample {
  const text = msg.text;
  if (text.length <= EXAMPLE_MAX_LEN) {
    return { time: msg.time, text, ranges: matches.map((m) => [m.start, m.end]) };
  }
  const first = matches[0]?.start ?? 0;
  let from = Math.max(0, first - 30);
  const to = Math.min(text.length, from + EXAMPLE_MAX_LEN);
  from = Math.max(0, to - EXAMPLE_MAX_LEN);
  const prefix = from > 0 ? "…" : "";
  const suffix = to < text.length ? "…" : "";
  const shift = prefix.length - from;
  return {
    time: msg.time,
    text: prefix + text.slice(from, to) + suffix,
    ranges: matches
      .filter((m) => m.start >= from && m.end <= to)
      .map((m) => [m.start + shift, m.end + shift] as [number, number]),
  };
}

function pickExamples(cands: { msg: ChatMessage; matches: KeywordMatch[] }[]): ChatExample[] {
  const seen = new Set<string>();
  const sorted = [...cands].sort(
    (a, b) => b.matches.length - a.matches.length || a.msg.text.length - b.msg.text.length,
  );
  const out: ChatExample[] = [];
  for (const c of sorted) {
    const key = c.msg.text.trim();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(makeExample(c.msg, c.matches));
    if (out.length >= MAX_EXAMPLES) break;
  }
  return out.sort((a, b) => a.time.localeCompare(b.time));
}

export function analyzeChat(chat: ParsedChat): Analysis {
  const { messages } = chat;
  const matchers = Object.fromEntries(
    KEYWORD_AWARDS.map((id) => [id, compileRules(KEYWORD_RULES[id])]),
  ) as Record<KeywordAwardId, ReturnType<typeof compileRules>>;

  interface Acc {
    name: string;
    messages: number;
    lastMsgOrder: number;
    kw: Record<
      KeywordAwardId,
      {
        occurrences: number;
        messages: number;
        byLabel: Map<string, number>;
        hits: { msg: ChatMessage; matches: KeywordMatch[] }[];
      }
    >;
    plain: ChatMessage[];
  }
  const people = new Map<string, Acc>();
  const getAcc = (name: string): Acc => {
    let a = people.get(name);
    if (!a) {
      a = {
        name,
        messages: 0,
        lastMsgOrder: -1,
        kw: Object.fromEntries(
          KEYWORD_AWARDS.map((id) => [id, { occurrences: 0, messages: 0, byLabel: new Map<string, number>(), hits: [] }]),
        ) as unknown as Acc["kw"],
        plain: [],
      };
      people.set(name, a);
    }
    return a;
  };

  messages.forEach((msg, idx) => {
    const acc = getAcc(msg.sender);
    acc.messages++;
    acc.lastMsgOrder = idx + 1;
    const isPlaceholder = PLACEHOLDER_RE.test(msg.text.trim());
    if (!isPlaceholder && msg.text.trim()) acc.plain.push(msg);
    if (isPlaceholder) return;
    for (const id of KEYWORD_AWARDS) {
      const matches = findKeywordMatches(msg.text, matchers[id]);
      if (matches.length === 0) continue;
      const k = acc.kw[id];
      k.occurrences += matches.length;
      k.messages++;
      for (const m of matches) k.byLabel.set(m.label, (k.byLabel.get(m.label) ?? 0) + 1);
      k.hits.push({ msg, matches });
    }
  });

  // 입장/퇴장 이력: 마지막 이벤트가 퇴장(마지막 메시지 이후)이면 현재 멤버가 아닌 것으로 본다.
  const lastEvent = new Map<string, { kind: "join" | "leave"; order: number }>();
  for (const ev of chat.membership) lastEvent.set(ev.name, { kind: ev.kind, order: ev.order });
  for (const [name, ev] of lastEvent) {
    // 입장했지만 한 마디도 안 한 사람도 '말 좀 해라 상' 후보 (메시지 0개)
    if (ev.kind === "join" && !people.has(name)) getAcc(name);
  }
  const hasLeft = (a: Acc) => {
    const ev = lastEvent.get(a.name);
    return !!ev && ev.kind === "leave" && ev.order >= a.lastMsgOrder;
  };

  const all = [...people.values()];
  const senders = all.filter((a) => a.messages > 0);
  const total = messages.length;

  const awards: AwardResult[] = AWARDS.map((meta) => {
    if (meta.id === "quiet") {
      const eligible = all.filter((a) => !hasLeft(a));
      const ranking: RankEntry[] = rankBy(eligible, (a) => a.messages, "asc").map((a) => ({
        rank: a.rank,
        name: a.name,
        count: a.messages,
        totalMessages: a.messages,
        examples:
          a.rank === 1
            ? a.plain.slice(-MAX_EXAMPLES).map((m) => makeExample(m, []))
            : undefined,
      }));
      return { id: meta.id, ranking };
    }
    const id = meta.id as KeywordAwardId;
    const eligible = all.filter((a) => a.kw[id].occurrences > 0);
    const ranking: RankEntry[] = rankBy(eligible, (a) => a.kw[id].occurrences, "desc").map((a) => {
      const k = a.kw[id];
      return {
        rank: a.rank,
        name: a.name,
        count: k.occurrences,
        messageCount: k.messages,
        totalMessages: a.messages,
        breakdown: [...k.byLabel.entries()]
          .map(([label, count]) => ({ label, count }))
          .sort((x, y) => y.count - x.count),
        examples: a.rank === 1 ? pickExamples(k.hits) : undefined,
      };
    });
    return { id, ranking };
  });

  const participants: ParticipantStat[] = all
    .map((a) => ({
      name: a.name,
      messages: a.messages,
      left: hasLeft(a),
      keywordCounts: Object.fromEntries(
        KEYWORD_AWARDS.map((id) => [id, { occurrences: a.kw[id].occurrences, messages: a.kw[id].messages }]),
      ),
    }))
    .sort((a, b) => b.messages - a.messages || a.name.localeCompare(b.name, "ko"));

  const result: AwardsResult = {
    app: "danktalk-awards",
    version: 1,
    roomName: chat.roomName,
    createdAt: new Date().toISOString(),
    period: { start: messages[0]?.time ?? "", end: messages[messages.length - 1]?.time ?? "" },
    totalMessages: total,
    participantCount: senders.length,
    awards,
  };
  return { result, participants };
}
