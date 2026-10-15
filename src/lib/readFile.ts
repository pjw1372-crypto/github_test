/** 카카오톡 TXT 인코딩 자동 판별 (UTF-8 / UTF-16 / EUC-KR) */
export async function readTextFile(file: File): Promise<string> {
  const buf = new Uint8Array(await file.arrayBuffer());
  if (buf[0] === 0xff && buf[1] === 0xfe) return new TextDecoder("utf-16le").decode(buf);
  if (buf[0] === 0xfe && buf[1] === 0xff) return new TextDecoder("utf-16be").decode(buf);
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    try {
      return new TextDecoder("euc-kr").decode(buf);
    } catch {
      return new TextDecoder("utf-8").decode(buf);
    }
  }
}
