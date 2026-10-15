"use client";

import type { ReactNode } from "react";
import type { ChatExample } from "@/lib/types";
import { fmtDateTime } from "@/lib/format";

/** 어두운 무대 + 스포트라이트 배경 */
export function Stage({ children, spotlight = false }: { children: ReactNode; spotlight?: boolean }) {
  return (
    <div className="stage-bg relative min-h-dvh overflow-hidden">
      <div className="sparkles pointer-events-none absolute inset-0" aria-hidden />
      <div className="spotlight spotlight-left" aria-hidden />
      <div className="spotlight spotlight-right" aria-hidden />
      <div className={`spotlight spotlight-center ${spotlight ? "on" : ""}`} aria-hidden />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/** 키워드 부분을 강조해서 보여준다 */
export function Highlighted({ example, markClass = "kw" }: { example: ChatExample; markClass?: string }) {
  const { text, ranges } = example;
  const parts: ReactNode[] = [];
  let cur = 0;
  [...ranges]
    .sort((a, b) => a[0] - b[0])
    .forEach(([s, e], i) => {
      if (s < cur) return;
      if (s > cur) parts.push(text.slice(cur, s));
      parts.push(
        <mark key={i} className={markClass}>
          {text.slice(s, e)}
        </mark>,
      );
      cur = e;
    });
  if (cur < text.length) parts.push(text.slice(cur));
  return <>{parts}</>;
}

export function ChatBubble({ name, example }: { name: string; example: ChatExample }) {
  return (
    <div className="flex items-start gap-2.5 text-left">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gold-400/15 text-base">
        🗨️
      </div>
      <div className="min-w-0">
        <div className="mb-1 text-xs text-white/50">
          <span className="font-semibold text-white/80">{name}</span> · {fmtDateTime(example.time)}
        </div>
        <div className="inline-block max-w-full whitespace-pre-wrap break-words rounded-2xl rounded-tl-sm bg-[#fee500] px-3.5 py-2 text-[15px] leading-relaxed text-black/90">
          <Highlighted example={example} markClass="kw kw-bubble" />
        </div>
      </div>
    </div>
  );
}

export const MEDALS = ["🥇", "🥈", "🥉"];
export const medal = (rank: number) => MEDALS[rank - 1] ?? "🏅";
