import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import type { AwardsResult } from "./types";

/**
 * 공유 방식 (서버/DB 없음)
 *  1) 결과 파일(.json) 내보내기 → 친구가 업로드해서 관람
 *  2) 공유 링크: 결과를 압축해 URL의 # 뒤(fragment)에 담는다.
 *     fragment 는 브라우저가 서버로 전송하지 않으므로 Vercel 서버에도 결과가 남지 않는다.
 */

const HASH_KEY = "r=";

export function isAwardsResult(v: unknown): v is AwardsResult {
  if (!v || typeof v !== "object") return false;
  const o = v as Partial<AwardsResult>;
  return (
    o.app === "danktalk-awards" &&
    o.version === 1 &&
    Array.isArray(o.awards) &&
    o.awards.every((a) => a && typeof a.id === "string" && Array.isArray(a.ranking)) &&
    typeof o.totalMessages === "number"
  );
}

/** 예시 문장을 빼고 공유하고 싶을 때 */
export function withoutExamples(r: AwardsResult): AwardsResult {
  return {
    ...r,
    awards: r.awards.map((a) => ({ ...a, ranking: a.ranking.map(({ examples: _e, ...rest }) => rest) })),
  };
}

export function encodeResult(r: AwardsResult): string {
  return compressToEncodedURIComponent(JSON.stringify(r));
}

export function decodeResult(s: string): AwardsResult | null {
  try {
    const json = decompressFromEncodedURIComponent(s);
    if (!json) return null;
    const v = JSON.parse(json);
    return isAwardsResult(v) ? v : null;
  } catch {
    return null;
  }
}

export function buildShareUrl(r: AwardsResult): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#${HASH_KEY}${encodeResult(r)}`;
}

export function readResultFromHash(hash: string): AwardsResult | null {
  const h = hash.replace(/^#/, "");
  if (!h.startsWith(HASH_KEY)) return null;
  return decodeResult(h.slice(HASH_KEY.length));
}

export function parseResultFile(text: string): AwardsResult | null {
  try {
    const v = JSON.parse(text);
    return isAwardsResult(v) ? v : null;
  } catch {
    return null;
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadResultFile(r: AwardsResult) {
  const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
  downloadBlob(blob, `2026-단톡방-어워즈-결과.json`);
}
