import type { Combo, Slot } from './pairing';

const googleUrl = (slots: Slot[]) => {
  const fams = slots
    .filter((s) => s.font.source === 'google')
    .map((s) => `family=${s.font.family.replace(/ /g, '+')}:wght@${s.weight}`);
  return fams.length ? `https://fonts.googleapis.com/css2?${[...new Set(fams)].join('&')}&display=swap` : null;
};

/**
 * مقتطف CSS جاهز للّصق: استيراد Google Fonts للمجانية، وللمدفوعة اسم العائلة وتنبيه الترخيص فقط —
 * لا نوزّع ملفات خطوط مدفوعة.
 */
export function cssSnippet(c: Combo) {
  const slots = [c.heading, c.sub, c.body].filter((s): s is Slot => !!s);
  const url = googleUrl(slots);
  const paid = slots.filter((s) => s.font.tier === 'paid');
  const rule = (sel: string, s: Slot) =>
    `${sel} {\n  font-family: '${s.font.family}', sans-serif;\n  font-weight: ${s.weight};\n}`;
  return [
    url && `@import url('${url}');`,
    ...paid.map((s) => `/* ${s.font.name} خط مدفوع — يحتاج ترخيص ويب من ${s.font.foundry} */`),
    rule('h1, h2', c.heading),
    c.sub && rule('h3, .subtitle', c.sub),
    rule('body, p', c.body),
  ]
    .filter(Boolean)
    .join('\n\n');
}
