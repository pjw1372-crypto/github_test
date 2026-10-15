import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { analyzeChat, listSenders, rankBy } from "./analyze";
import { detectBots } from "./bots";
import { KEYWORD_RULES } from "./keywords";
import { compileRules, findKeywordMatches } from "./matcher";
import { parseKakaoChat } from "./parser";
import { decodeResult, encodeResult } from "./share";

const count = (id: keyof typeof KEYWORD_RULES, text: string) =>
  findKeywordMatches(text, compileRules(KEYWORD_RULES[id])).length;
const labels = (id: keyof typeof KEYWORD_RULES, text: string) =>
  findKeywordMatches(text, compileRules(KEYWORD_RULES[id])).map((m) => m.label);

const award = (a: ReturnType<typeof analyzeChat>, id: string) => a.result.awards.find((x) => x.id === id)!;

describe("키워드 집계", () => {
  it("한 메시지 안의 반복을 모두 센다", () => {
    expect(count("lol", "롤 롤 롤")).toBe(3);
    expect(count("lol", "롤롤롤")).toBe(3);
    expect(count("yeomisae", "여친 여친 여친")).toBe(3);
  });

  it("같은 의미 표현을 중복 집계하지 않는다", () => {
    expect(labels("yeomisae", "여자친구")).toEqual(["여자친구·여친"]);
    expect(labels("lol", "롤하자")).toEqual(["롤하자"]);
    expect(labels("lol", "롤ㄱ")).toEqual(["롤하자"]);
    expect(labels("ilbe", "노무현")).toEqual(["노무현"]);
  });

  it("단어 일부가 우연히 겹치는 경우는 세지 않는다", () => {
    for (const t of ["롤케이크", "롤러코스터", "컨트롤", "스크롤", "롤모델", "롤렉스", "롤로노아 조로", "트롤"]) {
      expect(count("lol", t), t).toBe(0);
    }
    for (const t of ["참여자", "기여자", "수여자 명단"]) expect(count("yeomisae", t), t).toBe(0);
    expect(count("ilbe", "운지법 연습")).toBe(0);
    expect(count("lol", "듀오링고 했냐")).toBe(0);
  });

  it("조사·어미가 붙은 키워드는 센다", () => {
    expect(count("lol", "롤이나 하자")).toBe(1);
    expect(count("lol", "롤은 못 끊지")).toBe(1);
    expect(count("lol", "ㅋㅋ롤ㄱㄱ")).toBe(1);
    expect(count("lol", "롤드컵 봄?")).toBe(1);
    expect(count("lol", "칼바람이라도 ㄱㄱ")).toBe(1);
    expect(count("yeomisae", "여친이랑 여자 얘기")).toBe(2);
    expect(count("yeomisae", "전여친한테 연락옴")).toBe(1);
    expect(count("ilbe", "노무현 운지 응디 이기야")).toBe(4);
    expect(count("ilbe", "윤석열 이재명 문재인 박근혜 이명박")).toBe(5);
  });
});

describe("순위", () => {
  it("동점자는 공동 순위로 처리하고 3위까지만 반환한다", () => {
    const r = rankBy(
      [
        { name: "가", v: 5 },
        { name: "나", v: 5 },
        { name: "다", v: 3 },
        { name: "라", v: 1 },
      ],
      (x) => x.v,
      "desc",
    );
    expect(r.map((x) => [x.name, x.rank])).toEqual([
      ["가", 1],
      ["나", 1],
      ["다", 3],
    ]);
  });
});

