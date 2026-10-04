import type { IconComponent } from '@/components/ui/icons';
import {
  AppsIcon,
  ChartHistogramIcon,
  GlobeIcon,
  GridIcon,
  InfoIcon,
  InterliningIcon,
  LayersIcon,
  ListIcon,
  MagicWandIcon,
  SlidersIcon,
  StarIcon,
  TextIcon,
} from '@/components/ui/icons';

/** أدوات الفحص — بترتيب «مختبر حرف» نفسه: التجربة أولاً، ثم ما في الملف حرفاً حرفاً، ثم بياناته */
export type ToolKey =
  | 'sample'
  | 'languages'
  | 'features'
  | 'letters'
  | 'marks'
  | 'waterfall'
  | 'weights'
  | 'axes'
  | 'numerals'
  | 'glyphs'
  | 'compare'
  | 'info';

export type Tool = { key: ToolKey; label: string; lead: string; icon: IconComponent };

export const TOOLS: Tool[] = [
  {
    key: 'sample',
    label: 'عيّنة النص',
    lead: 'اكتب نصّك واضبط قياسه وألوانه — وفعّل ميزات OpenType وأنت تجرّب.',
    icon: TextIcon,
  },
  { key: 'languages', label: 'اللغات', lead: 'فحص سريع لجاهزية الخط، وتغطية حروف كل لغة بالتفصيل.', icon: GlobeIcon },
  {
    key: 'features',
    label: 'ميزات OpenType',
    lead: 'شغّل ميزات هذا الملف وأطفئها وشاهد أثرها — ثم تعمّق في كل ما فيه.',
    icon: MagicWandIcon,
  },
  {
    key: 'letters',
    label: 'الحروف وأشكالها',
    lead: 'اختر حرفاً لترى أشكاله السياقية الأربعة في الوصل الحقيقي.',
    icon: GridIcon,
  },
  { key: 'marks', label: 'التشكيل', lead: 'مواضع الحركات وتراكبها على الحروف وفي النصوص.', icon: StarIcon },
  {
    key: 'waterfall',
    label: 'تدرّج الأحجام',
    lead: 'النص نفسه من أصغر أحجام القراءة إلى أحجام العرض.',
    icon: InterliningIcon,
  },
  {
    key: 'weights',
    label: 'الأوزان',
    lead: 'أوزان العائلة الحقيقية، وما يصطنعه المتصفّح منها.',
    icon: ChartHistogramIcon,
  },
  {
    key: 'axes',
    label: 'المحاور المتغيّرة',
    lead: 'حرّك محاور الخط المتغيّر، وجرّب أنماطه المسمّاة.',
    icon: SlidersIcon,
  },
  {
    key: 'numerals',
    label: 'الأرقام',
    lead: 'الأرقام الهندية والعربية والعملات والكسور في سياقات شائعة.',
    icon: ListIcon,
  },
  {
    key: 'glyphs',
    label: 'المحارف',
    lead: 'كل محارف الملف — بالرموز أو بترتيبها في الملف — وتفاصيل كل محرف.',
    icon: AppsIcon,
  },
  { key: 'compare', label: 'المقارنة', lead: 'خطوطك المحمّلة جنباً إلى جنب بالنص والحجم نفسيهما.', icon: LayersIcon },
  { key: 'info', label: 'معلومات الخط', lead: 'الأسماء والمقاييس والجداول كما في الملف، وتصديرها.', icon: InfoIcon },
];

export const toolByKey = (k: string | null) => TOOLS.find((t) => t.key === k) ?? TOOLS[0]!;

/* ── سياقات عيّنة النص — كلها تتبع الإعدادات نفسها ─────────────────────────── */

export type CanvasMode = 'write' | 'tests' | 'paragraphs' | 'layout';

export const CANVAS_MODES: { key: CanvasMode; label: string; hint: string }[] = [
  { key: 'write', label: 'اكتب', hint: 'نصّك بالخط، يُحرَّر في مكانه' },
  { key: 'tests', label: 'اختبارات', hint: 'نصوص تكشف عيوب الرسم والوصل والتشكيل والدعم' },
  { key: 'paragraphs', label: 'فقرات', hint: 'نصوص قراءة بأساليب ولغات مختلفة' },
  { key: 'layout', label: 'تخطيط', hint: 'عنوان ومقدّمة ومتن بأعمدة — كما في صفحة حقيقية' },
];

export const canvasModeByKey = (k: string | null): CanvasMode => CANVAS_MODES.find((m) => m.key === k)?.key ?? 'write';

/**
 * روابط قديمة قابلة للمشاركة (?view=&sub=&mode=) — تُترجم إلى أداة اليوم فلا ينكسر رابط أُرسل سابقاً.
 */
export function legacyTool(p: URLSearchParams): ToolKey | null {
  const mode = p.get('mode');
  if (mode === 'sizes') return 'waterfall';
  if (mode === 'styles') return 'weights';
  const view = p.get('view');
  if (view === 'styles' || view === 'preview') return 'weights';
  if (view === 'glyphs') {
    const sub = p.get('sub');
    return sub === 'marks' || sub === 'numerals' || sub === 'glyphs' ? sub : 'letters';
  }
  if (view === 'opentype') return 'features';
  if (view === 'support') return 'languages';
  if (view === 'file') return 'info';
  if (view === 'compare') return 'compare';
  const tool = p.get('tool');
  if (tool === 'overview') return 'languages';
  return null;
}
