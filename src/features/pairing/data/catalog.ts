/**
 * كتالوج «نسق» — منقول من ملف «استوديو الأدوات». كل عائلة هنا يستطيع المتصفّح عرضها فعلاً
 * (ملفاتها في src/assets/fonts/library)، لأن اقتراحاً لا تراه بالخط الحقيقي لا قيمة له.
 *
 * متّجه الخصائص f (0..1) أحكام تصميمية لا قياسات:
 *   contrast   تباين السماكة (0 أحادي الخط، 1 عالي التباين)
 *   width      عرض الحروف
 *   roundness  استدارة وانفتاح (1) مقابل حدّة وزوايا (0)
 *   formality  مرح/غير رسمي (0) مقابل رسمي/تقليدي (1)
 *   textFit    تحمّله للفقرات الطويلة
 *   displayFit حضوره في الأحجام الكبيرة
 * weights: الأوزان الموجودة فعلاً فقط — طلب وزن غير موجود يعطي «عريضاً مصطنعاً» يكذب في المعاينة.
 */

export type Script = 'ar' | 'en' | 'ku';
export type Tier = 'free' | 'paid';
export type FontStyle = 'naskh' | 'kufi' | 'geometric' | 'humanist' | 'display' | 'script';
export type Features = {
  contrast: number;
  width: number;
  roundness: number;
  formality: number;
  textFit: number;
  displayFit: number;
};
export type PairFont = {
  id: string;
  /** اسم العائلة في CSS — يطابق @font-face في library.css حرفياً */
  family: string;
  name: string;
  nameAr: string;
  foundry: string;
  tier: Tier;
  source: 'google' | 'local';
  category: string;
  style: FontStyle;
  scripts: Script[];
  weights: number[];
  f: Features;
  designer?: string;
  desc?: string;
};
export type UseCase = {
  label: string;
  heading: Partial<Features>;
  body: Partial<Features>;
  themeWeight: number;
  note: string;
};

