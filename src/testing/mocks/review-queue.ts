/* ══ طابور المراجعة — بيانات تجريبية للعرض فقط ══════════════════════════════
   في المنتج: الخطوط المرسلة من الاستوديوهات (publish → submit) بملفاتها المرفوعة وفحوصها الآلية.
   المعاينة هنا بخطوط موجودة في المكتبة لأن الملفات المرفوعة غير متاحة في العرض. */
import type { Category, Lang, LiveFace } from '@/types/domain/font';

export type Submission = {
  id: string;
  /** الاسم اللاتيني أولاً (مطلوب)، والعربي اختياري */
  nameLatin: string;
  nameAr?: string;
  foundry: { id: string; name: string };
  submittedBy: string;
  /** ISO datetime */
  submittedAt: string;
  type: 'free' | 'paid';
  price?: number;
  category: Category;
  styles: string[];
  langs: Lang[];
  weights: string[];
  license: 'OFL' | 'EULA حرف';
  description: string;
  files: { name: string; bytes: number }[];
  /** تفرّعات الأسلوب كما اختارها الاستوديو (نسخ، ديواني…) */
  /** فحوص آلية تجري عند الرفع (الترميز، التغطية، التسمية…) */
  checks: { label: string; ok: boolean; note?: string }[];
  preview: LiveFace;
  /** إعادة إرسال بعد رفض سابق */
  resubmission?: boolean;
};

const hoursAgo = (h: number) => new Date(Date.now() - h * 36e5).toISOString();

