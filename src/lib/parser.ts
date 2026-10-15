/**
 * 카카오톡 "대화 내보내기" TXT 파서.
 *
 * 지원 형식
 *  - PC(Windows):  --------------- 2026년 1월 5일 월요일 ---------------
 *                  [홍길동] [오후 3:24] 메시지
 *  - Android:      2026년 1월 5일 오후 3:24, 홍길동 : 메시지
 *  - iOS / 최신:   2026. 1. 5. 오후 3:24, 홍길동 : 메시지   (24시간 표기 "15:24"도 허용)
 *  - 기타:         2026-01-05 15:24:00, 홍길동 : 메시지
 *
 * 타임스탬프로 시작하지 않는 줄은 직전 메시지의 다음 줄(여러 줄 메시지)로 이어 붙인다.
 * 입장/퇴장/초대/가리기 등 시스템 알림은 메시지에서 제외하고 membership 이벤트로만 기록한다.
 */

export type ChatFormat = "pc" | "mobile" | "unknown";

export interface ChatMessage {
  /** 로컬 시각 기준 ISO 형태 문자열 (YYYY-MM-DDTHH:mm) */
  time: string;
  sender: string;
  text: string;
}

export type MembershipKind = "join" | "leave";

export interface MembershipEvent {
  time: string;
  name: string;
  kind: MembershipKind;
  /** 이벤트 직전까지 파싱된 메시지 수 (순서 비교용) */
  order: number;
}

