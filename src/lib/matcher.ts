import type { KeywordRule } from "./keywords";

export interface KeywordMatch {
  start: number;
  end: number;
  label: string;
}

interface CompiledForm {
  form: string;
  label: string;
  start: boolean;
  allowNext?: string;
  denyNext?: string[];
}

export interface CompiledMatcher {
  /** 첫 글자 → 해당 글자로 시작하는 표기들 (긴 것부터) */
  byFirstChar: Map<string, CompiledForm[]>;
}

const isSyllable = (ch: string) => ch >= "가" && ch <= "힣";
/** 단어를 이루는 글자: 한글 음절, 영문, 숫자. (ㅋㅋ, ㄱㄱ 같은 자모와 문장부호는 경계로 본다) */
const isWordChar = (ch: string) => isSyllable(ch) || /[A-Za-z0-9]/.test(ch);

export function compileRules(rules: KeywordRule[]): CompiledMatcher {
  const forms: CompiledForm[] = [];
  for (const r of rules) {
    for (const f of r.forms) {
      forms.push({
        form: f.normalize("NFC").toLowerCase(),
        label: r.label,
        start: r.start ?? true,
        allowNext: r.allowNext,
        denyNext: r.denyNext,
      });
    }
  }
  forms.sort((a, b) => b.form.length - a.form.length);
  const byFirstChar = new Map<string, CompiledForm[]>();
  for (const f of forms) {
    const key = f.form[0];
    if (!byFirstChar.has(key)) byFirstChar.set(key, []);
    byFirstChar.get(key)!.push(f);
  }
  return { byFirstChar };
}

/**
 * 텍스트에서 키워드 등장 위치를 모두 찾는다.
 * 겹치는 매칭은 허용하지 않으며(긴 표기 우선), 등장할 때마다 1회로 센다.
 */
export function findKeywordMatches(rawText: string, matcher: CompiledMatcher): KeywordMatch[] {
  const text = rawText.toLowerCase();
  const out: KeywordMatch[] = [];
  let lastEnd = -1;
  let i = 0;
  while (i < text.length) {
    const candidates = matcher.byFirstChar.get(text[i]);
    let hit: CompiledForm | undefined;
    if (candidates) {
      for (const c of candidates) {
        if (!text.startsWith(c.form, i)) continue;
        if (c.start && i > 0 && lastEnd !== i && isWordChar(text[i - 1])) continue;
        const nextIdx = i + c.form.length;
        const next = text[nextIdx];
        if (c.allowNext && next && isSyllable(next) && !c.allowNext.includes(next)) continue;
        if (c.denyNext && c.denyNext.some((d) => text.startsWith(d, nextIdx))) continue;
        hit = c;
        break;
      }
    }
    if (hit) {
      const end = i + hit.form.length;
      out.push({ start: i, end, label: hit.label });
      lastEnd = end;
      i = end;
    } else {
      i++;
    }
  }
  return out;
}
