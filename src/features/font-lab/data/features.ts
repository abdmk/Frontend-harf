/**
 * ميزات OpenType بأسماء عربية مفهومة. «engine»: يديرها محرّك التشكيل تلقائياً للعربية
 * (لا معنى لإطفائها في المعاينة). «on»: مفعّلة افتراضياً في المتصفّحات ويمكن إطفاؤها.
 * البقية اختيارية: مطفأة افتراضياً ويشغّلها المصمّم.
 */
type Info = { label: string; mode?: 'engine' | 'on'; /** ما تفعله بلغة المصمّم — سطر واحد */ hint?: string };

const FEATURES: Record<string, Info> = {
  isol: { label: 'الشكل المنفرد', mode: 'engine' },
  init: { label: 'الشكل المبتدئ', mode: 'engine' },
  medi: { label: 'الشكل المتوسّط', mode: 'engine' },
  fina: { label: 'الشكل المنتهي', mode: 'engine' },
  med2: { label: 'شكل متوسّط ثانٍ (سريانية)', mode: 'engine' },
  fin2: { label: 'شكل منتهٍ ثانٍ', mode: 'engine' },
  fin3: { label: 'شكل منتهٍ ثالث', mode: 'engine' },
  rvrn: { label: 'بدائل المحاور المتغيّرة', mode: 'engine' },
  ccmp: { label: 'تركيب وتفكيك المحارف', mode: 'on', hint: 'يركّب الحرف مع علامته في محرف واحد' },
  rlig: { label: 'ربطات لازمة', mode: 'on', hint: 'ربطات لا يصحّ النص بدونها، مثل «لا»' },
  rclt: { label: 'بدائل سياقية لازمة', mode: 'on', hint: 'بدائل يحتاجها النص ليُقرأ صحيحاً' },
  calt: { label: 'بدائل سياقية', mode: 'on', hint: 'يغيّر شكل الحرف حسب الحروف المجاورة' },
  liga: { label: 'الربطات القياسية', mode: 'on', hint: 'يدمج حروفاً متتابعة في شكل واحد' },
  clig: { label: 'ربطات سياقية', mode: 'on', hint: 'ربطات تظهر في سياقات محدّدة' },
  kern: { label: 'التقنين بين الأزواج', mode: 'on', hint: 'يضبط المسافة بين أزواج الحروف' },
  mark: { label: 'مواضع العلامات', mode: 'on', hint: 'يضع الحركات فوق الحروف وتحتها' },
  mkmk: { label: 'تراكب العلامات', mode: 'on', hint: 'يرصّ الحركات المتراكبة، كالشدّة مع الفتحة' },
  curs: { label: 'الوصل المتّصل (كاشيدا)', mode: 'on', hint: 'يصل الحروف المتّصلة بدقّة' },
  locl: { label: 'أشكال محلّية حسب اللغة', mode: 'on', hint: 'أشكال تتغيّر بلغة النص (فارسية، أردية…)' },
  rtlm: { label: 'مرايا الاتجاه من اليمين', mode: 'on' },
  dlig: { label: 'ربطات اختيارية', hint: 'ربطات زخرفية يختار المصمّم إظهارها' },
  aalt: { label: 'بدائل الحرف كاملة', hint: 'يعرض كل بدائل الحرف المتاحة' },
  salt: { label: 'بدائل أسلوبية', hint: 'يبدّل الحروف بأشكال بديلة' },
  swsh: { label: 'أشكال مزخرفة (سواش)', hint: 'أشكال ممدودة مزخرفة للحروف' },
  stch: { label: 'تمديد الحروف', hint: 'يمدّ الحروف لملء السطر' },
  case: { label: 'أشكال للحروف الكبيرة', hint: 'يرفع الترقيم ليناسب الحروف الكبيرة' },
  cpsp: { label: 'تباعد الحروف الكبيرة', hint: 'يفسح بين الحروف الكبيرة' },
  frac: { label: 'الكسور', hint: 'يحوّل ١/٢ إلى كسر حقيقي' },
  numr: { label: 'بسط الكسر' },
  dnom: { label: 'مقام الكسر' },
  lnum: { label: 'أرقام صفّية', hint: 'أرقام بارتفاع الحروف الكبيرة' },
  onum: { label: 'أرقام قديمة', hint: 'أرقام تصعد وتنزل كالحروف الصغيرة' },
  pnum: { label: 'أرقام متناسبة', hint: 'لكل رقم عرضه الطبيعي' },
  tnum: { label: 'أرقام جدولية', hint: 'أرقام بعرض واحد تصطفّ في الجداول' },
  zero: { label: 'صفر مشطوب', hint: 'صفر بشرطة يميّزه عن حرف O' },
  ordn: { label: 'لواحق ترتيبية', hint: 'لواحق مثل 1st و2nd' },
  sinf: { label: 'أرقام سفلية علمية', hint: 'أرقام سفلية للصيغ العلمية' },
  subs: { label: 'أرقام تحتية', hint: 'أرقام صغيرة منخفضة' },
  sups: { label: 'أرقام فوقية', hint: 'أرقام صغيرة مرفوعة' },
  smcp: { label: 'حروف صغيرة', hint: 'حروف لاتينية كبيرة بحجم الصغيرة' },
  c2sc: { label: 'كبيرة إلى صغيرة', hint: 'يصغّر الحروف اللاتينية الكبيرة' },
  hist: { label: 'أشكال تاريخية', hint: 'أشكال قديمة للحروف' },
  mset: { label: 'مواضع العلامات (قديمة)' },
};