export const REVIEW_QUEUE: Submission[] = [
  {
    id: 'REV-4821',
    nameLatin: 'Naqsh',
    nameAr: 'نقش',
    foundry: { id: 'tajarib', name: 'مسبك تجارب' },
    submittedBy: 'عبدالملك جاسم',
    submittedAt: hoursAgo(70),
    type: 'paid',
    price: 260,
    category: 'decorative',
    styles: ['ديواني'],
    langs: ['ar', 'fa'],
    weights: ['Regular', 'Medium', 'Bold'],
    license: 'EULA حرف',
    description: 'خط زخرفي مستوحى من الديواني بتراكيب معاصرة، للعناوين والهويات.',
    files: [
      { name: 'Naqsh-Regular.otf', bytes: 412_000 },
      { name: 'Naqsh-Medium.otf', bytes: 418_000 },
      { name: 'Naqsh-Bold.otf', bytes: 425_000 },
    ],
    checks: [
      { label: 'الملفات سليمة وتُقرأ', ok: true },
      { label: 'تغطية العربية الأساسية', ok: true },
      { label: 'تغطية الفارسية', ok: true },
      { label: 'أسماء الأوزان متّسقة', ok: true },
      { label: 'الترخيص مرفق', ok: true },
    ],
    preview: { family: 'Reem Kufi', nameAr: 'ريم كوفي', weights: [400, 500, 600, 700] },
  },
  {
    id: 'REV-4830',
    nameLatin: 'Warraq Naskh',
    nameAr: 'نسخ الورّاق',
    foundry: { id: 'warraq', name: 'مسبك الورّاق' },
    submittedBy: 'حسن رضا',
    submittedAt: hoursAgo(30),
    type: 'free',
    category: 'classic',
    styles: ['نسخ'],
    langs: ['ar', 'ur'],
    weights: ['Regular', 'Bold'],
    license: 'OFL',
    description: 'نسخ للنصوص الطويلة بتشكيل كامل، مناسب للكتب والمصاحف التعليمية.',
    files: [
      { name: 'WarraqNaskh-Regular.ttf', bytes: 690_000 },
      { name: 'WarraqNaskh-Bold.ttf', bytes: 702_000 },
      { name: 'OFL.txt', bytes: 4_400 },
    ],
    checks: [
      { label: 'الملفات سليمة وتُقرأ', ok: true },
      { label: 'تغطية العربية الأساسية', ok: true },
      { label: 'تغطية الأردية', ok: false, note: 'ينقص 6 محارف أردية (ٹ ڈ ڑ ں ھ ے).' },
      { label: 'أسماء الأوزان متّسقة', ok: true },
      { label: 'الترخيص مرفق', ok: true },
    ],
    preview: { family: 'Amiri', nameAr: 'أميري', weights: [400, 700] },
  },
  {
    id: 'REV-4833',
    nameLatin: 'Satr Grotesk',
    foundry: { id: 'satr', name: 'استوديو سطر' },
    submittedBy: 'ليلى يوسف',
    submittedAt: hoursAgo(9),
    type: 'paid',
    price: 180,
    category: 'modern',
    styles: [],
    langs: ['ar', 'la'],
    weights: ['Light', 'Regular', 'Medium', 'Bold', 'Black'],
    license: 'EULA حرف',
    description: 'غروتسك عربي-لاتيني متوازن للواجهات الرقمية.',
    files: [{ name: 'SatrGrotesk-VF.ttf', bytes: 1_240_000 }],
    checks: [
      { label: 'الملفات سليمة وتُقرأ', ok: true },
      { label: 'تغطية العربية الأساسية', ok: true },
      { label: 'تغطية اللاتينية', ok: true },
      { label: 'أسماء الأوزان متّسقة', ok: false, note: 'اسم العائلة في الملف «Satr Grotesque» يختلف عن المُدخل.' },
      { label: 'الترخيص مرفق', ok: true },
    ],
    preview: { family: 'Readex Pro', nameAr: 'ريدكس برو', weights: [400, 500, 600, 700] },
  },
  {
    id: 'REV-4835',
    nameLatin: 'Midad',
    nameAr: 'مِداد',
    foundry: { id: 'tajarib', name: 'مسبك تجارب' },
    submittedBy: 'عبدالملك جاسم',
    submittedAt: hoursAgo(4),
    type: 'free',
    category: 'text',
    styles: [],
    langs: ['ar', 'ku'],
    weights: ['Regular', 'Bold'],
    license: 'OFL',
    description: 'خط نصوص هادئ. أُصلحت المحارف الكردية الناقصة في Bold بعد الرفض السابق.',
    files: [
      { name: 'Midad-Regular.otf', bytes: 356_000 },
      { name: 'Midad-Bold.otf', bytes: 361_000 },
      { name: 'OFL.txt', bytes: 4_400 },
    ],
    checks: [
      { label: 'الملفات سليمة وتُقرأ', ok: true },
      { label: 'تغطية العربية الأساسية', ok: true },
      { label: 'تغطية الكردية', ok: true },
      { label: 'أسماء الأوزان متّسقة', ok: true },
      { label: 'الترخيص مرفق', ok: true },
    ],
    preview: { family: 'Noto Naskh Arabic', nameAr: 'نوتو نسخ', weights: [400, 500, 600, 700] },
    resubmission: true,
  },
  {
    id: 'REV-4837',
    nameLatin: 'Kalima Display',
    nameAr: 'كلمة',
    foundry: { id: 'kalima', name: 'Kalima Type' },
    submittedBy: 'عمر مراد',
    submittedAt: hoursAgo(1.5),
    type: 'paid',
    price: 120,
    category: 'headline',
    styles: ['كوفي'],
    langs: ['ar'],
    weights: ['Bold', 'Black'],
    license: 'EULA حرف',
    description: 'كوفي عريض للعناوين والملصقات.',
    files: [
      { name: 'KalimaDisplay-Bold.otf', bytes: 298_000 },
      { name: 'KalimaDisplay-Black.otf', bytes: 305_000 },
    ],
    checks: [
      { label: 'الملفات سليمة وتُقرأ', ok: true },
      { label: 'تغطية العربية الأساسية', ok: true },
      { label: 'أسماء الأوزان متّسقة', ok: true },
      { label: 'الترخيص مرفق', ok: false, note: 'لم يُرفق إقرار ملكية التصميم.' },
    ],
    preview: { family: 'Noto Kufi Arabic', nameAr: 'نوتو كوفي', weights: [400, 500, 600, 700, 800] },
  },
];
