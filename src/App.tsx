import { useState } from "react";

// ── Types ──────────────────────────────────────────────
type NavTab = "home" | "library";
type DayType = "reading" | "drawing";

// ── Data ───────────────────────────────────────────────
const READING_STORY = {
  title: "나는 커서 어떤 일을 할까?",
  author: "지은이 글·그림",
  stepLabel: "1단계 · 동화 읽기",
  pagesRead: 2,
  pagesTotal: 5,
};

const COMPLETED_BOOKS = [
  { id: 1, title: "달님과 토끼", color: "var(--color-accent-mint-tint)", accent: "var(--color-accent-mint)", emoji: "🌙" },
  { id: 2, title: "씨앗이 자라요", color: "var(--color-primary-tint)", accent: "var(--color-cta)", emoji: "🌱" },
  { id: 3, title: "숲속 작은 여우", color: "var(--color-secondary-tint)", accent: "var(--color-secondary)", emoji: "🦊" },
];

// ── Bottom ground / grass decoration (SVG) ──────────────
// Concentrated a little more under the mascot's side (right) so Yeoul
// reads as sitting on an actual patch of ground, not floating in air.
function GrassDecoration() {
  return (
    <svg
      viewBox="0 0 1440 170"
      preserveAspectRatio="xMidYMax slice"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 170, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <ellipse cx="720" cy="185" rx="920" ry="62" fill="#D6F0C8" />

      {/* Left cluster — lighter, sets the ground plane */}
      <path d="M60 140 Q55 100 48 80 Q52 110 65 130Z" fill="#7BC67A" />
      <path d="M75 145 Q68 95 60 70 Q72 108 82 135Z" fill="#5DB55C" />
      <path d="M48 148 Q42 112 35 92 Q44 118 52 142Z" fill="#5DB55C" />
      <circle cx="70" cy="78" r="7" fill="#FF9ED2" />
      <circle cx="70" cy="78" r="3.5" fill="#FFF0F8" />
      <circle cx="56" cy="90" r="5.5" fill="#FFD166" />

      <path d="M300 148 Q294 108 286 88 Q296 116 308 142Z" fill="#7BC67A" />
      <path d="M280 150 Q276 118 268 100 Q278 122 284 146Z" fill="#93D492" />
      <circle cx="298" cy="86" r="6" fill="#FF9ED2" />

      {/* Denser cluster on the right, under/around the mascot */}
      <path d="M980 150 Q972 100 962 74 Q974 110 988 142Z" fill="#7BC67A" />
      <path d="M1010 148 Q1004 96 1014 68 Q1006 104 1014 140Z" fill="#5DB55C" />
      <path d="M955 152 Q949 116 940 96 Q951 120 958 148Z" fill="#93D492" />
      <circle cx="998" cy="80" r="7" fill="#B5ECFF" />
      <circle cx="998" cy="80" r="3.2" fill="#E8F9FF" />

      <path d="M1180 145 Q1173 98 1164 76 Q1170 108 1184 138Z" fill="#7BC67A" />
      <path d="M1200 150 Q1195 105 1204 82 Q1197 112 1203 144Z" fill="#5DB55C" />
      <path d="M1215 146 Q1212 108 1220 88 Q1212 116 1218 142Z" fill="#7BC67A" />
      <circle cx="1192" cy="70" r="7.5" fill="#FFD166" />
      <circle cx="1192" cy="70" r="3.5" fill="#FFF8E0" />

      <path d="M1330 140 Q1325 100 1318 80 Q1322 110 1335 130Z" fill="#7BC67A" />
      <path d="M1345 145 Q1338 95 1330 70 Q1342 108 1352 135Z" fill="#5DB55C" />
      <path d="M1315 148 Q1309 112 1302 92 Q1311 118 1319 142Z" fill="#93D492" />
      <circle cx="1340" cy="60" r="7.5" fill="#FFD166" />
      <circle cx="1320" cy="82" r="5.5" fill="#FF9ED2" />

      <circle cx="150" cy="120" r="3" fill="#FFD166" opacity="0.8" />
      <circle cx="500" cy="128" r="2.5" fill="#FF9ED2" opacity="0.7" />
      <circle cx="750" cy="135" r="2" fill="#B5ECFF" opacity="0.8" />
      <circle cx="1070" cy="118" r="3" fill="#FFD166" opacity="0.75" />
    </svg>
  );
}

