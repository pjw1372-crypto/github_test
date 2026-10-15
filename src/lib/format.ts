export const fmtNum = (n: number) => n.toLocaleString("ko-KR");

/** "2026-03-14T01:15" → "2026.03.14" */
export const fmtDate = (iso: string) => (iso ? iso.slice(0, 10).replace(/-/g, ".") : "-");

/** "2026-03-14T01:15" → "2026.03.14 01:15" */
export const fmtDateTime = (iso: string) => (iso ? `${fmtDate(iso)} ${iso.slice(11, 16)}` : "");

export const fmtPeriod = (p: { start: string; end: string }) => `${fmtDate(p.start)} ~ ${fmtDate(p.end)}`;

export const pct = (part: number, total: number) =>
  total > 0 ? `${((part / total) * 100).toFixed(part / total < 0.01 ? 2 : 1)}%` : "0%";