describe("PC 형식", () => {
  const raw = readFileSync(path.join(__dirname, "../../public/samples/sample-pc.txt"), "utf8");
  const chat = parseKakaoChat(raw);
  const a = analyzeChat(chat);

  it("헤더/날짜/시스템 메시지를 분리한다", () => {
    expect(chat.format).toBe("pc");
    expect(chat.roomName).toBe("2026 고딩친구들 6");
    expect(chat.messages).toHaveLength(22);
    expect(chat.systemCount).toBe(2);
    expect(chat.messages[0]).toEqual({ time: "2026-01-02T20:01", sender: "김철수", text: "새해 복 많이 받아라" });
    expect(chat.messages.find((m) => m.time === "2026-03-14T01:15")?.text).toBe(
      "아 여자친구 갖고 싶다\n여사친도 없음\n여자 소개 좀",
    );
    expect(chat.messages.at(-1)?.time).toBe("2026-12-31T23:55");
    expect(chat.messages.find((m) => m.sender === "최지훈" && m.time.endsWith("T12:00"))?.time).toBe(
      "2026-03-14T12:00",
    );
  });

  it("어워즈 수상자", () => {
    expect(a.result.totalMessages).toBe(22);
    expect(a.result.participantCount).toBe(5);
    expect(a.result.period).toEqual({ start: "2026-01-02T20:01", end: "2026-12-31T23:55" });

    const lol = award(a, "lol").ranking;
    // 박민수: 롤하자, 칼바람, 롤×3, 롤은, 솔랭, 듀오, 협곡, 랭크, 롤 ㄱ, 롤하자 = 12
    expect(lol[0]).toMatchObject({ rank: 1, name: "박민수", count: 12, messageCount: 6 });
    expect(lol[1]).toMatchObject({ rank: 2, name: "최지훈", count: 1 });
    expect(lol).toHaveLength(2); // 이영희(롤케이크·컨트롤)는 0회 → 후보 제외
    expect(lol[0].examples!.length).toBeLessThanOrEqual(3);

    const ye = award(a, "yeomisae").ranking;
    // 최지훈: 소개팅, 여자, 여친, 여자친구, 여사친, 여자, 여친×3, 여자친구 = 10
    expect(ye).toEqual([expect.objectContaining({ rank: 1, name: "최지훈", count: 10, messageCount: 5 })]);

    const ilbe = award(a, "ilbe").ranking;
    expect(ilbe).toEqual([expect.objectContaining({ rank: 1, name: "김철수", count: 9 })]); // 운지법 제외

    const quiet = award(a, "quiet").ranking;
    expect(quiet[0]).toMatchObject({ rank: 1, name: "정다은", count: 2 });
    expect(quiet[1]).toMatchObject({ rank: 2, name: "김철수", count: 4 });
    expect(quiet.some((q) => q.name === "홍길동")).toBe(false); // 나간 사람
    // 사진 메시지는 예시에서 제외
    expect(quiet[0].examples!.map((e) => e.text)).toEqual(["다들 잘 자"]);
  });

  it("예시의 강조 범위가 키워드를 가리킨다", () => {
    const ex = award(a, "lol").ranking[0].examples!;
    for (const e of ex) for (const [s, t] of e.ranges) expect(e.text.slice(s, t)).toMatch(/롤|칼바람|솔랭|듀오|협곡|랭크/);
  });

  it("공유 링크 인코딩 왕복", () => {
    expect(decodeResult(encodeResult(a.result))).toEqual(a.result);
  });
});

