/**
 * تعريف دعم اللغات: لكل لغة حروفها الأساسية، وحروفها المميّزة (التي لا تُكتب اللغة بدونها)،
 * وحروف إضافية (أرقام وترقيم وتشكيل) تحسّن التجربة لكنها لا تمنع الكتابة.
 * التقدير: أساسية 60٪ · مميّزة 30٪ · إضافية 10٪. هذا تقدير فحص سريع، لا شهادة دعم رسمية.
 */
const chars = (s: string) => [...s].map((c) => c.codePointAt(0)!);
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

const ARABIC_BASE = chars('ابتثجحخدذرزسشصضطظعغفقكلمنهوي');
const HARAKAT = range(0x064b, 0x0652);

export type LangKey = 'ar' | 'fa' | 'ur' | 'ckb' | 'en';
export type Language = {
  key: LangKey;
  name: string;
  nameEn: string;
  script: 'arabic' | 'latin';
  base: number[];
  special: number[];
  extra: number[];
  sample: string;
  /** وسم اللغة في OpenType (جدول locl) */
  otTag?: string;
};

export const LANGUAGES: Language[] = [
  {
    key: 'ar',
    name: 'العربية',
    nameEn: 'Arabic',
    script: 'arabic',
    base: ARABIC_BASE,
    special: chars('ءآأإؤئةى'),
    extra: [...range(0x0660, 0x0669), ...chars('،؛؟٪'), ...HARAKAT],
    sample:
      'الخطُّ العربي بحرٌ لا ساحل له، تتشكّل فيه الحروف كما تتشكّل الأمواج: تبدأ من نقطة، وتمتدّ، ثم تعود. وفي كل خطٍّ جيّد سرٌّ بسيط — أن يُقرأ قبل أن يُعجَب به. ١٢٣٤٥ ٪ ، ؛ ؟',
  },
  {
    key: 'fa',
    name: 'الفارسية',
    nameEn: 'Persian',
    script: 'arabic',
    base: ARABIC_BASE.filter((c) => c !== 0x064a && c !== 0x0643),
    special: chars('پچژگکی'),
    extra: [...range(0x06f0, 0x06f9), ...chars('،؛؟٪'), 0x200c],
    otTag: 'FAR',
    sample:
      'زبان فارسی گنجینه‌ای از واژه‌های کهن است؛ هر حرف در آن جای خود را می‌داند و چشم را خسته نمی‌کند. خطّ خوب، پیش از آنکه زیبا باشد، خواناست. ۱۲۳۴۵ پژوهش گچ چراغ ژاله',
  },
  {
    key: 'ur',
    name: 'الأردية',
    nameEn: 'Urdu',
    script: 'arabic',
    base: ARABIC_BASE.filter((c) => c !== 0x064a && c !== 0x0643 && c !== 0x0647),
    special: chars('ٹڈڑںھہےۓپچژگکی'),
    extra: [...range(0x06f0, 0x06f9), ...chars('،؛؟۔')],
    otTag: 'URD',
    sample:
      'اردو زبان کی خوبصورتی اس کے حروف کے جوڑ میں ہے؛ ہر لفظ ایک لڑی کی طرح بہتا ہے۔ اچھا خط وہ ہے جو پڑھنے والے کی آنکھ کو تھکائے نہیں۔ ٹماٹر ڈھول پڑھائی بڑے ۱۲۳۴۵',
  },
  {
    key: 'ckb',
    name: 'الكردية (سوراني)',
    nameEn: 'Kurdish (Sorani)',
    script: 'arabic',
    base: ARABIC_BASE.filter((c) => ![0x062b, 0x0630, 0x0636, 0x0638, 0x0637, 0x0643, 0x064a].includes(c)),
    special: chars('پچژگڤکڕڵۆێەی'),
    extra: [...range(0x0660, 0x0669), ...chars('،؛؟')],
    otTag: 'KUR',
    sample:
      'زمانی کوردی دەریایەکی پڕ لە وشەیە؛ هەر پیتێک شوێنی خۆی دەزانێت. خەتی باش پێش ئەوەی جوان بێت، خوێندنەوەی ئاسانە. ڕۆژ، گوڵ، ڤیان، پێشکەوتن ١٢٣٤٥',
  },
  {
    key: 'en',
    name: 'الإنجليزية',
    nameEn: 'English',
    script: 'latin',
    base: [...range(0x41, 0x5a), ...range(0x61, 0x7a)],
    special: [],
    extra: [...range(0x30, 0x39), ...chars('.,;:!?\'"()-&%$#@')],
    sample:
      'The quick brown fox jumps over the lazy dog. Typography is the craft of making language visible — it should be read before it is admired. 0123456789 (&%$#@!?)',
  },
];

export const byLang = (k: LangKey) => LANGUAGES.find((l) => l.key === k)!;