export function featureInfo(tag: string): Info {
  if (FEATURES[tag]) return FEATURES[tag];
  const ss = /^ss(\d\d)$/.exec(tag);
  if (ss)
    return {
      label: `مجموعة أسلوبية ${Number(ss[1]).toLocaleString('ar')}`,
      hint: 'مجموعة أشكال بديلة رسمها المصمّم',
    };
  const cv = /^cv(\d\d)$/.exec(tag);
  if (cv) return { label: `بديل حرف ${Number(cv[1]).toLocaleString('ar')}`, hint: 'شكل بديل لحرف بعينه' };
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

/**
 * مجموعات المفتش حسب سؤال المصمّم — لا حسب جدول الملف:
 * style: شكل الحروف (مجموعات أسلوبية، بدائل، سواش) · liga: الربطات · num: الأرقام والكسور ·
 * space: المسافات والتموضع · engine: يديرها محرّك التشكيل للعربية (للعلم فقط).
 */
export type FeatureGroup = 'style' | 'liga' | 'num' | 'space' | 'engine';

const NUM = new Set([
  'lnum',
  'onum',
  'pnum',
  'tnum',
  'frac',
  'numr',
  'dnom',
  'zero',
  'sups',
  'subs',
  'sinf',
  'ordn',
  'afrc',
]);
const LIGA = new Set(['liga', 'dlig', 'clig', 'hlig', 'rlig']);
const SPACE = new Set(['kern', 'mark', 'mkmk', 'curs', 'cpsp', 'case', 'dist', 'abvm', 'blwm', 'palt', 'halt']);

/** تقنية مفعّلة دائماً تقريباً — لا يبحث عنها المصمّم بين البدائل؛ تُعرض مع التلقائية */
const BASIC = new Set(['ccmp', 'locl', 'rtlm', 'rclt', 'rvrn']);

export function featureGroup(tag: string): FeatureGroup {
  if (featureInfo(tag).mode === 'engine' || BASIC.has(tag)) return 'engine';
  if (NUM.has(tag)) return 'num';
  if (LIGA.has(tag)) return 'liga';
  if (SPACE.has(tag)) return 'space';
  return 'style';
}

export const GROUP_LABEL: Record<FeatureGroup, { label: string; hint: string }> = {
  style: { label: 'أشكال وبدائل', hint: 'مجموعات أسلوبية وبدائل حروف رسمها المصمّم' },
  liga: { label: 'الربطات', hint: 'حروف تتّحد في شكل واحد' },
  num: { label: 'الأرقام والكسور', hint: 'أنماط الأرقام والكسور والأسس' },
  space: { label: 'المسافات والتموضع', hint: 'التقنين ومواضع العلامات' },
  engine: { label: 'أساسية وتلقائية', hint: 'يديرها محرّك التشكيل وتعمل دائماً — للعلم' },
};
