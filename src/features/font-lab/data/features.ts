/**
 * ميزات OpenType بأسماء عربية مفهومة. «engine»: يديرها محرّك التشكيل تلقائياً للعربية
 * (لا معنى لإطفائها في المعاينة). «on»: مفعّلة افتراضياً في المتصفّحات ويمكن إطفاؤها.
 * البقية اختيارية: مطفأة افتراضياً ويشغّلها المصمّم.
 */
type Info = { label: string; mode?: 'engine' | 'on' };

const FEATURES: Record<string, Info> = {
  isol: { label: 'الشكل المنفرد', mode: 'engine' },
  init: { label: 'الشكل المبتدئ', mode: 'engine' },
  medi: { label: 'الشكل المتوسّط', mode: 'engine' },
  fina: { label: 'الشكل المنتهي', mode: 'engine' },
  med2: { label: 'شكل متوسّط ثانٍ (سريانية)', mode: 'engine' },
  fin2: { label: 'شكل منتهٍ ثانٍ', mode: 'engine' },
  fin3: { label: 'شكل منتهٍ ثالث', mode: 'engine' },
  rvrn: { label: 'بدائل المحاور المتغيّرة', mode: 'engine' },
  ccmp: { label: 'تركيب وتفكيك المحارف', mode: 'on' },
  rlig: { label: 'ربطات لازمة', mode: 'on' },
  rclt: { label: 'بدائل سياقية لازمة', mode: 'on' },
  calt: { label: 'بدائل سياقية', mode: 'on' },
  liga: { label: 'الربطات القياسية', mode: 'on' },
  clig: { label: 'ربطات سياقية', mode: 'on' },
  kern: { label: 'التقنين بين الأزواج', mode: 'on' },
  mark: { label: 'مواضع العلامات', mode: 'on' },
  mkmk: { label: 'تراكب العلامات', mode: 'on' },
  curs: { label: 'الوصل المتّصل (كاشيدا)', mode: 'on' },
  locl: { label: 'أشكال محلّية حسب اللغة', mode: 'on' },
  rtlm: { label: 'مرايا الاتجاه من اليمين', mode: 'on' },
  dlig: { label: 'ربطات اختيارية' },
  aalt: { label: 'بدائل الحرف كاملة' },
  salt: { label: 'بدائل أسلوبية' },
  swsh: { label: 'أشكال مزخرفة (سواش)' },
  stch: { label: 'تمديد الحروف' },
  case: { label: 'أشكال للحروف الكبيرة' },
  cpsp: { label: 'تباعد الحروف الكبيرة' },
  frac: { label: 'الكسور' },
  numr: { label: 'بسط الكسر' },
  dnom: { label: 'مقام الكسر' },
  lnum: { label: 'أرقام صفّية' },
  onum: { label: 'أرقام قديمة' },
  pnum: { label: 'أرقام متناسبة' },
  tnum: { label: 'أرقام جدولية' },
  zero: { label: 'صفر مشطوب' },
  ordn: { label: 'لواحق ترتيبية' },
  sinf: { label: 'أرقام سفلية علمية' },
  subs: { label: 'أرقام تحتية' },
  sups: { label: 'أرقام فوقية' },
  smcp: { label: 'حروف صغيرة' },
  c2sc: { label: 'كبيرة إلى صغيرة' },
  hist: { label: 'أشكال تاريخية' },
  mset: { label: 'مواضع العلامات (قديمة)' },
};

export function featureInfo(tag: string): Info {
  if (FEATURES[tag]) return FEATURES[tag];
  const ss = /^ss(\d\d)$/.exec(tag);
  if (ss) return { label: `مجموعة أسلوبية ${Number(ss[1]).toLocaleString('ar')}` };
  const cv = /^cv(\d\d)$/.exec(tag);
  if (cv) return { label: `بديل حرف ${Number(cv[1]).toLocaleString('ar')}` };
  return { label: 'ميزة خاصة' };
}

/** الحالة الفعلية لميزة: ما اختاره المستخدم، وإلا افتراضيها */
export function featureOn(tag: string, state: Record<string, boolean>) {
  const mode = featureInfo(tag).mode;
  if (mode === 'engine') return true;
  return state[tag] ?? mode === 'on';
}

/** قيمة font-feature-settings — تذكر فقط ما يخالف الافتراضي */
export function featureSettings(tags: string[], state: Record<string, boolean>) {
  const parts = tags
    .filter((t) => featureInfo(t).mode !== 'engine' && t in state)
    .filter((t) => state[t] !== (featureInfo(t).mode === 'on'))
    .map((t) => `"${t}" ${state[t] ? 1 : 0}`);
  return parts.length ? parts.join(', ') : 'normal';
}
