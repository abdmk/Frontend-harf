import type { IconComponent } from '@/components/ui/icons';
import { DocumentIcon, GlobeIcon, GridIcon, LayersIcon, TextIcon } from '@/components/ui/icons';

export type ToolKey =
  | 'overview'
  | 'sample'
  | 'waterfall'
  | 'weights'
  | 'letters'
  | 'marks'
  | 'numerals'
  | 'glyphs'
  | 'languages'
  | 'features'
  | 'compare'
  | 'info';

/* ── سياقات لوحة الاختبار — كلها تتبع إعدادات المفتش نفسها ─────────────────── */

export type CanvasMode = 'write' | 'tests' | 'paragraphs' | 'layout' | 'sizes' | 'styles';

export const CANVAS_MODES: { key: CanvasMode; label: string; hint: string }[] = [
  { key: 'write', label: 'اكتب', hint: 'نصّك بالخط، يُحرَّر في مكانه' },
  { key: 'tests', label: 'اختبارات', hint: 'نصوص تكشف عيوب الرسم والوصل والتشكيل والدعم' },
  { key: 'paragraphs', label: 'فقرات', hint: 'نصوص قراءة بأساليب ولغات مختلفة' },
  { key: 'layout', label: 'تخطيط', hint: 'عنوان ومقدّمة ومتن بأعمدة — كما في صفحة حقيقية' },
  { key: 'sizes', label: 'أحجام', hint: 'نصّك من 12 إلى 128 بكسل' },
  { key: 'styles', label: 'أنماط', hint: 'نصّك بكل أوزان العائلة' },
];

export const canvasModeByKey = (k: string | null): CanvasMode => CANVAS_MODES.find((m) => m.key === k)?.key ?? 'write';

/* ── فحص الخط تحت لوحة الاختبار ─────────────────────────────────────────────── */

export type ViewKey = 'glyphs' | 'opentype' | 'support' | 'file' | 'compare';
/** أقسام «المحارف» — شرائح داخل التبويب نفسه */
export type GlyphSub = 'letters' | 'marks' | 'numerals' | 'glyphs';

export type View = { key: ViewKey; label: string; lead: string; icon: IconComponent };

/**
 * فحص الخط — تحت لوحة الاختبار، لا ينافسها: كل تبويب يجيب عن سؤال واحد عن الملف.
 */
export const VIEWS: View[] = [
  { key: 'glyphs', label: 'المحارف', lead: 'أشكال كل حرف، التشكيل، الأرقام، وكل محارف الملف.', icon: GridIcon },
  {
    key: 'opentype',
    label: 'جرد OpenType',
    lead: 'كل ما في الملف: أثر كل ميزة، الربطات، البدائل، والكتابات واللغات.',
    icon: LayersIcon,
  },
  { key: 'support', label: 'الدعم واللغات', lead: 'هل الخط جاهز لعملك؟ فحص سريع واللغات المدعومة.', icon: GlobeIcon },
  {
    key: 'file',
    label: 'بيانات الملف',
    lead: 'الأسماء والمقاييس والجداول كما في الملف، وتصديرها.',
    icon: DocumentIcon,
  },
  { key: 'compare', label: 'مقارنة الخطوط', lead: 'خطوطك المحمّلة جنباً إلى جنب بالنص نفسه.', icon: TextIcon },
];

export const GLYPH_SUBS: { key: GlyphSub; label: string }[] = [
  { key: 'letters', label: 'الحروف وأشكالها' },
  { key: 'marks', label: 'التشكيل' },
  { key: 'numerals', label: 'الأرقام والترقيم' },
  { key: 'glyphs', label: 'كل المحارف' },
];

/** عناوين قديمة (?view=preview|styles) — صارت سياقات في اللوحة؛ التبويب يعود لأوّله */
export const viewByKey = (k: string | null) => VIEWS.find((v) => v.key === k) ?? VIEWS[0]!;
export const glyphSubByKey = (k: string | null) => GLYPH_SUBS.find((g) => g.key === k)?.key ?? 'letters';

/** وجهة كل أداة قديمة (?tool=) وبنود الفحص السريع: تبويب في الفحص، أو سياق في اللوحة */
export function routeOfTool(tool: ToolKey): { view?: ViewKey; sub?: GlyphSub; mode?: CanvasMode } {
  if (tool === 'letters' || tool === 'marks' || tool === 'numerals' || tool === 'glyphs')
    return { view: 'glyphs', sub: tool };
  if (tool === 'features') return { view: 'opentype' };
  if (tool === 'languages' || tool === 'overview') return { view: 'support' };
  if (tool === 'compare') return { view: 'compare' };
  if (tool === 'info') return { view: 'file' };
  if (tool === 'waterfall') return { mode: 'sizes' };
  if (tool === 'weights') return { mode: 'styles' };
  return { mode: 'write' };
}
