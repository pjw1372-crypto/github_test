"use client";

import { useState } from "react";
import type { AwardsResult } from "@/lib/types";
import { buildShareUrl, downloadResultFile, withoutExamples } from "@/lib/share";

const LONG_URL = 8000;

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export default function SharePanel({ result, compact = false }: { result: AwardsResult; compact?: boolean }) {
  const [includeExamples, setIncludeExamples] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const shared = includeExamples ? result : withoutExamples(result);

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 2500);
  };

  const onLink = async () => {
    const url = buildShareUrl(shared);
    const warn = url.length > LONG_URL ? " (링크가 길어요! 안 열리면 결과 파일로 공유해주세요)" : "";
    if (navigator.share && /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)) {
      try {
        await navigator.share({ title: "2026 단톡방 어워즈 🏆", text: "우리 단톡방 시상식 결과 보러 와라 ㅋㅋ", url });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    flash((await copyText(url)) ? `공유 링크를 복사했어요! 단톡방에 붙여넣기 📋${warn}` : "복사에 실패했어요 😢");
  };

  return (
    <div className={`gold-border rounded-3xl bg-white/[0.03] ${compact ? "p-4" : "p-5"} text-left`}>
      <div className="mb-1 font-display text-lg text-gold-300">📣 친구들에게 공유하기</div>
      <p className="mb-3 text-sm leading-relaxed text-white/60">
        친구들은 TXT 파일 없이 링크나 결과 파일만으로 시상식을 볼 수 있어요. 대화 원본은 공유되지 않고, 순위·횟수
        {includeExamples ? "와 수상자의 채팅 예시(최대 3개)" : ""}만 담겨요.
      </p>
      <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-white/80 select-none">
        <input
          type="checkbox"
          className="h-4 w-4 accent-[#f5c542]"
          checked={includeExamples}
          onChange={(e) => setIncludeExamples(e.target.checked)}
        />
        채팅 예시(증거 자료) 포함하기
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        <button onClick={onLink} className="gold-btn rounded-2xl px-4 py-3 text-sm">
          🔗 공유 링크 만들기
        </button>
        <button onClick={() => downloadResultFile(shared)} className="ghost-btn rounded-2xl px-4 py-3 text-sm font-bold">
          💾 결과 파일(.json) 저장
        </button>
      </div>
      {msg && <p className="mt-3 text-center text-sm text-gold-200">{msg}</p>}
    </div>
  );
}
