/**
 * CSV آمن: يقتبس كل خلية، ويُبطل «حقن الصيغ» — خلية تبدأ بـ = + - @ أو Tab/CR
 * قد ينفّذها Excel كصيغة؛ نسبقها بعلامة ' كي تُقرأ نصّاً.
 */
export function csvCell(v: string | number): string {
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replaceAll('"', '""')}"`;
}

export function toCsv(rows: (string | number)[][]): string {
  // BOM كي يفتح Excel العربية صحيحة
  return '﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n');
}