describe("모바일 형식", () => {
  it("Android (년 월 일 오전/오후)", () => {
    const raw = [
      "고딩친구들 님과 카카오톡 대화",
      "저장한 날짜 : 2026. 12. 31. 오후 11:59",
      "",
      "",
      "2026년 1월 5일 월요일",
      "2026년 1월 5일 오전 12:03, 김철수님이 이영희님, 박민수님과 정다은님을 초대했습니다.",
      "2026년 1월 5일 오전 12:04, 김철수 : 롤 ㄱ?",
      "2026년 1월 5일 오후 12:30, 이영희 : 점심",
      "뭐 먹지",
      "",
      "2026년 1월 6일 화요일",
      "2026년 1월 6일 오후 1:05, 박민수 : 여친 생김",
      "2026년 1월 6일 오후 1:06, 박민수님이 나갔습니다.",
    ].join("\r\n");
    const chat = parseKakaoChat(raw);
    expect(chat.format).toBe("mobile");
    expect(chat.messages).toEqual([
      { time: "2026-01-05T00:04", sender: "김철수", text: "롤 ㄱ?" },
      { time: "2026-01-05T12:30", sender: "이영희", text: "점심\n뭐 먹지" },
      { time: "2026-01-06T13:05", sender: "박민수", text: "여친 생김" },
    ]);
    expect(chat.membership.map((e) => [e.name, e.kind])).toEqual([
      ["이영희", "join"],
      ["박민수", "join"],
      ["정다은", "join"],
      ["박민수", "leave"],
    ]);
    const a = analyzeChat(chat);
    const quiet = award(a, "quiet").ranking;
    // 정다은: 초대됐지만 0개 → 1위, 박민수는 나가서 제외
    expect(quiet.map((q) => [q.rank, q.name, q.count])).toEqual([
      [1, "정다은", 0],
      [2, "김철수", 1],
      [2, "이영희", 1],
    ]);
    // 나간 사람도 키워드 어워즈는 받을 수 있다
    expect(award(a, "yeomisae").ranking[0]).toMatchObject({ name: "박민수", count: 1 });
  });

  it("iOS (2026. 1. 5. 오후 3:24 / 24시간)", () => {
    const raw = [
      "2026. 1. 5. 월요일",
      "2026. 1. 5. 오후 3:24, 김철수 : 협곡 ㄱ",
      "2026. 1. 5. 15:25, 이 영희 : 시간 : 지금",
      "2026. 1. 5. 오후 3:26, 김철수님이 들어왔습니다.",
    ].join("\n");
    const chat = parseKakaoChat(raw);
    expect(chat.messages).toEqual([
      { time: "2026-01-05T15:24", sender: "김철수", text: "협곡 ㄱ" },
      { time: "2026-01-05T15:25", sender: "이 영희", text: "시간 : 지금" },
    ]);
    expect(chat.systemCount).toBe(1);
  });

  it("인용된 시스템 문구가 있는 일반 메시지는 메시지로 처리", () => {
    const chat = parseKakaoChat("2026년 2월 1일 오후 9:00, 김철수 : 홍길동님이 나갔습니다. ㅋㅋ");
    expect(chat.messages).toHaveLength(1);
    expect(chat.systemCount).toBe(0);
  });
});

describe("봇 제외", () => {
  const raw = [
    "--------------- 2026년 1월 1일 목요일 ---------------",
    "[준호] [오후 1:00] 롤하자",
    "[롤피에스] [오후 1:01] 챔피언 티어리스트(탑) 랭크 롤",
    "[축구봇] [오후 1:02] 안녕하세요 피파봇입니다",
    "[ChatGPT] [오후 1:03] 여자친구에 대해 알려드릴게요",
    "[관상가양반] [오후 1:04] 누가 이 관상가양반을 찾아왔는가?",
    "[영준] [오후 1:05] ㅋㅋ",
    "[영준] [오후 1:06] ㅋㅋㅋ",
  ].join("\n");
  const chat = parseKakaoChat(raw);

  it("이름으로 봇을 추정한다", () => {
    expect(detectBots(listSenders(chat))).toEqual(["롤피에스", "축구봇", "ChatGPT", "관상가양반"]);
  });

  it("제외한 참여자는 메시지 수·후보에서 빠진다", () => {
    const a = analyzeChat(chat, { exclude: detectBots(listSenders(chat)) });
    expect(a.result.totalMessages).toBe(3);
    expect(a.result.participantCount).toBe(2);
    expect(award(a, "quiet").ranking.map((r) => r.name)).toEqual(["준호", "영준"]);
    expect(award(a, "lol").ranking).toEqual([expect.objectContaining({ name: "준호", count: 1 })]);
    expect(award(a, "yeomisae").ranking).toEqual([]);
  });
});