// ── SVG icons (line-style, per Icon Tokens §6) ──────────
function BellSvg({ active = false }: { active?: boolean }) {
  const c = active ? "#FFFFFF" : "var(--color-text-secondary)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M6 10C6 7 8.686 5 12 5C15.314 5 18 7 18 10V14L20 16H4L6 14V10Z" stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 19C10 20.105 10.895 21 12 21C13.105 21 14 20.105 14 19" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SearchSvg({ active = false }: { active?: boolean }) {
  const c = active ? "#FFFFFF" : "var(--color-text-secondary)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke={c} strokeWidth="2" />
      <path d="M16.5 16.5L21 21" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HomeSvg({ active = false }: { active?: boolean }) {
  const c = active ? "#FFFFFF" : "var(--color-text-secondary)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3L21 9.5V20C21 20.552 20.552 21 20 21H15V15H9V21H4C3.448 21 3 20.552 3 20V9.5Z" stroke={c} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function LibrarySvg({ active = false }: { active?: boolean }) {
  const c = active ? "#FFFFFF" : "var(--color-text-secondary)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="18" rx="1.5" stroke={c} strokeWidth="2" />
      <rect x="13" y="3" width="8" height="11" rx="1.5" stroke={c} strokeWidth="2" />
      <rect x="13" y="17" width="8" height="4" rx="1.5" stroke={c} strokeWidth="2" />
    </svg>
  );
}

function BookOpenIcon({ color = "var(--color-primary)" }: { color?: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M2 4C2 4 5 3 12 3C19 3 22 4 22 4V20C22 20 19 19 12 19C5 19 2 20 2 20V4Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 3V19" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

function PaintSvg() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.477 2 2 6.477 2 12C2 14 3 15.5 4 16.5C5 17.5 5 18.5 4.5 19.5C4 20.5 4.5 22 6 22C9 22 10 20 12 20C17.523 20 22 16.523 22 12C22 6.477 17.523 2 12 2Z" fill="var(--color-primary-tint)" stroke="var(--color-primary)" strokeWidth="1.6" />
      <circle cx="8" cy="12" r="2" fill="var(--color-accent-mint)" />
      <circle cx="12" cy="8" r="2" fill="var(--color-primary)" />
      <circle cx="16" cy="12" r="2" fill="var(--color-secondary)" />
    </svg>
  );
}

function ChevronRightSvg() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M9 6L15 12L9 18" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Unified top navigation bar ──────────────────────────
// Single navigation system (DESIGN_SYSTEM §1-1 v7 #9): 알림·검색·홈·서재 all
// live in one row, one visual container, one consistent button style —
// no separate "icon button pod" + "tab pod" split.
function NavBar({ activeTab, onChangeTab }: { activeTab: NavTab; onChangeTab: (t: NavTab) => void }) {
  const baseBtn =
    "relative flex flex-col items-center justify-center gap-1 rounded-2xl transition-all hover:scale-[1.04]";
  const baseSize = { width: 68, height: 64 };

  return (
    <div
      className="flex items-center gap-2 p-2 rounded-[26px]"
      style={{
        background: "rgba(253,251,247,0.7)",
        border: "1.5px solid var(--color-surface-border)",
        boxShadow: "var(--shadow-1)",
      }}
      role="navigation"
      aria-label="주요 메뉴"
    >
      <button className={baseBtn} style={{ ...baseSize, background: "transparent" }} aria-label="알림">
        <BellSvg />
        <span className="text-[11px] font-semibold" style={{ color: "var(--color-text-secondary)" }}>알림</span>
        <span
          className="absolute rounded-full"
          style={{ width: 8, height: 8, background: "var(--color-cta)", border: "2px solid var(--color-surface)", top: 6, right: 14 }}
        />
      </button>

      <button className={baseBtn} style={{ ...baseSize, background: "transparent" }} aria-label="검색">
        <SearchSvg />
        <span className="text-[11px] font-semibold" style={{ color: "var(--color-text-secondary)" }}>검색</span>
      </button>

      <div style={{ width: 1.5, height: 36, background: "var(--color-surface-border)" }} />

      <button
        className={baseBtn}
        style={{
          ...baseSize,
          background: activeTab === "home" ? "var(--color-primary)" : "transparent",
          boxShadow: activeTab === "home" ? "0 3px 10px rgba(255,126,103,0.35)" : "none",
        }}
        onClick={() => onChangeTab("home")}
        aria-current={activeTab === "home" ? "page" : undefined}
        aria-label="홈"
      >
        <HomeSvg active={activeTab === "home"} />
        <span className="text-[11px] font-bold" style={{ color: activeTab === "home" ? "#FFFFFF" : "var(--color-text-secondary)" }}>홈</span>
      </button>

      <button
        className={baseBtn}
        style={{
          ...baseSize,
          background: activeTab === "library" ? "var(--color-primary)" : "transparent",
          boxShadow: activeTab === "library" ? "0 3px 10px rgba(255,126,103,0.35)" : "none",
        }}
        onClick={() => onChangeTab("library")}
        aria-current={activeTab === "library" ? "page" : undefined}
        aria-label="서재"
      >
        <LibrarySvg active={activeTab === "library"} />
        <span className="text-[11px] font-bold" style={{ color: activeTab === "library" ? "#FFFFFF" : "var(--color-text-secondary)" }}>서재</span>
      </button>
    </div>
  );
}

// ── "오늘의 학습" — the one strong card on the screen ────
// Wraps both day-type states so there is exactly one card-level
// container (radius/lg + shadow-panel + border) per DESIGN_SYSTEM §1-1 #2.
function TodayLearningCard({ dayType }: { dayType: DayType }) {
  const isReading = dayType === "reading";
  const progressPct = Math.round((READING_STORY.pagesRead / READING_STORY.pagesTotal) * 100);

  return (
    <div
      className="flex flex-col gap-5 p-6 rounded-[24px]"
      style={{
        background: "var(--color-surface)",
        border: "1.5px solid var(--color-surface-border)",
        boxShadow: "var(--shadow-panel)",
        maxWidth: 560,
      }}
    >
      {/* Card header — icon + "오늘의 학습" + status chip (not a pill: informational, not interactive) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: 40, height: 40, background: "var(--color-primary-tint)" }}
          >
            <BookOpenIcon color="var(--color-primary)" />
          </div>
          <h2 className="font-bold" style={{ fontSize: 18, color: "var(--color-text-primary)" }}>
            오늘의 학습
          </h2>
        </div>
        <span
          className="text-xs font-bold px-3 py-1.5 rounded-xl"
          style={{
            background: isReading ? "var(--color-accent-mint-tint)" : "var(--color-secondary-tint)",
            color: isReading ? "var(--color-accent-mint-text)" : "var(--color-secondary-text)",
          }}
        >
          {isReading ? "오늘 읽기" : "오늘 활동"}
        </span>
      </div>

      {isReading ? (
        <div className="flex items-center gap-5">
          {/* Book thumbnail — allowed inside the single Today card per §1-1 #6 */}
          <div
            className="flex-shrink-0 flex flex-col items-center justify-center rounded-2xl gap-1.5"
            style={{
              width: 100,
              height: 122,
              background: "var(--color-accent-mint-tint)",
              border: "2px solid var(--color-accent-mint)",
            }}
          >
            <BookOpenIcon color="var(--color-accent-mint)" />
            <span
              className="text-center leading-snug px-2"
              style={{ fontSize: 10, color: "var(--color-accent-mint-text)", fontWeight: 700 }}
            >
              나는 커서<br />어떤 일을<br />할까?
            </span>
          </div>

          <div className="flex flex-col gap-2.5 flex-1 min-w-0">
            <div className="flex flex-col gap-0.5">
              <h3 className="font-bold leading-snug truncate" style={{ fontSize: 18, color: "var(--color-text-primary)" }}>
                {READING_STORY.title}
              </h3>
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{READING_STORY.author}</span>
            </div>

            {/* Simple progress display — allowed under §9-3 (홈 게이미피케이션 최소), no streaks/levels */}
            <div className="flex flex-col gap-1">
              <div className="w-full rounded-full overflow-hidden" style={{ height: 8, background: "var(--color-surface-border)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${progressPct}%`, background: "var(--color-primary)" }}
                />
              </div>
              <span className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                {READING_STORY.pagesRead} / {READING_STORY.pagesTotal}쪽 · 조금만 더 읽으면 다음 활동으로 넘어가요
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-2xl flex-shrink-0"
              style={{ width: 52, height: 52, background: "var(--color-primary-tint)" }}
            >
              <PaintSvg />
            </div>
            <h3 className="font-bold leading-snug" style={{ fontSize: 17, color: "var(--color-text-primary)" }}>
              이번 주 읽은 이야기로 그림을 그려요
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs flex-shrink-0" style={{ color: "var(--color-text-secondary)" }}>
              이번 주에 읽은 이야기
            </span>
            <div className="flex gap-2">
              {COMPLETED_BOOKS.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center justify-center rounded-xl flex-shrink-0"
                  title={book.title}
                  style={{ width: 42, height: 50, background: book.color, border: `2px solid ${book.accent}` }}
                >
                  <span style={{ fontSize: 19, lineHeight: 1 }}>{book.emoji}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* One Primary action per screen (Button System §7) — flat fill + flat offset shadow, no gradients */}
      <button
        className="flex items-center justify-center gap-2 rounded-full font-bold transition-transform"
        style={{
          height: 52,
          fontSize: 16,
          color: "#FFFFFF",
          background: isReading ? "var(--color-primary)" : "var(--color-secondary)",
          boxShadow: `0 3px 0 ${isReading ? "var(--color-primary-pressed)" : "var(--color-secondary-pressed)"}`,
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(3px)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M5 3L13 8L5 13V3Z" fill="white" />
        </svg>
        {isReading ? "지금 시작하기" : "그림 그리러 가기"}
      </button>
    </div>
  );
}

// ── Lightweight library shortcut — deliberately not a "strong card" ────
// Per §1-1 #1/#2: only the Today card gets radius+shadow+border together;
// this stays a thin divider-bordered row so it doesn't compete with it.
function LibraryShortcutRow({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-5 py-4 rounded-2xl text-left transition-colors hover:bg-white/50"
      style={{ maxWidth: 560, background: "rgba(253,251,247,0.55)", border: "1.5px solid var(--color-surface-border)" }}
    >
      <div
        className="flex items-center justify-center rounded-full flex-shrink-0"
        style={{ width: 36, height: 36, background: "var(--color-secondary-tint)" }}
      >
        <LibrarySvg />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-bold text-sm" style={{ color: "var(--color-text-primary)" }}>내 서재</span>
        <span className="text-xs truncate" style={{ color: "var(--color-text-secondary)" }}>지금까지 읽은 이야기를 확인해보세요</span>
      </div>
      <ChevronRightSvg />
    </button>
  );
}

// ── Yeoul the fox — flat vector / cel-shaded, native transparent SVG ────
// No mix-blend-mode hack needed: unlike a PNG export, this has no
// background box at all. Sized and anchored to sit on the ground,
// with room reserved above/around it for a future speech-bubble swap,
// expression change, or touch interaction (PROJECT_BRIEF §6/§1-1 #7).
function YeoulMascot() {
  return (
    <svg
      viewBox="0 0 300 320"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="여울이 마스코트"
      role="img"
      style={{ width: "100%", maxWidth: 380, height: "auto", display: "block" }}
    >
      {/* tail — base tucks under the body (drawn next) so it reads as attached, not floating */}
      <path
        d="M188 252 C232 262 274 232 278 178 C281 142 250 122 226 140 C250 145 260 172 250 196 C242 218 216 236 188 244 Z"
        fill="#F4914A" stroke="#3D2A1E" strokeWidth="5" strokeLinejoin="round"
      />
      <path d="M258 150 C264 168 258 186 246 200" fill="none" stroke="#FFE9CF" strokeWidth="10" strokeLinecap="round" />

      {/* body, sitting */}
      <path
        d="M96 316 C86 262 96 214 150 200 C204 214 214 262 204 316 Z"
        fill="#F4914A" stroke="#3D2A1E" strokeWidth="5" strokeLinejoin="round"
      />
      {/* belly */}
      <path
        d="M118 314 C112 274 120 236 150 226 C180 236 188 274 182 314 Z"
        fill="#FFF3E0" stroke="#3D2A1E" strokeWidth="4" strokeLinejoin="round"
      />

      {/* feet on the ground */}
      <ellipse cx="122" cy="312" rx="24" ry="14" fill="#FFF3E0" stroke="#3D2A1E" strokeWidth="4" />
      <ellipse cx="178" cy="312" rx="24" ry="14" fill="#FFF3E0" stroke="#3D2A1E" strokeWidth="4" />
      <circle cx="114" cy="313" r="3.4" fill="#FFC9AE" />
      <circle cx="124" cy="316" r="3.4" fill="#FFC9AE" />
      <circle cx="132" cy="313" r="3.4" fill="#FFC9AE" />
      <circle cx="170" cy="313" r="3.4" fill="#FFC9AE" />
      <circle cx="178" cy="316" r="3.4" fill="#FFC9AE" />
      <circle cx="186" cy="313" r="3.4" fill="#FFC9AE" />

      {/* bowtie */}
      <path d="M138 196 L150 208 L138 220 Z" fill="#5A3A24" stroke="#3D2A1E" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M162 196 L150 208 L162 220 Z" fill="#5A3A24" stroke="#3D2A1E" strokeWidth="3.5" strokeLinejoin="round" />
      <circle cx="150" cy="208" r="7" fill="#6B4630" stroke="#3D2A1E" strokeWidth="3" />

      {/* open book held in front, small pencil resting on top */}
      <path
        d="M104 260 C124 250 140 250 150 258 C160 250 176 250 196 260 L196 288 C176 280 160 280 150 288 C140 280 124 280 104 288 Z"
        fill="#3EA0D8" stroke="#3D2A1E" strokeWidth="4" strokeLinejoin="round"
      />
      <path d="M150 258 L150 288" stroke="#3D2A1E" strokeWidth="3" />
      <path d="M112 262 C126 256 136 256 145 262" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <path d="M112 270 C126 264 136 264 145 270" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <path d="M155 262 C164 256 174 256 188 262" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <path d="M155 270 C164 264 174 264 188 270" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <rect x="196" y="238" width="34" height="6.5" rx="3" fill="#FFD166" stroke="#3D2A1E" strokeWidth="2.5" transform="rotate(28 196 238)" />

      {/* arms/paws on the book */}
      <ellipse cx="108" cy="258" rx="13" ry="11" fill="#F4914A" stroke="#3D2A1E" strokeWidth="4" />
      <ellipse cx="192" cy="258" rx="13" ry="11" fill="#F4914A" stroke="#3D2A1E" strokeWidth="4" />

      {/* head */}
      <path d="M96 74 L70 30 L112 52 Z" fill="#F4914A" stroke="#3D2A1E" strokeWidth="5" strokeLinejoin="round" />
      <path d="M96 68 L80 42 L104 55 Z" fill="#FFE9CF" />
      <path d="M204 74 L230 30 L188 52 Z" fill="#F4914A" stroke="#3D2A1E" strokeWidth="5" strokeLinejoin="round" />
      <path d="M204 68 L220 42 L196 55 Z" fill="#FFE9CF" />

      <circle cx="150" cy="110" r="66" fill="#F4914A" stroke="#3D2A1E" strokeWidth="5" />
      <path d="M150 92 C176 92 190 118 182 146 C176 164 124 164 118 146 C110 118 124 92 150 92 Z" fill="#FFF3E0" stroke="#3D2A1E" strokeWidth="3.5" />

      {/* glasses */}
      <circle cx="126" cy="104" r="19" fill="#FFFFFF" fillOpacity="0.55" stroke="#3D2A1E" strokeWidth="4" />
      <circle cx="174" cy="104" r="19" fill="#FFFFFF" fillOpacity="0.55" stroke="#3D2A1E" strokeWidth="4" />
      <path d="M145 104 L155 104" stroke="#3D2A1E" strokeWidth="4" />
      <path d="M107 100 L98 96" stroke="#3D2A1E" strokeWidth="4" strokeLinecap="round" />
      <path d="M193 100 L202 96" stroke="#3D2A1E" strokeWidth="4" strokeLinecap="round" />
      <circle cx="126" cy="104" r="4.5" fill="#3D2A1E" />
      <circle cx="174" cy="104" r="4.5" fill="#3D2A1E" />

      {/* nose + mouth */}
      <ellipse cx="150" cy="132" rx="7" ry="5.5" fill="#3D2A1E" />
      <path d="M150 137 C150 144 158 148 160 144" fill="none" stroke="#3D2A1E" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M150 137 C150 144 142 148 140 144" fill="none" stroke="#3D2A1E" strokeWidth="3.2" strokeLinecap="round" />

      {/* cheeks */}
      <ellipse cx="112" cy="126" rx="8" ry="5" fill="#FFB49A" opacity="0.7" />
      <ellipse cx="188" cy="126" rx="8" ry="5" fill="#FFB49A" opacity="0.7" />
    </svg>
  );
}

// ── App ────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [dayType, setDayType] = useState<DayType>("reading");

  return (
    <div className="bg-canvas flex flex-col relative overflow-hidden" style={{ minHeight: "100vh" }}>
      {/* Ambient warm glow, decorative only */}
      <div
        style={{
          position: "absolute", top: -80, right: -80, width: 420, height: 420, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,210,130,0.22) 0%, transparent 70%)", pointerEvents: "none",
        }}
      />

      {/* ══ Header ══════════════════════════════════════ */}
      <header className="relative z-10 flex items-center justify-between gap-4 flex-wrap px-6 sm:px-10 py-5">
        <button className="flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-colors hover:bg-white/40">
          <div
            className="flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0"
            style={{
              width: 48, height: 48, background: "var(--color-primary-tint)", color: "var(--color-primary-pressed)",
              border: "2.5px solid var(--color-primary)", fontSize: 16, fontWeight: 800,
            }}
          >
            지
          </div>
          <div className="flex flex-col items-start">
            <span className="font-bold text-sm leading-tight" style={{ color: "var(--color-text-primary)" }}>지우</span>
            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>오늘도 함께 읽어요 🙂</span>
          </div>
        </button>

        <NavBar activeTab={activeTab} onChangeTab={setActiveTab} />
      </header>

      {/* ══ Main ════════════════════════════════════════ */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-6 sm:px-10 pb-28 pt-4">
        {activeTab === "home" ? (
          <div className="home-hero-grid flex items-end justify-center gap-16 w-full flex-wrap">
            {/* Left: greeting + the one Today card + minimal library shortcut */}
            <div className="flex flex-col gap-6" style={{ width: "min(560px, 100%)" }}>
              <div className="flex flex-col gap-2">
                <h1
                  className="font-black leading-tight"
                  style={{ fontSize: 34, color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}
                >
                  지우야, 오늘도 멋진 하루야! ☀️
                </h1>
                <p className="text-base font-medium" style={{ color: "var(--color-text-secondary)" }}>
                  {dayType === "reading" ? "지금은 오늘의 학습을 시작할 시간이에요." : "이번 주에 읽은 이야기로 그림을 그려볼까요?"}
                </p>
              </div>

              <TodayLearningCard dayType={dayType} />
              <LibraryShortcutRow onClick={() => setActiveTab("library")} />
            </div>

            {/* Right: Yeoul, anchored on the ground, room reserved for future interaction */}
            <div className="home-hero-mascot-col flex-shrink-0 flex flex-col items-end" style={{ width: "min(380px, 100%)" }}>
              <div
                className="relative font-mascot text-sm px-5 py-3 rounded-[20px] mb-2"
                style={{
                  background: "#FFFDF8", color: "var(--color-text-primary)",
                  border: "2px solid var(--color-surface-border)", boxShadow: "var(--shadow-chip)",
                  marginRight: 28, maxWidth: 230, lineHeight: 1.55,
                }}
              >
                <span style={{ position: "absolute", top: -10, right: 14, fontSize: 16, lineHeight: 1 }}>🩷</span>
                {dayType === "reading" ? "오늘도 열심히 읽어볼까? 지우야!" : "같이 멋진 그림 그려보자, 지우야!"}
                <div
                  style={{
                    position: "absolute", bottom: -11, right: 40, width: 0, height: 0,
                    borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "12px solid #FFFDF8",
                  }}
                />
              </div>
              <YeoulMascot />
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[1360px] mx-auto flex flex-col items-center justify-center flex-1 gap-3" style={{ minHeight: 320 }}>
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 64, height: 64, background: "var(--color-secondary-tint)" }}
            >
              <LibrarySvg />
            </div>
            <p className="font-bold" style={{ fontSize: 18, color: "var(--color-text-primary)" }}>서재는 곧 만나요!</p>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>지금까지 읽은 이야기가 여기에 책으로 모여요.</p>
          </div>
        )}
      </main>

      {/* Ground decoration, sits behind main content */}
      <div className="pointer-events-none" style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 5 }}>
        <GrassDecoration />
      </div>

      {/* Dev-only preview toggle — deliberately tucked away, muted, and clearly
          labeled so it never reads as a child-facing UI element. Kept because
          it demonstrates the reading/drawing CTA branching (PROJECT_BRIEF §1-1). */}
      <div
        className="fixed bottom-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
        style={{ background: "rgba(253,251,247,0.85)", border: "1px dashed var(--color-surface-border)" }}
      >
        <span className="text-[10px]" style={{ color: "var(--color-text-secondary)" }}>🛠 미리보기</span>
        {(["reading", "drawing"] as DayType[]).map((d) => (
          <button
            key={d}
            onClick={() => setDayType(d)}
            className="px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors"
            style={{
              background: dayType === d ? "var(--color-text-secondary)" : "transparent",
              color: dayType === d ? "#FFFFFF" : "var(--color-text-secondary)",
            }}
          >
            {d === "reading" ? "읽기" : "그림"}
          </button>
        ))}
      </div>
    </div>
  );
}
