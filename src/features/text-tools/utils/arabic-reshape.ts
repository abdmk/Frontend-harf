/**
 * «عكس النص»: يجهّز النص العربي للبرامج التي لا تدعم العربية (After Effects، Premiere، محرّكات الألعاب…).
 * خطوتان مستقلّتان: (1) تشكيل — كل حرف إلى شكله المتّصل (أول/وسط/آخر/منفرد) من «أشكال العرض»
 * في يونيكود، مع لام‑ألف؛ (2) عكس — ترتيب مرئي من اليسار لليمين، مع إبقاء اللاتيني والأرقام
 * على ترتيبها، وقلب الأقواس، والحركات تبقى مع حروفها. دوال نقية بلا مكتبات.
 */

/** [منفرد، آخر، أول، وسط] — حرفان فقط يعنيان أنه لا يتّصل بما بعده */
const FORMS: Record<string, readonly number[]> = {
  ء: [0xfe80],
  آ: [0xfe81, 0xfe82],
  أ: [0xfe83, 0xfe84],
  ؤ: [0xfe85, 0xfe86],
  إ: [0xfe87, 0xfe88],
  ئ: [0xfe89, 0xfe8a, 0xfe8b, 0xfe8c],
  ا: [0xfe8d, 0xfe8e],
  ب: [0xfe8f, 0xfe90, 0xfe91, 0xfe92],
  ة: [0xfe93, 0xfe94],
  ت: [0xfe95, 0xfe96, 0xfe97, 0xfe98],
  ث: [0xfe99, 0xfe9a, 0xfe9b, 0xfe9c],
  ج: [0xfe9d, 0xfe9e, 0xfe9f, 0xfea0],
  ح: [0xfea1, 0xfea2, 0xfea3, 0xfea4],
  خ: [0xfea5, 0xfea6, 0xfea7, 0xfea8],
  د: [0xfea9, 0xfeaa],
  ذ: [0xfeab, 0xfeac],
  ر: [0xfead, 0xfeae],
  ز: [0xfeaf, 0xfeb0],
  س: [0xfeb1, 0xfeb2, 0xfeb3, 0xfeb4],
  ش: [0xfeb5, 0xfeb6, 0xfeb7, 0xfeb8],
  ص: [0xfeb9, 0xfeba, 0xfebb, 0xfebc],
  ض: [0xfebd, 0xfebe, 0xfebf, 0xfec0],
  ط: [0xfec1, 0xfec2, 0xfec3, 0xfec4],
  ظ: [0xfec5, 0xfec6, 0xfec7, 0xfec8],
  ع: [0xfec9, 0xfeca, 0xfecb, 0xfecc],
  غ: [0xfecd, 0xfece, 0xfecf, 0xfed0],
  ف: [0xfed1, 0xfed2, 0xfed3, 0xfed4],
  ق: [0xfed5, 0xfed6, 0xfed7, 0xfed8],
  ك: [0xfed9, 0xfeda, 0xfedb, 0xfedc],
  ل: [0xfedd, 0xfede, 0xfedf, 0xfee0],
  م: [0xfee1, 0xfee2, 0xfee3, 0xfee4],
  ن: [0xfee5, 0xfee6, 0xfee7, 0xfee8],
  ه: [0xfee9, 0xfeea, 0xfeeb, 0xfeec],
  و: [0xfeed, 0xfeee],
  ى: [0xfeef, 0xfef0],
  ي: [0xfef1, 0xfef2, 0xfef3, 0xfef4],
  // فارسي وكردي
  پ: [0xfb56, 0xfb57, 0xfb58, 0xfb59],
  چ: [0xfb7a, 0xfb7b, 0xfb7c, 0xfb7d],
  ژ: [0xfb8a, 0xfb8b],
  ک: [0xfb8e, 0xfb8f, 0xfb90, 0xfb91],
  گ: [0xfb92, 0xfb93, 0xfb94, 0xfb95],
  ی: [0xfbfc, 0xfbfd, 0xfbfe, 0xfbff],
};

/** لام + ألف ← حرف واحد [منفرد، آخر] */
const LAM_ALEF: Record<string, readonly [number, number]> = {
  آ: [0xfef5, 0xfef6],
  أ: [0xfef7, 0xfef8],
  إ: [0xfef9, 0xfefa],
  ا: [0xfefb, 0xfefc],
};

const LAM = 'ل';
const TATWEEL = 'ـ';
/** الحركات والعلامات المركّبة — شفّافة في الاتصال وتلحق حرفها */
const isMark = (c: string) => /[ؐ-ًؚ-ٰٟۖ-ۭ]/.test(c);

