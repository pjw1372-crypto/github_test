"use client";

import { useRef, useState } from "react";
import { AWARDS } from "@/lib/awards";
import { fmtNum, fmtPeriod } from "@/lib/format";
import type { AwardsResult, ParticipantStat } from "@/lib/types";
import SharePanel from "./SharePanel";
import { Stage } from "./ui";

export type LoadSource = "txt" | "link" | "file" | "sample";

interface Props {
  result: AwardsResult | null;
  participants: ParticipantStat[] | null;
  source: LoadSource | null;
  busy: boolean;
  error: string | null;
  onFile: (file: File) => void;
  onSample: () => void;
  onStart: () => void;
  onShowFinal: () => void;
  onReset: () => void;
}

const FORMAT_HINT = [
  "📱 모바일: 채팅방 ≡ 메뉴 → ⚙️ 설정 → 대화 내용 내보내기 → 텍스트만 보내기",
  "💻 PC: 채팅방 ≡ 메뉴 → 대화 내용 → 대화 내보내기 (.txt)",
];

export default function HomeScreen(p: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const pick = (files: FileList | null) => {
    const f = files?.[0];
    if (f) p.onFile(f);
  };

  return (
    <Stage>
      <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center px-4 pb-16 pt-12 text-center sm:pt-20">
        <div className="mb-3 text-xs tracking-[0.4em] text-gold-400/80">THE 2026 DANKTALK AWARDS</div>
        <div className="float glow mb-4 text-7xl sm:text-8xl" aria-hidden>
          🏆
        </div>
        <h1 className="font-display gold-text text-5xl leading-tight sm:text-7xl">2026 단톡방 어워즈</h1>
        <p className="mt-4 text-base text-white/80 sm:text-lg">
          올해 단톡방에서 가장 <span className="font-bold text-gold-300">미친 존재감</span>을 보여준 사람은?
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {AWARDS.map((a) => (
            <span key={a.id} className="rounded-full border border-gold-400/30 bg-white/5 px-3 py-1 text-sm text-white/80">
              {a.emoji} {a.title}
            </span>
          ))}
        </div>

        {!p.result && (
          <section className="mt-10 w-full">
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                pick(e.dataTransfer.files);
              }}
              className={`gold-border cursor-pointer rounded-3xl border-dashed px-6 py-10 transition ${
                drag ? "scale-[1.02] bg-gold-400/15" : "bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".txt,.json,text/plain,application/json"
                className="hidden"
                onChange={(e) => {
                  pick(e.target.files);
                  e.target.value = "";
                }}
              />
              {p.busy ? (
                <div className="py-4">
                  <div className="shake mb-3 text-5xl">🧮</div>
                  <div className="font-display text-xl text-gold-300">대화 내용을 샅샅이 뒤지는 중…</div>
                </div>
              ) : (
                <>
                  <div className="mb-3 text-5xl">📂</div>
                  <div className="font-display text-xl text-gold-300 sm:text-2xl">카카오톡 대화 TXT 파일 올리기</div>
                  <p className="mt-2 text-sm text-white/60">여기로 끌어다 놓거나 눌러서 선택하세요</p>
                  <p className="mt-1 text-xs text-white/40">친구에게 받은 결과 파일(.json)도 여기서 열 수 있어요</p>
                </>
              )}
            </div>
            {p.error && (
              <p className="mt-4 rounded-2xl bg-red-500/15 px-4 py-3 text-sm text-red-200">⚠️ {p.error}</p>
            )}
            <div className="mt-5 space-y-1 text-left text-xs leading-relaxed text-white/50">
              {FORMAT_HINT.map((h) => (
                <p key={h}>{h}</p>
              ))}
              <p className="pt-2 text-white/60">
                🔒 대화 파일은 서버로 전송되지 않고 <b className="text-gold-200">내 브라우저 안에서만</b> 분석돼요.
              </p>
            </div>
            <button onClick={p.onSample} className="ghost-btn mt-6 rounded-full px-5 py-2 text-sm">
              🎭 가상 대화로 미리 체험해보기
            </button>
          </section>
        )}

        {p.result && (
          <section className="rise mt-10 w-full space-y-5">
            {(p.source === "link" || p.source === "file") && (
              <div className="rounded-2xl bg-gold-400/10 px-4 py-3 text-sm text-gold-200">
                🎟️ 친구가 공유한 시상식 초대장이 도착했어요!
              </div>
            )}
            {p.source === "sample" && (
              <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/70">
                🎭 가상의 인물로 만든 체험용 대화예요.
              </div>
            )}
            <div className="gold-border rounded-3xl bg-white/[0.03] p-5">
              {p.result.roomName && (
                <div className="mb-3 truncate font-display text-xl text-white">💬 {p.result.roomName}</div>
              )}
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat label="분석 기간" value={fmtPeriod(p.result.period)} small />
                <Stat label="총 메시지" value={`${fmtNum(p.result.totalMessages)}개`} />
                <Stat label="참여자" value={`${fmtNum(p.result.participantCount)}명`} />
              </div>
            </div>

            <button onClick={p.onStart} className="gold-btn w-full rounded-2xl px-6 py-4 text-lg sm:text-xl">
              🎬 시상식 시작하기
            </button>
            <button onClick={p.onShowFinal} className="w-full text-sm text-white/50 underline-offset-4 hover:underline">
              스포 주의! 결과만 바로 보기
            </button>

            {(p.source === "txt" || p.source === "sample") && <SharePanel result={p.result} />}

            {p.participants && (
              <div className="text-left">
                <button
                  onClick={() => setShowDetail((v) => !v)}
                  className="text-sm text-white/50 underline-offset-4 hover:underline"
                >
                  {showDetail ? "▲ 참여자별 집계 닫기" : "▼ 참여자별 집계 보기 (나만 보여요)"}
                </button>
                {showDetail && <DetailTable participants={p.participants} />}
              </div>
            )}

            <button onClick={p.onReset} className="ghost-btn rounded-full px-5 py-2 text-sm">
              ↺ 다른 파일 분석하기
            </button>
          </section>
        )}
        <footer className="mt-auto pt-14 text-xs text-white/30">
          친구들끼리 웃자고 만든 장난 시상식입니다 · 모든 분석은 내 기기에서만
        </footer>
      </main>
    </Stage>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-2xl bg-black/30 px-2 py-3">
      <div className="text-[11px] text-white/50">{label}</div>
      <div className={`mt-1 font-bold text-gold-200 ${small ? "text-[11px] leading-snug sm:text-sm" : "text-lg sm:text-xl"}`}>
        {value}
      </div>
    </div>
  );
}

function DetailTable({ participants }: { participants: ParticipantStat[] }) {
  const cols = [
    { id: "lol", label: "🎮 롤" },
    { id: "yeomisae", label: "💘 여미새" },
    { id: "ilbe", label: "🦅 일베" },
  ];
  return (
    <div className="mt-3 overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full min-w-[480px] text-sm">
        <thead className="bg-white/5 text-xs text-white/60">
          <tr>
            <th className="px-3 py-2 text-left">이름</th>
            <th className="px-3 py-2 text-right">메시지</th>
            {cols.map((c) => (
              <th key={c.id} className="px-3 py-2 text-right">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {participants.map((p) => (
            <tr key={p.name} className="border-t border-white/5">
              <td className="max-w-[140px] truncate px-3 py-2">
                {p.name}
                {p.left && <span className="ml-1 text-xs text-white/40">(퇴장)</span>}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">{fmtNum(p.messages)}</td>
              {cols.map((c) => {
                const k = p.keywordCounts[c.id];
                return (
                  <td key={c.id} className="px-3 py-2 text-right tabular-nums text-white/80">
                    {k.occurrences}
                    <span className="text-xs text-white/40">회/{k.messages}건</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-3 py-2 text-[11px] text-white/40">
        회 = 키워드 실제 등장 횟수(순위 기준) · 건 = 키워드가 포함된 메시지 수
      </p>
    </div>
  );
}