const FAMILIES_RAW: Omit<PairFont, 'designer' | 'desc'>[] = [
  /* ---------------- مجاني — Google Fonts (OFL) ---------------- */
  {
    id: 'cairo',
    family: 'Cairo',
    name: 'Cairo',
    nameAr: 'القاهرة',
    foundry: 'Google Fonts',
    tier: 'free',
    source: 'google',
    category: 'عصرية',
    style: 'geometric',
    scripts: ['ar', 'en', 'ku'],
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
    f: { contrast: 0.15, width: 0.5, roundness: 0.6, formality: 0.5, textFit: 0.9, displayFit: 0.75 },
  },
  {
    id: 'tajawal',
    family: 'Tajawal',
    name: 'Tajawal',
    nameAr: 'تجوال',
    foundry: 'Google Fonts',
    tier: 'free',
    source: 'google',
    category: 'حديثة',
    style: 'geometric',
    scripts: ['ar', 'en'],
    weights: [200, 300, 400, 500, 700, 800, 900],
    f: { contrast: 0.1, width: 0.45, roundness: 0.55, formality: 0.45, textFit: 0.9, displayFit: 0.7 },
  },
  {
    id: 'almarai',
    family: 'Almarai',
    name: 'Almarai',
    nameAr: 'المراعي',
    foundry: 'Google Fonts',
    tier: 'free',
    source: 'google',
    category: 'حديثة',
    style: 'humanist',
    scripts: ['ar'],
    weights: [300, 400, 700, 800],
    f: { contrast: 0.2, width: 0.5, roundness: 0.6, formality: 0.55, textFit: 0.95, displayFit: 0.6 },
  },
  {
    id: 'plex-arabic',
    family: 'IBM Plex Sans Arabic',
    name: 'IBM Plex Sans Arabic',
    nameAr: 'بلكس عربي',
    foundry: 'IBM',
    tier: 'free',
    source: 'google',
    category: 'حديثة',
    style: 'humanist',
    scripts: ['ar', 'en', 'ku'],
    weights: [100, 200, 300, 400, 500, 600, 700],
    f: { contrast: 0.2, width: 0.48, roundness: 0.5, formality: 0.6, textFit: 0.95, displayFit: 0.6 },
  },
  {
    id: 'readex',
    family: 'Readex Pro',
    name: 'Readex Pro',
    nameAr: 'ريدكس برو',
    foundry: 'Google Fonts',
    tier: 'free',
    source: 'google',
    category: 'حديثة',
    style: 'humanist',
    scripts: ['ar', 'en', 'ku'],
    weights: [200, 300, 400, 500, 600, 700],
    f: { contrast: 0.15, width: 0.52, roundness: 0.65, formality: 0.45, textFit: 0.95, displayFit: 0.65 },
  },
  {
    id: 'alexandria',
    family: 'Alexandria',
    name: 'Alexandria',
    nameAr: 'الإسكندرية',
    foundry: 'Google Fonts',
    tier: 'free',
    source: 'google',
    category: 'عصرية',
    style: 'geometric',
    scripts: ['ar', 'en', 'ku'],
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    f: { contrast: 0.12, width: 0.5, roundness: 0.6, formality: 0.4, textFit: 0.85, displayFit: 0.8 },
  },
  {
    id: 'mada',
    family: 'Mada',
    name: 'Mada',
    nameAr: 'مدى',
    foundry: 'Google Fonts',
    tier: 'free',
    source: 'google',
    category: 'حديثة',
    style: 'geometric',
    scripts: ['ar'],
    weights: [200, 300, 400, 500, 600, 700, 900],
    f: { contrast: 0.1, width: 0.42, roundness: 0.5, formality: 0.45, textFit: 0.9, displayFit: 0.65 },
  },
  {
    id: 'noto-kufi',
    family: 'Noto Kufi Arabic',
    name: 'Noto Kufi Arabic',
    nameAr: 'نوتو كوفي',
    foundry: 'Google Fonts',
    tier: 'free',
    source: 'google',
    category: 'كوفية',
    style: 'kufi',
    scripts: ['ar', 'ku'],
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    f: { contrast: 0.15, width: 0.55, roundness: 0.3, formality: 0.7, textFit: 0.7, displayFit: 0.85 },
  },
  {
    id: 'reem-kufi',
    family: 'Reem Kufi',
    name: 'Reem Kufi',
    nameAr: 'ريم كوفي',
    foundry: 'Google Fonts',
    tier: 'free',
    source: 'google',
    category: 'كوفية',
    style: 'kufi',
    scripts: ['ar'],
    weights: [400, 500, 600, 700],
    f: { contrast: 0.2, width: 0.6, roundness: 0.35, formality: 0.75, textFit: 0.5, displayFit: 0.95 },
  },
  {
    id: 'amiri',
    family: 'Amiri',
    name: 'Amiri',
    nameAr: 'أميري',
    foundry: 'Khaled Hosny',
    tier: 'free',
    source: 'google',
    category: 'كلاسيكية',
    style: 'naskh',
    scripts: ['ar', 'en', 'ku'],
    weights: [400, 700],
    f: { contrast: 0.8, width: 0.4, roundness: 0.7, formality: 0.95, textFit: 0.85, displayFit: 0.7 },
  },
  {
    id: 'noto-naskh',
    family: 'Noto Naskh Arabic',
    name: 'Noto Naskh Arabic',
    nameAr: 'نوتو نسخ',
    foundry: 'Google Fonts',
    tier: 'free',
    source: 'google',
    category: 'كلاسيكية',
    style: 'naskh',
    scripts: ['ar', 'ku'],
    weights: [400, 500, 600, 700],
    f: { contrast: 0.6, width: 0.45, roundness: 0.7, formality: 0.85, textFit: 0.95, displayFit: 0.55 },
  },
  {
    id: 'markazi',
    family: 'Markazi Text',
    name: 'Markazi Text',
    nameAr: 'مركزي',
    foundry: 'Google Fonts',
    tier: 'free',
    source: 'google',
    category: 'كلاسيكية',
    style: 'naskh',
    scripts: ['ar', 'en'],
    weights: [400, 500, 600, 700],
    f: { contrast: 0.65, width: 0.38, roundness: 0.75, formality: 0.8, textFit: 0.9, displayFit: 0.6 },
  },
  {
    id: 'scheherazade',
    family: 'Scheherazade New',
    name: 'Scheherazade New',
    nameAr: 'شهرزاد',
    foundry: 'SIL',
    tier: 'free',
    source: 'google',
    category: 'كلاسيكية',
    style: 'naskh',
    scripts: ['ar', 'ku'],
    weights: [400, 500, 600, 700],
    f: { contrast: 0.75, width: 0.42, roundness: 0.8, formality: 0.9, textFit: 0.85, displayFit: 0.6 },
  },
  {
    id: 'el-messiri',
    family: 'El Messiri',
    name: 'El Messiri',
    nameAr: 'المصيري',
    foundry: 'Google Fonts',
    tier: 'free',
    source: 'google',
    category: 'عصرية',
    style: 'humanist',
    scripts: ['ar', 'en'],
    weights: [400, 500, 600, 700],
    f: { contrast: 0.35, width: 0.5, roundness: 0.55, formality: 0.6, textFit: 0.75, displayFit: 0.8 },
  },
  {
    id: 'changa',
    family: 'Changa',
    name: 'Changa',
    nameAr: 'شنقا',
    foundry: 'Google Fonts',
    tier: 'free',
    source: 'google',
    category: 'عرض',
    style: 'display',
    scripts: ['ar', 'en'],
    weights: [200, 300, 400, 500, 600, 700, 800],
    f: { contrast: 0.2, width: 0.35, roundness: 0.35, formality: 0.4, textFit: 0.6, displayFit: 0.9 },
  },
  {
    id: 'lalezar',
    family: 'Lalezar',
    name: 'Lalezar',
    nameAr: 'لاله زار',
    foundry: 'Google Fonts',
    tier: 'free',
    source: 'google',
    category: 'عرض',
    style: 'display',
    scripts: ['ar', 'en'],
    weights: [400],
    f: { contrast: 0.25, width: 0.7, roundness: 0.55, formality: 0.2, textFit: 0.25, displayFit: 1 },
  },
  {
    id: 'rakkas',
    family: 'Rakkas',
    name: 'Rakkas',
    nameAr: 'رقّاص',
    foundry: 'Google Fonts',
    tier: 'free',
    source: 'google',
    category: 'عرض',
    style: 'display',
    scripts: ['ar'],
    weights: [400],
    f: { contrast: 0.55, width: 0.65, roundness: 0.6, formality: 0.35, textFit: 0.25, displayFit: 0.95 },
  },
  {
    id: 'marhey',
    family: 'Marhey',
    name: 'Marhey',
    nameAr: 'مرِح',
    foundry: 'Google Fonts',
    tier: 'free',
    source: 'google',
    category: 'عرض',
    style: 'display',
    scripts: ['ar'],
    weights: [300, 400, 500, 600, 700],
    f: { contrast: 0.15, width: 0.6, roundness: 0.8, formality: 0.15, textFit: 0.35, displayFit: 0.9 },
  },
  {
    id: 'aref-ruqaa',
    family: 'Aref Ruqaa',
    name: 'Aref Ruqaa',
    nameAr: 'عارف رقعة',
    foundry: 'Abdullah Aref',
    tier: 'free',
    source: 'google',
    category: 'خط اليد',
    style: 'script',
    scripts: ['ar'],
    weights: [400, 700],
    f: { contrast: 0.85, width: 0.35, roundness: 0.85, formality: 0.9, textFit: 0.35, displayFit: 0.9 },
  },

  /* ---------------- مدفوع — عائلات مرخّصة في مكتبة حرف ---------------- */
  {
    id: 'graphik-arabic',
    family: 'Graphik Arabic',
    name: 'Graphik Arabic',
    nameAr: 'غرافيك عربي',
    foundry: 'Commercial Type',
    tier: 'paid',
    source: 'local',
    category: 'حديثة',
    style: 'geometric',
    scripts: ['ar', 'en'],
    weights: [300, 400, 500, 600],
    f: { contrast: 0.12, width: 0.48, roundness: 0.55, formality: 0.55, textFit: 0.95, displayFit: 0.75 },
  },
  {
    id: 'lyon-arabic',
    family: 'Lyon Arabic Display Web',
    name: 'Lyon Arabic Display',
    nameAr: 'ليون عربي',
    foundry: 'Commercial Type',
    tier: 'paid',
    source: 'local',
    category: 'عرض',
    style: 'naskh',
    scripts: ['ar', 'en'],
    weights: [400],
    f: { contrast: 0.7, width: 0.45, roundness: 0.7, formality: 0.85, textFit: 0.6, displayFit: 0.95 },
  },
  {
    id: 'qomra-arabic',
    family: 'Qomra Arabic itf',
    name: 'Qomra Arabic',
    nameAr: 'قمرة',
    foundry: 'iwantype',
    tier: 'paid',
    source: 'local',
    category: 'عرض',
    style: 'display',
    scripts: ['ar'],
    weights: [700],
    f: { contrast: 0.3, width: 0.62, roundness: 0.5, formality: 0.45, textFit: 0.35, displayFit: 0.95 },
  },
  {
    id: 'ghroob-arabic',
    family: 'Ghroob Arabic itf',
    name: 'Ghroob Arabic',
    nameAr: 'غروب',
    foundry: 'iwantype',
    tier: 'paid',
    source: 'local',
    category: 'حديثة',
    style: 'humanist',
    scripts: ['ar'],
    weights: [500],
    f: { contrast: 0.25, width: 0.5, roundness: 0.6, formality: 0.5, textFit: 0.8, displayFit: 0.7 },
  },
  {
    id: 'am-zain',
    family: 'AM-ZAIN ORIGINAL',
    name: 'AM Zain',
    nameAr: 'زين',
    foundry: 'AM Type',
    tier: 'paid',
    source: 'local',
    category: 'عرض',
    style: 'display',
    scripts: ['ar'],
    weights: [400],
    f: { contrast: 0.4, width: 0.68, roundness: 0.45, formality: 0.35, textFit: 0.3, displayFit: 1 },
  },
];

