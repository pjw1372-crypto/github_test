import confetti from "canvas-confetti";

const GOLD = ["#f5c542", "#fde68a", "#fff6c9", "#e2a720", "#ffffff"];
const PARTY = [...GOLD, "#ff4d6d", "#7c5cff", "#2ee6a8"];

/** 수상자 발표 폭죽. grand=true 면 대상용으로 더 길고 화려하게 */
export function celebrate(grand = false): () => void {
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const count = reduce ? 0.3 : 1;
  confetti({ particleCount: Math.round(140 * count), spread: 100, startVelocity: 55, origin: { y: 0.6 }, colors: PARTY, zIndex: 60 });

  const end = Date.now() + (grand ? 4500 : 1600);
  let raf = 0;
  const frame = () => {
    confetti({ particleCount: grand ? 6 : 3, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors: GOLD, zIndex: 60 });
    confetti({ particleCount: grand ? 6 : 3, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors: GOLD, zIndex: 60 });
    if (Date.now() < end) raf = requestAnimationFrame(frame);
  };
  if (!reduce) raf = requestAnimationFrame(frame);

  const timers: ReturnType<typeof setTimeout>[] = [];
  if (grand && !reduce) {
    // 대상: 하늘에서 터지는 불꽃 몇 발 추가
    [500, 1200, 1900, 2600].forEach((t, i) =>
      timers.push(
        setTimeout(
          () =>
            confetti({
              particleCount: 90,
              spread: 360,
              startVelocity: 32,
              gravity: 0.8,
              ticks: 120,
              origin: { x: [0.25, 0.75, 0.5, 0.35][i], y: [0.25, 0.3, 0.2, 0.35][i] },
              colors: PARTY,
              zIndex: 60,
            }),
          t,
        ),
      ),
    );
  }
  return () => {
    cancelAnimationFrame(raf);
    timers.forEach(clearTimeout);
  };
}
