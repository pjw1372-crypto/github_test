"use client";

import { useEffect, useState } from "react";
import { AWARDS } from "@/lib/awards";
import { celebrate } from "@/lib/celebrate";
import { fmtNum, pct } from "@/lib/format";
import type { AwardsResult, ChatExample, RankEntry } from "@/lib/types";
import { ChatBubble, Stage, medal } from "./ui";

export type Phase = "intro" | "drum" | "reveal";

interface Props {
  result: AwardsResult;
  index: number;
  phase: Phase;
  onReveal: () => void;
  onRevealed: () => void;
  onNext: () => void;
  onSkip: () => void;
}

export default function Ceremony({ result, index, phase, onReveal, onRevealed, onNext, onSkip }: Props) {
  const meta = AWARDS[index];
  const award = result.awards.find((a) => a.id === meta.id);
  const ranking = award?.ranking ?? [];
  const winners = ranking.filter((r) => r.rank === 1);
  const isLast = index === AWARDS.length - 1;
  const drumMs = meta.grand ? 4200 : 2700;

  // 두구두구 → 공개
  useEffect(() => {
    if (phase !== "drum") return;
    const t = setTimeout(onRevealed, drumMs);
    return () => clearTimeout(t);
  }, [phase, drumMs, onRevealed]);

  // 폭죽
  useEffect(() => {
    if (phase !== "reveal" || winners.length === 0) return;
    return celebrate(!!meta.grand);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [index, phase]);

  return (
    <Stage spotlight={phase !== "intro"}>
      <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center px-4 pb-16 pt-6 text-center">
        <header className="mb-6 flex w-full items-center justify-between text-xs text-white/50">
          <div className="flex gap-1.5">
            {AWARDS.map((a, i) => (
              <span
                key={a.id}
                className={`h-1.5 rounded-full transition-all ${
                  i < index ? "w-5 bg-gold-500" : i === index ? "w-8 bg-gold-300" : "w-5 bg-white/15"
                }`}
              />
            ))}
          </div>
          <button onClick={onSkip} className="hover:text-white/80">
            결과 바로 보기 ⏭
          </button>
        </header>

        {phase === "intro" && (
          <section key={`intro-${index}`} className="flex w-full flex-1 flex-col items-center justify-center py-6">
            <div className="rise mb-2 text-xs tracking-[0.35em] text-gold-400/80" style={{ animationDelay: "0.05s" }}>
              {meta.grand ? "★ GRAND PRIZE ★" : `AWARD ${index + 1} / ${AWARDS.length}`}
            </div>
            {meta.grand && (
              <div className="rise font-display mb-2 text-2xl text-red-400" style={{ animationDelay: "0.2s" }}>
                🔥 올해의 대상 🔥
              </div>
            )}
            <div className="rise" style={{ animationDelay: "0.3s" }}>
              <div className={`float glow my-4 ${meta.grand ? "text-9xl" : "text-8xl"}`}>{meta.emoji}</div>
            </div>
            <h2
              className={`rise font-display gold-text leading-tight ${meta.grand ? "text-6xl sm:text-8xl" : "text-5xl sm:text-7xl"}`}
              style={{ animationDelay: "0.55s" }}
            >
              {meta.title}
            </h2>
            <p className="rise mt-5 max-w-md text-base text-white/75 sm:text-lg" style={{ animationDelay: "0.9s" }}>
              {meta.intro}
            </p>
            <button
              onClick={onReveal}
              className="rise gold-btn mt-10 rounded-2xl px-10 py-4 text-lg sm:text-xl"
              style={{ animationDelay: "1.3s" }}
            >
              🥁 수상자 공개하기
            </button>
          </section>
        )}

        {phase === "drum" && <Drumroll key={`drum-${index}`} grand={!!meta.grand} ms={drumMs} title={meta.title} />}

        {phase === "reveal" && (
          <section key={`reveal-${index}`} className="w-full">
            <div className="flash pointer-events-none fixed inset-0 z-40 bg-white" aria-hidden />
            <div className="rise text-sm text-gold-300" style={{ animationDelay: "0.05s" }}>
              {meta.emoji} {meta.title}
            </div>

            {winners.length === 0 ? (
              <NoWinner />
            ) : (
              <>
                <div className="mt-4 text-6xl">{meta.grand ? "👑🏆👑" : "👑"}</div>
                <div className="winner-pop mt-2">
                  {winners.length > 1 && <div className="mb-1 text-sm font-bold text-red-300">🎉 공동 수상 🎉</div>}
                  <div
                    className={`font-display gold-text break-all leading-tight ${
                      meta.grand ? "text-6xl sm:text-8xl" : "text-5xl sm:text-7xl"
                    }`}
                  >
                    {winners.map((w) => w.name).join(" & ")}
                  </div>
                </div>
                <p
                  className="rise mx-auto mt-6 max-w-lg font-display text-xl leading-snug text-white sm:text-2xl"
                  style={{ animationDelay: "0.8s" }}
                >
                  “{meta.quote}”
                </p>
                <Record meta={meta} winner={winners[0]} total={result.totalMessages} />
                <Runners ranking={ranking} unit={meta.unit} />
                <Examples
                  title={meta.id === "quiet" ? "🦗 희귀 발언 모음" : "📎 결정적 증거"}
                  items={winners.flatMap((w) => (w.examples ?? []).map((e) => ({ name: w.name, e })))}
                />
              </>
            )}

            {meta.disclaimer && (
              <p className="rise mx-auto mt-8 max-w-lg text-xs leading-relaxed text-white/45" style={{ animationDelay: "2s" }}>
                {meta.disclaimer}
              </p>
            )}

            <button
              onClick={onNext}
              className="rise gold-btn mt-10 rounded-2xl px-10 py-4 text-lg"
              style={{ animationDelay: "2.2s" }}
            >
              {isLast ? "🏆 최종 결과 보기" : "다음 어워즈 ▶"}
            </button>
          </section>
        )}
      </main>
    </Stage>
  );
}

function Drumroll({ grand, ms, title }: { grand: boolean; ms: number; title: string }) {
  const steps = grand ? ["4", "3", "2", "1"] : ["3", "2", "1"];
  const [i, setI] = useState(0);
  useEffect(() => {
    const per = (ms - 300) / steps.length;
    const t = setInterval(() => setI((v) => Math.min(v + 1, steps.length - 1)), per);
    return () => clearInterval(t);
  }, [ms, steps.length]);
  return (
    <section className="flex w-full flex-1 flex-col items-center justify-center py-16">
      <div className="text-sm text-gold-300/80">{title}의 주인공은…</div>
      <div className="shake my-6 font-display text-4xl text-white sm:text-5xl">
        {grand ? "과연 올해의 대상은…!" : "두구두구두구…"}
      </div>
      <div key={i} className="count-pop font-display gold-text text-9xl">
        {steps[i]}
      </div>
      <div className="mt-10 h-1.5 w-56 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full origin-left bg-gradient-to-r from-gold-600 to-gold-200"
          style={{ animation: `drumroll-bar ${ms}ms linear forwards` }}
        />
      </div>
      <div className="mt-6 text-4xl">🥁</div>
    </section>
  );
}

function Record({
  meta,
  winner,
  total,
}: {
  meta: (typeof AWARDS)[number];
  winner: RankEntry;
  total: number;
}) {
  const isQuiet = meta.id === "quiet";
  return (
    <div className="rise gold-border mx-auto mt-8 max-w-md rounded-3xl bg-black/40 px-5 py-5" style={{ animationDelay: "1.2s" }}>
      <div className="text-xs text-white/50">{meta.metric}</div>
      <div className="mt-1 font-display text-5xl text-gold-300">
        {fmtNum(winner.count)}
        <span className="ml-1 text-2xl">{meta.unit}</span>
      </div>
      {isQuiet ? (
        <div className="mt-2 text-sm text-white/60">
          전체 메시지의 <b className="text-gold-200">{pct(winner.count, total)}</b>
          {winner.count === 0 && " · 입장 후 침묵 중 🤐"}
        </div>
      ) : (
        <>
          <div className="mt-2 text-sm text-white/60">
            키워드가 포함된 메시지 <b className="text-gold-200">{fmtNum(winner.messageCount ?? 0)}개</b>
          </div>
          {winner.breakdown && (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {winner.breakdown.slice(0, 6).map((b) => (
                <span key={b.label} className="rounded-full bg-gold-400/15 px-2.5 py-1 text-xs text-gold-50">
                  {b.label} <b>{b.count}</b>
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Runners({ ranking, unit }: { ranking: RankEntry[]; unit: string }) {
  const rest = ranking.filter((r) => r.rank > 1);
  if (rest.length === 0) return null;
  return (
    <div className="rise mx-auto mt-6 max-w-md space-y-2" style={{ animationDelay: "1.5s" }}>
      {rest.map((r) => (
        <div key={r.name} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-2xl">{medal(r.rank)}</span>
            <span className="text-xs text-white/50">{r.rank}위</span>
            <span className="truncate font-bold">{r.name}</span>
          </div>
          <span className="shrink-0 tabular-nums text-gold-200">
            {fmtNum(r.count)}
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

function Examples({ title, items }: { title: string; items: { name: string; e: ChatExample }[] }) {
  if (items.length === 0) return null;
  return (
    <div className="rise mx-auto mt-8 max-w-md text-left" style={{ animationDelay: "1.8s" }}>
      <div className="mb-3 text-center text-sm font-bold text-gold-300">{title}</div>
      <div className="space-y-4 rounded-3xl bg-[#abc1d1]/15 p-4">
        {items.slice(0, 3).map(({ name, e }, i) => (
          <ChatBubble key={i} name={name} example={e} />
        ))}
      </div>
    </div>
  );
}

function NoWinner() {
  return (
    <div className="winner-pop py-10">
      <div className="text-7xl">🕊️</div>
      <div className="font-display mt-4 text-4xl text-white">수상자 없음</div>
      <p className="mt-3 text-white/60">해당 키워드를 쓴 사람이 아무도 없어요. 이 단톡방은 청정구역입니다 ✨</p>
    </div>
  );
}
