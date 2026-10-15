"use client";

import { useCallback, useEffect, useState } from "react";
import { analyzeChat } from "@/lib/analyze";
import { AWARDS } from "@/lib/awards";
import { parseKakaoChat } from "@/lib/parser";
import { readTextFile } from "@/lib/readFile";
import { parseResultFile, readResultFromHash } from "@/lib/share";
import type { AwardsResult, ParticipantStat } from "@/lib/types";
import Ceremony, { type Phase } from "./Ceremony";
import FinalScreen from "./FinalScreen";
import HomeScreen, { type LoadSource } from "./HomeScreen";

/**
 * 화면 진행 상태.
 * 시상식 진행(어워즈 번호 + 단계)을 이 한 곳에서 관리하므로,
 * 추후 실시간 동기화(방장 화면 → 친구들 화면)를 붙일 때 이 상태만 주고받으면 된다.
 */
type View = { name: "home" } | { name: "ceremony"; index: number; phase: Phase } | { name: "final" };

export default function AwardsApp() {
  const [view, setView] = useState<View>({ name: "home" });
  const [result, setResult] = useState<AwardsResult | null>(null);
  const [participants, setParticipants] = useState<ParticipantStat[] | null>(null);
  const [source, setSource] = useState<LoadSource | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 공유 링크(#r=...)로 들어온 경우
  useEffect(() => {
    const load = () => {
      const r = readResultFromHash(window.location.hash);
      if (r) {
        setResult(r);
        setParticipants(null);
        setSource("link");
        setView({ name: "home" });
      } else if (window.location.hash.startsWith("#r=")) {
        setError("공유 링크가 손상되었어요. 링크 전체가 복사됐는지 확인해주세요.");
      }
    };
    load();
    window.addEventListener("hashchange", load);
    return () => window.removeEventListener("hashchange", load);
  }, []);

  const loadChatText = useCallback((text: string, src: LoadSource) => {
    const chat = parseKakaoChat(text);
    if (chat.messages.length === 0) {
      setError("대화 메시지를 찾지 못했어요. 카카오톡 '대화 내보내기'로 만든 TXT 파일인지 확인해주세요.");
      return;
    }
    const a = analyzeChat(chat);
    setResult(a.result);
    setParticipants(a.participants);
    setSource(src);
    setError(null);
    if (window.location.hash) history.replaceState(null, "", window.location.pathname);
  }, []);

  const onFile = useCallback(
    async (file: File) => {
      setBusy(true);
      setError(null);
      try {
        // 분석 중 화면이 먼저 그려지도록 한 틱 양보
        await new Promise((r) => setTimeout(r, 50));
        const text = await readTextFile(file);
        if (file.name.toLowerCase().endsWith(".json") || text.trimStart().startsWith("{")) {
          const r = parseResultFile(text);
          if (!r) throw new Error("올바른 어워즈 결과 파일이 아니에요.");
          setResult(r);
          setParticipants(null);
          setSource("file");
          return;
        }
        loadChatText(text, "txt");
      } catch (e) {
        setError((e as Error).message || "파일을 읽지 못했어요.");
      } finally {
        setBusy(false);
      }
    },
    [loadChatText],
  );

  const onSample = useCallback(async () => {
    setBusy(true);
    try {
      const text = await fetch("/samples/sample-pc.txt").then((r) => r.text());
      loadChatText(text, "sample");
    } finally {
      setBusy(false);
    }
  }, [loadChatText]);

  const reset = () => {
    setResult(null);
    setParticipants(null);
    setSource(null);
    setError(null);
    setView({ name: "home" });
    if (window.location.hash) history.replaceState(null, "", window.location.pathname);
  };

  const onRevealed = useCallback(
    () => setView((v) => (v.name === "ceremony" && v.phase === "drum" ? { ...v, phase: "reveal" } : v)),
    [],
  );

  if (view.name === "ceremony" && result) {
    return (
      <Ceremony
        result={result}
        index={view.index}
        phase={view.phase}
        onReveal={() => setView({ ...view, phase: "drum" })}
        onRevealed={onRevealed}
        onNext={() =>
          setView(
            view.index + 1 < AWARDS.length ? { name: "ceremony", index: view.index + 1, phase: "intro" } : { name: "final" },
          )
        }
        onSkip={() => setView({ name: "final" })}
      />
    );
  }

  if (view.name === "final" && result) {
    return (
      <FinalScreen
        result={result}
        canShare={source === "txt" || source === "sample"}
        onReplay={() => setView({ name: "ceremony", index: 0, phase: "intro" })}
        onHome={() => setView({ name: "home" })}
      />
    );
  }

  return (
    <HomeScreen
      result={result}
      participants={participants}
      source={source}
      busy={busy}
      error={error}
      onFile={onFile}
      onSample={onSample}
      onStart={() => setView({ name: "ceremony", index: 0, phase: "intro" })}
      onShowFinal={() => setView({ name: "final" })}
      onReset={reset}
    />
  );
}