export interface ParsedChat {
  format: ChatFormat;
  roomName?: string;
  messages: ChatMessage[];
  membership: MembershipEvent[];
  systemCount: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

function toIso(y: number, mo: number, d: number, h: number, mi: number): string {
  return `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}`;
}

function to24h(ampm: string | undefined, hour: number): number {
  if (!ampm) return hour;
  const pm = ampm === "오후" || ampm.toUpperCase() === "PM";
  if (pm) return hour === 12 ? 12 : hour + 12;
  return hour === 12 ? 0 : hour;
}

// ── 정규식 ──────────────────────────────────────────────────────────────
const AMPM = "(오전|오후|AM|PM|am|pm)";

/** PC 날짜 구분선 */
const PC_DATE_RE = /^-{3,}\s*(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일.*?-{3,}\s*$/;
/** PC 메시지 줄: [이름] [오후 3:24] 내용 */
const PC_MSG_RE = new RegExp(`^\\[(.+?)\\]\\s\\[${AMPM}\\s?(\\d{1,2}):(\\d{2})\\]\\s?(.*)$`);

/** 모바일 타임스탬프 접두부 (뒤에 ", " 가 와야 한다) */
const MOBILE_TS_RES: RegExp[] = [
  // 2026년 1월 5일 오후 3:24,
  new RegExp(`^(\\d{4})년\\s*(\\d{1,2})월\\s*(\\d{1,2})일\\s*${AMPM}?\\s*(\\d{1,2}):(\\d{2})(?::\\d{2})?\\s*,\\s?`),
  // 2026. 1. 5. 오후 3:24,   /  2026. 1. 5. 15:24,
  new RegExp(`^(\\d{4})\\.\\s*(\\d{1,2})\\.\\s*(\\d{1,2})\\.?\\s*${AMPM}?\\s*(\\d{1,2}):(\\d{2})(?::\\d{2})?\\s*,\\s?`),
  // 2026-01-05 15:24:00,  /  2026/01/05 오후 3:24,
  new RegExp(`^(\\d{4})[-/](\\d{1,2})[-/](\\d{1,2})\\s+${AMPM}?\\s*(\\d{1,2}):(\\d{2})(?::\\d{2})?\\s*,\\s?`),
];

/** 모바일 날짜 구분선: "2026년 1월 5일 월요일" / "2026. 1. 5. 월요일" */
const MOBILE_DATE_RE =
  /^(\d{4})(?:년\s*|\.\s*)(\d{1,2})(?:월\s*|\.\s*)(\d{1,2})(?:일|\.)\s*[월화수목금토일]요일\s*$/;

/** 헤더 */
const ROOM_HEADER_RE = /^(.+?)\s*(?:님과)?\s*카카오톡 대화\s*$/;
const SAVED_AT_RE = /^저장한 날짜\s*:/;

// ── 시스템 알림 ─────────────────────────────────────────────────────────
const JOIN_RE = /^(.+?)님이 들어왔습니다\.?$/;
const LEAVE_RE = /^(.+?)님이 나갔습니다\.?$/;
const KICK_RE = /^(.+?)님을 내보냈습니다\.?$/;
/** "A님이 B님과 C님을 초대했습니다." / "A님이 B님, C님과 D님을 초대하였습니다." */
const INVITE_RE = /^(.+?)님이 (.+)님을 초대(?:했|하였)습니다\.?$/;

const SYSTEM_PATTERNS: RegExp[] = [
  JOIN_RE,
  LEAVE_RE,
  KICK_RE,
  INVITE_RE,
  /님이 (?:방장|부방장)/,
  /님을 (?:방장|부방장)/,
  /님이 .*(?:가렸|가리기)/,
  /^채팅방 관리자가/,
  /메시지를 가렸습니다\.?$/,
  /운영정책을 위반한 메시지로/,
  /^(?:.+님이 )?채팅방 (?:이름|사진|배경)을? /,
  /^이 채팅방은/,
  /^채팅방을 나갔습니다\.?$/,
  /님이 (?:오픈채팅봇|봇)을/,
];

export function isSystemText(text: string): boolean {
  const t = text.trim();
  return SYSTEM_PATTERNS.some((re) => re.test(t));
}

function splitInvitees(raw: string): string[] {
  // "B님, C님과 D" → [B, C, D]
  return raw
    .split(/님(?:,\s*|과\s+|와\s+)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function membershipFromSystem(text: string): { name: string; kind: MembershipKind }[] {
  const t = text.trim();
  let m: RegExpMatchArray | null;
  if ((m = t.match(INVITE_RE))) return splitInvitees(m[2]).map((name) => ({ name, kind: "join" as const }));
  if ((m = t.match(JOIN_RE))) return [{ name: m[1].trim(), kind: "join" }];
  if ((m = t.match(LEAVE_RE))) return [{ name: m[1].trim(), kind: "leave" }];
  if ((m = t.match(KICK_RE))) return [{ name: m[1].trim(), kind: "leave" }];
  return [];
}

function matchMobileTs(line: string): { iso: string; rest: string } | null {
  for (const re of MOBILE_TS_RES) {
    const m = line.match(re);
    if (m) {
      const [, y, mo, d, ampm, h, mi] = m;
      const iso = toIso(+y, +mo, +d, to24h(ampm, +h), +mi);
      return { iso, rest: line.slice(m[0].length) };
    }
  }
  return null;
}

export function parseKakaoChat(raw: string): ParsedChat {
  const text = raw.replace(/^﻿/, "").normalize("NFC");
  const lines = text.split(/\r\n|\r|\n/);

  const messages: ChatMessage[] = [];
  const membership: MembershipEvent[] = [];
  let systemCount = 0;
  let roomName: string | undefined;
  let pcHits = 0;
  let mobileHits = 0;

  let currentDate: { y: number; mo: number; d: number } | null = null;
  /** 현재 이어붙이기 대상 메시지 (시스템 줄/날짜선 뒤에는 null) */
  let current: ChatMessage | null = null;
  /** 아직 붙이지 않은 빈 줄 개수 (메시지 사이 공백 줄을 내용에 넣지 않기 위함) */
  let pendingBlank = 0;

  const flushTrim = () => {
    if (current) current.text = current.text.replace(/\s+$/, "");
  };

  const addSystem = (time: string, body: string) => {
    systemCount++;
    for (const ev of membershipFromSystem(body)) {
      membership.push({ ...ev, time, order: messages.length });
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 헤더 (첫 몇 줄)
    if (messages.length === 0 && !current && i < 5) {
      const h = line.match(ROOM_HEADER_RE);
      if (h && !roomName) {
        roomName = h[1].trim();
        continue;
      }
      if (SAVED_AT_RE.test(line)) continue;
    }

    if (line.trim() === "") {
      if (current) pendingBlank++;
      continue;
    }

    // PC 날짜선
    let m = line.match(PC_DATE_RE);
    if (m) {
      flushTrim();
      currentDate = { y: +m[1], mo: +m[2], d: +m[3] };
      current = null;
      pendingBlank = 0;
      pcHits++;
      continue;
    }

    // PC 메시지
    m = line.match(PC_MSG_RE);
    if (m && currentDate) {
      flushTrim();
      const [, sender, ampm, h, mi, body] = m;
      const time = toIso(currentDate.y, currentDate.mo, currentDate.d, to24h(ampm, +h), +mi);
      current = { time, sender: sender.trim(), text: body };
      messages.push(current);
      pendingBlank = 0;
      pcHits++;
      continue;
    }

    // 모바일 날짜선
    m = line.match(MOBILE_DATE_RE);
    if (m) {
      flushTrim();
      currentDate = { y: +m[1], mo: +m[2], d: +m[3] };
      current = null;
      pendingBlank = 0;
      continue;
    }

    // 모바일 메시지 / 시스템
    const ts = matchMobileTs(line);
    if (ts) {
      flushTrim();
      pendingBlank = 0;
      mobileHits++;
      const sep = ts.rest.indexOf(" : ");
      // "이름 : 내용" 이면 메시지. 단 앞부분이 "~님이 …" 꼴이면 " : " 가 포함된 시스템 알림으로 본다.
      if (sep > 0 && !/님[이을] /.test(ts.rest.slice(0, sep))) {
        current = { time: ts.iso, sender: ts.rest.slice(0, sep).trim(), text: ts.rest.slice(sep + 3) };
        messages.push(current);
      } else {
        addSystem(ts.iso, ts.rest);
        current = null;
      }
      continue;
    }

    // PC 시스템 알림 (타임스탬프 없이 단독 줄로 나옴)
    if (pcHits > 0 && isSystemText(line)) {
      flushTrim();
      const time = current?.time ?? (currentDate ? toIso(currentDate.y, currentDate.mo, currentDate.d, 0, 0) : "");
      addSystem(time, line);
      current = null;
      pendingBlank = 0;
      continue;
    }

    // 여러 줄 메시지의 이어지는 줄
    if (current) {
      current.text += "\n".repeat(pendingBlank + 1) + line;
      pendingBlank = 0;
    }
    // 첫 메시지 이전의 알 수 없는 줄은 무시
  }
  flushTrim();

  const format: ChatFormat = pcHits === 0 && mobileHits === 0 ? "unknown" : pcHits >= mobileHits ? "pc" : "mobile";
  return { format, roomName, messages, membership, systemCount };
}