export const USE_CASES = {
  identity: {
    label: 'الهوية البصرية',
    heading: { displayFit: 0.75 },
    body: { textFit: 0.7 },
    themeWeight: 0.5,
    note: 'هوية بصرية تحتاج عنواناً ذا شخصية ومتناً محايداً يخدمه.',
  },
  social: {
    label: 'وسائل التواصل',
    heading: { displayFit: 0.8 },
    body: { textFit: 0.6 },
    themeWeight: 0.35,
    note: 'منشورات التواصل تُقرأ سريعاً، فالتباين العالي يخدم الانتباه.',
  },
  print: {
    label: 'الطباعة',
    heading: { displayFit: 0.6 },
    body: { textFit: 0.85 },
    themeWeight: 0.65,
    note: 'الطباعة تكافئ المتون المريحة والانسجام الهادئ بين الخطين.',
  },
  web: {
    label: 'المواقع',
    heading: { displayFit: 0.6 },
    body: { textFit: 0.85 },
    themeWeight: 0.6,
    note: 'الشاشات تحتاج متناً عالي المقروئية وعنواناً واضح التمييز.',
  },
  apps: {
    label: 'التطبيقات',
    heading: { displayFit: 0.55 },
    body: { textFit: 0.9 },
    themeWeight: 0.7,
    note: 'واجهات التطبيقات تفضّل الانسجام على المفاجأة.',
  },
  ads: {
    label: 'الإعلانات',
    heading: { displayFit: 0.85 },
    body: { textFit: 0.55 },
    themeWeight: 0.3,
    note: 'الإعلان يعيش على التباين: عنوان صارخ ومتن يخدمه بهدوء.',
  },
  headlines: {
    label: 'العناوين',
    heading: { displayFit: 0.85 },
    body: { displayFit: 0.6 },
    themeWeight: 0.6,
    note: 'عناوين متتابعة تحتاج تدرّجاً واضحاً بين المستويين.',
  },
  longform: {
    label: 'النصوص الطويلة',
    heading: { textFit: 0.6 },
    body: { textFit: 0.9 },
    themeWeight: 0.75,
    note: 'المتون الطويلة تتطلب راحة بصرية قبل أي شيء آخر.',
  },
} as const satisfies Record<string, UseCase>;

