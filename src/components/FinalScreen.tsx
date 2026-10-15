"use client";

import { toPng } from "html-to-image";
import { useEffect, useRef, useState } from "react";
import { AWARDS } from "@/lib/awards";
import { celebrate } from "@/lib/celebrate";
import { fmtNum, fmtPeriod } from "@/lib/format";
import type { AwardsResult } from "@/lib/types";
import { downloadBlob } from "@/lib/share";
import SharePanel from "./SharePanel";
import { Stage, medal } from "./ui";

interface Props {
  result: AwardsResult;
  canShare: boolean;
  onReplay: () => void;
  onHome: () => void;
}

export default function FinalScreen({ result, canShare, onReplay, onHome }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    return celebrate(false);
  }, []);

  const savePng = async () => {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#09090c",
        cacheBust: true,
      });
      const blob = await (await fetch(dataUrl)).blob();
      downloadBlob(blob, "2026-단톡방-어워즈.png");
      // 카카오톡 인앱 브라우저 등 다운로드가 막힌 환경을 위해 미리보기도 띄운다
      if (/Android|iPhone|iPad|Mobile|KAKAOTALK/i.test(navigator.userAgent)) setPreview(dataUrl);
    } catch (e) {
      console.error(e);
      alert("이미지 저장에 실패했어요. 화면 캡처를 이용해주세요 🙏");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stage>
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-8">
        <div ref={cardRef} className="rounded-[28px] bg-[#09090c] p-1">
          <div className="gold-border relative overflow-hidden rounded-[26px] bg-[radial-gradient(ellipse_at_top,rgba(245,197,66,0.18),transparent_60%)] px-4 py-7 sm:px-7">
            <div className="text-center">
              <div className="text-[10px] tracking-[0.4em] text-gold-400/80">THE 2026 DANKTALK AWARDS</div>
              <div className="mt-2 text-5xl">🏆</div>
              <h1 className="font-display gold-text mt-2 text-4xl sm:text-5xl">2026 단톡방 어워즈</h1>
              {result.roomName && <div className="mt-2 truncate text-sm text-white/80">💬 {result.roomName}</div>}
              <div className="mt-1 text-xs text-white/50">
                {fmtPeriod(result.period)} · 메시지 {fmtNum(result.totalMessages)}개 · {fmtNum(result.participantCount)}명
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {AWARDS.map((meta) => {
                const ranking = result.awards.find((a) => a.id === meta.id)?.ranking ?? [];
                const winners = ranking.filter((r) => r.rank === 1);
                const rest = ranking.filter((r) => r.rank > 1);
                return (
                  <div
                    key={meta.id}
                    className={`rounded-2xl p-4 ${
                      meta.grand
                        ? "border border-gold-400/60 bg-gradient-to-br from-gold-500/25 to-red-500/10 sm:col-span-3"
                        : "border border-white/10 bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-display text-lg text-gold-200">
                        {meta.emoji} {meta.title}
                      </div>
                      {meta.grand && <span className="rounded-full bg-red-500/80 px-2 py-0.5 text-[10px] font-bold">대상</span>}
                    </div>
                    {winners.length === 0 ? (
                      <div className="mt-3 text-white/50">수상자 없음 🕊️</div>
                    ) : (
                      <div className="mt-3 flex items-end justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[11px] text-white/50">👑 1위{winners.length > 1 ? " (공동)" : ""}</div>
                          <div className="font-display break-all text-2xl leading-tight text-white sm:text-3xl">
                            {winners.map((w) => w.name).join(" & ")}
                          </div>
                        </div>
                        <div className="shrink-0 font-display text-2xl text-gold-300">
                          {fmtNum(winners[0].count)}
                          <span className="text-sm">{meta.unit}</span>
                        </div>
                      </div>
                    )}
                    {rest.length > 0 && (
                      <div className="mt-3 space-y-1 border-t border-white/10 pt-2 text-sm">
                        {rest.map((r) => (
                          <div key={r.name} className="flex justify-between gap-2 text-white/75">
                            <span className="truncate">
                              {medal(r.rank)} {r.name}
                            </span>
                            <span className="shrink-0 tabular-nums text-white/60">
                              {fmtNum(r.count)}
                              {meta.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 text-[11px] text-white/40">“{meta.quote}”</div>
                  </div>
                );
              })}
            </div>
            <p className="mt-5 text-center text-[10px] leading-relaxed text-white/35">
              친구들끼리 즐기는 가상의 유머 시상식입니다. 키워드 사용 횟수만 센 결과로 실제 성향과 무관합니다.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button onClick={savePng} disabled={saving} className="gold-btn rounded-2xl px-4 py-4 text-base">
            {saving ? "이미지 만드는 중…" : "📸 결과 이미지(PNG) 저장"}
          </button>
          <button onClick={onReplay} className="ghost-btn rounded-2xl px-4 py-4 text-base font-bold">
            🔁 처음부터 다시 시상식 보기
          </button>
        </div>

        {canShare && (
          <div className="mt-6">
            <SharePanel result={result} compact />
          </div>
        )}

        <div className="mt-6 text-center">
          <button onClick={onHome} className="text-sm text-white/50 underline-offset-4 hover:underline">
            🏠 처음 화면으로
          </button>
        </div>
      </main>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/85 p-4"
          onClick={() => setPreview(null)}
        >
          <p className="text-center text-sm text-white/80">
            저장이 안 됐다면 이미지를 <b className="text-gold-300">길게 눌러</b> 저장하세요
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="2026 단톡방 어워즈 결과" className="max-h-[75dvh] max-w-full rounded-2xl" />
          <button className="ghost-btn rounded-full px-5 py-2 text-sm">닫기</button>
        </div>
      )}
    </Stage>
  );
}