const joinsNext = (c: string | undefined) => !!c && (c === TATWEEL || (FORMS[c]?.length ?? 0) === 4);
const joinsPrev = (c: string | undefined) => !!c && (c === TATWEEL || (FORMS[c]?.length ?? 0) >= 2);

/** يحوّل كل حرف عربي إلى شكله المتّصل حسب جيرانه (الترتيب المنطقي يبقى كما هو) */
export function shapeArabic(text: string): string {
  const chars = Array.from(text);
  // أقرب حرف غير حركة قبل/بعد الموضع
  const prev = (i: number) => {
    for (let j = i - 1; j >= 0; j--) if (!isMark(chars[j]!)) return chars[j];
    return undefined;
  };
  const next = (i: number) => {
    for (let j = i + 1; j < chars.length; j++) if (!isMark(chars[j]!)) return chars[j];
    return undefined;
  };

  let out = '';
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]!;
    const forms = FORMS[c];
    if (!forms) {
      out += c;
      continue;
    }
    const p = prev(i);
    const connectPrev = joinsNext(p) && joinsPrev(c);

    // لام‑ألف: تُدمج إن تلت الألفُ اللامَ (مع حركات بينهما أو بلا)
    if (c === LAM) {
      let k = i + 1;
      let marks = '';
      while (k < chars.length && isMark(chars[k]!)) marks += chars[k++];
      const lig = chars[k] ? LAM_ALEF[chars[k]!] : undefined;
      if (lig) {
        out += String.fromCodePoint(lig[connectPrev ? 1 : 0]) + marks;
        i = k;
        continue;
      }
    }

    const connectNext = joinsNext(c) && joinsPrev(next(i));
    const form = connectPrev ? (connectNext ? forms[3] : forms[1]) : connectNext ? forms[2] : forms[0];
    out += String.fromCodePoint(form ?? forms[0]!);
  }
  return out;
}

const MIRROR: Record<string, string> = {
  '(': ')',
  ')': '(',
  '[': ']',
  ']': '[',
  '{': '}',
  '}': '{',
  '<': '>',
  '>': '<',
  '«': '»',
  '»': '«',
};

/** ما يُكتب من اليسار لليمين داخل النص العربي: لاتيني وأرقام (وفواصلها بين رقمين) */
const isLtr = (c: string) => /[A-Za-z0-9٠-٩۰-۹]/.test(c);

/** يعكس سطراً واحداً إلى ترتيب مرئي: عناقيد (حرف + حركاته) تُقلب، والمقاطع اللاتينية/الرقمية تبقى */
function reverseLine(line: string): string {
  const chars = Array.from(line);
  // تجميع: كل حرف أساسي مع حركاته التالية؛ والمقاطع اللاتينية كتلة واحدة
  const units: string[] = [];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]!;
    if (isLtr(c)) {
      let run = c;
      while (i + 1 < chars.length) {
        const n = chars[i + 1]!;
        const bridge = /[.,:%/\-_ ]/.test(n) && chars[i + 2] !== undefined && isLtr(chars[i + 2]!);
        if (isLtr(n) || bridge) run += chars[++i];
        else break;
      }
      units.push(run);
      continue;
    }
    let unit = MIRROR[c] ?? c;
    while (i + 1 < chars.length && isMark(chars[i + 1]!)) unit += chars[++i];
    units.push(unit);
  }
  return units.reverse().join('');
}

/** كل سطر يُعكس وحده، وترتيب الأسطر يبقى */
export function reverseVisual(text: string): string {
  return text.split('\n').map(reverseLine).join('\n');
}

/** يحذف الحركات وعلامات المصحف — كثير من البرامج تضعها في غير موضعها */
export function stripMarks(text: string): string {
  return Array.from(text)
    .filter((c) => !isMark(c))
    .join('');
}

const ZWNJ = '\u200c';

/**
 * محاكاة ما يعرضه برنامج لا يدعم العربية: كل حرف منفصل عن جاره (فاصل ZWNJ يمنع الوصل).
 * الترتيب المنطقي يبقى — يُعرض داخل bidi-override من اليسار لليمين فيظهر مقلوباً كما في البرنامج.
 */
export function simulateBroken(text: string): string {
  return text
    .split('\n')
    .map((line) =>
      Array.from(line)
        .map((c, i, all) => (/[\u0600-\u06ff]/.test(c) && !isMark(all[i + 1] ?? '') ? c + ZWNJ : c))
        .join(''),
    )
    .join('\n');
}

export function prepareArabic(text: string, opts: { shape: boolean; reverse: boolean; strip?: boolean }): string {
  let out = text;
  if (opts.strip) out = stripMarks(out);
  if (opts.shape) out = shapeArabic(out);
  if (opts.reverse) out = reverseVisual(out);
  return out;
}