export const LANG_SETS = {
  ar: { label: 'العربية فقط', scripts: ['ar'] },
  'ar-en': { label: 'العربية + الإنجليزية', scripts: ['ar', 'en'] },
  'ar-ku': { label: 'العربية + الكردية', scripts: ['ar', 'ku'] },
} as const;

export const TIERS = {
  all: { label: 'مجاني ومدفوع', tiers: ['free', 'paid'] },
  free: { label: 'مجاني فقط', tiers: ['free'] },
  paid: { label: 'مدفوع فقط', tiers: ['paid'] },
} as const;

const META: Record<string, { designer: string; desc: string }> = {
  cairo: {
    designer: 'Mohamed Gaber · Google Fonts',
    desc: 'خط عصري متعدّد الأوزان بأشكال هندسية واضحة، يجمع بين العربية واللاتينية بانسجام، ويعمل بثبات في الواجهات والعناوين على حدّ سواء.',
  },
  tajawal: {
    designer: 'Boutros™ Fonts',
    desc: 'خط هندسي معاصر بمقروئية عالية وأوزان واسعة، صُمّم ليكون محايداً وعمليّاً في النصوص القصيرة والواجهات.',
  },
  almarai: {
    designer: 'Boutros™ Fonts',
    desc: 'خط إنساني حديث بفراغات مريحة وأشكال مفتوحة، مثالي للمتون المتوسطة على الشاشات.',
  },
  'plex-arabic': {
    designer: 'IBM · Bold Monday',
    desc: 'الوجه العربي من عائلة IBM Plex، بنبرة تقنية رصينة وبنية دقيقة، ممتاز للنصوص والواجهات المؤسسية.',
  },
  readex: {
    designer: 'Nour Fonts · Google Fonts',
    desc: 'خط إنساني ثلاثي النصوص (عربي ولاتيني وكردي) بمقروئية ممتازة وأشكال ودودة، مصمّم للمحتوى الرقمي.',
  },
  alexandria: {
    designer: 'Google Fonts',
    desc: 'خط هندسي متغيّر بأوزان كثيرة وطابع معاصر، يعطي العناوين حضوراً نظيفاً دون صخب.',
  },
  mada: {
    designer: 'Khaled Hosny · Google Fonts',
    desc: 'خط هندسي مقتصد بأكتاف منخفضة وفراغات متّزنة، عملي جداً في الواجهات والنصوص القصيرة.',
  },
  'noto-kufi': {
    designer: 'Google · Monotype',
    desc: 'كوفي حديث بتغطية واسعة وأوزان متدرّجة، يمنح العناوين طابعاً معمارياً واضحاً.',
  },
  'reem-kufi': {
    designer: 'خالد حسني',
    desc: 'كوفي عصري مستوحى من الكوفي المملوكي، بأشكال هندسية أنيقة تلمع في العناوين الكبيرة والشعارات.',
  },
  amiri: {
    designer: 'خالد حسني',
    desc: 'إحياء رقمي دقيق لطراز النسخ في مطبعة بولاق، عالي التباين وغنيّ بالتفاصيل، مثالي للمتون الأدبية والدينية.',
  },
  'noto-naskh': {
    designer: 'Google · Monotype',
    desc: 'نسخ كلاسيكي عالي المقروئية بتغطية واسعة، خيار آمن للمتون الطويلة على الورق والشاشة.',
  },
  markazi: {
    designer: 'Borna Izadpanah · Google Fonts',
    desc: 'خط نصّي مستوحى من النسخ التاريخي بلمسة معاصرة، مضبوط للمتون الطويلة والمقالات.',
  },
  scheherazade: {
    designer: 'SIL International',
    desc: 'نسخ تقليدي دافئ بتغطية لغوية واسعة، مصمّم للنصوص الطويلة والنشر متعدّد اللغات.',
  },
  'el-messiri': {
    designer: 'Mohamed Gaber',
    desc: 'خط إنساني بلمسة عصرية وأشكال منفتحة، يوازن بين الشخصية والوضوح في العناوين والنصوص المتوسطة.',
  },
  changa: {
    designer: 'Eduardo Tunni · Google Fonts',
    desc: 'خط عرض مضغوط بأوزان متدرّجة وحدّة بصرية، مناسب للعناوين والملصقات القوية.',
  },
  lalezar: {
    designer: 'Borna Izadpanah · Google Fonts',
    desc: 'خط عرض عريض ومرِح مستوحى من لافتات الشوارع، يصنع عناوين لافتة بحضور كبير.',
  },
  rakkas: {
    designer: 'Zeynep Akay · Google Fonts',
    desc: 'خط عرض تعبيري بأصول تاريخية، يمنح العناوين طابعاً درامياً غنيّاً بالتفاصيل.',
  },
  marhey: {
    designer: 'Google Fonts',
    desc: 'خط عرض مستدير ومبهج بأوزان متعدّدة، مثالي للعناوين الودّية ومحتوى الأطفال والتسويق المرح.',
  },
  'aref-ruqaa': {
    designer: 'عبد الله عارف · خالد حسني',
    desc: 'إحياء لخط الرقعة بأناقة عالية التباين، يمنح العناوين طابعاً خطّياً كلاسيكياً فاخراً.',
  },
  'graphik-arabic': {
    designer: 'Commercial Type',
    desc: 'خط قواعدي هندسي محايد بأوزان دقيقة، معيار احترافي للهويات والواجهات الراقية عربياً ولاتينياً.',
  },
  'lyon-arabic': {
    designer: 'Commercial Type',
    desc: 'خط عرض بنكهة النسخ عالي التباين وأناقة تحريرية، يلمع في العناوين والمجلات الفاخرة.',
  },
  'qomra-arabic': {
    designer: 'iwantype',
    desc: 'خط عرض معاصر واسع الحضور بأشكال جريئة، مصمّم للعناوين الكبيرة والغلافات.',
  },
  'ghroob-arabic': {
    designer: 'iwantype',
    desc: 'خط إنساني حديث بملمس دافئ ومقروئية جيدة، يصلح للعناوين والنصوص المتوسطة.',
  },
  'am-zain': {
    designer: 'AM Type',
    desc: 'خط عرض عريض بحضور قوي وطابع عصري، يصنع عناوين مؤثّرة في الهويات والإعلانات.',
  },
};

export const FAMILIES: PairFont[] = FAMILIES_RAW.map((f) => ({ ...f, ...META[f.id] }));

export type UseCaseKey = keyof typeof USE_CASES;
export type LangSetKey = keyof typeof LANG_SETS;
export type TierKey = keyof typeof TIERS;

export const byId = (id: string) => FAMILIES.find((f) => f.id === id) ?? null;
