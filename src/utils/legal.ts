/**
 * نصوص الصفحات القانونية تُكتب بصيغة نصية بسيطة ليسهل تعديلها دون شيفرة:
 *   ## عنوان بند      ### عنوان فرعي      * عنصر قائمة      1. عنصر مرقّم      وأي سطر آخر فقرة.
 * ما قبل أول «##» مقدّمة. الناتج نصّ خام يُعرض نصّاً (لا HTML) — آمن من الحقن.
 */
export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] };

export type LegalSection = { id: string; n: number; title: string; blocks: LegalBlock[] };
export type LegalDoc = { intro: LegalBlock[]; sections: LegalSection[] };

export function parseLegal(src: string): LegalDoc {
  const intro: LegalBlock[] = [];
  const sections: LegalSection[] = [];
  let target = intro;

  const push = (b: LegalBlock) => {
    const last = target.at(-1);
    if ((b.type === 'ul' || b.type === 'ol') && last?.type === b.type) last.items.push(...b.items);
    else target.push(b);
  };

  for (const raw of src.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('## ')) {
      const n = sections.length + 1;
      sections.push({ id: `s-${n}`, n, title: line.slice(3).trim(), blocks: [] });
      target = sections.at(-1)!.blocks;
    } else if (line.startsWith('### ')) push({ type: 'h', text: line.slice(4).trim() });
    else if (line.startsWith('* ')) push({ type: 'ul', items: [line.slice(2).trim()] });
    else if (/^\d+\.\s/.test(line)) push({ type: 'ol', items: [line.replace(/^\d+\.\s+/, '')] });
    else push({ type: 'p', text: line });
  }
  return { intro, sections };
}
