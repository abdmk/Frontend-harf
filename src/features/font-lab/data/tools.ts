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

/* ── التحليل تحت لوحة الاختبار ─────────────────────────────────────────────── */

export type ViewKey = 'styles' | 'opentype' | 'glyphs' | 'support' | 'compare' | 'file';
/** أقسام «الحروف» — شرائح داخل التبويب نفسه */
export type GlyphSub = 'letters' | 'marks' | 'numerals' | 'glyphs';

export type View = { key: ViewKey; label: string; lead: string; icon: IconComponent };

/**
 * التحليل المفصّل — تحت لوحة الاختبار والمفتش، لا ينافسهما: كل تبويب يجيب عن سؤال واحد.
 */
export const VIEWS: View[] = [
  { key: 'styles', label: 'الأنماط والأحجام', lead: 'نصّك بكل أنماط العائلة، ومن أصغر حجم لأكبره.', icon: TextIcon },
  {
    key: 'opentype',
    label: 'جرد OpenType',
    lead: 'كل ما في الملف: أثر كل ميزة، الربطات، البدائل، والكتابات واللغات.',
    icon: LayersIcon,
  },
  { key: 'glyphs', label: 'الحروف', lead: 'أشكال كل حرف، التشكيل، الأرقام، وكل محارف الملف.', icon: GridIcon },
  { key: 'support', label: 'الدعم', lead: 'هل الخط جاهز لعملك؟ فحص سريع واللغات المدعومة.', icon: GlobeIcon },
  { key: 'compare', label: 'مقارنة الخطوط', lead: 'خطوطك المحمّلة جنباً إلى جنب بالنص نفسه.', icon: LayersIcon },
  { key: 'file', label: 'الملف', lead: 'بيانات الملف كما في جداوله، وتصديرها.', icon: DocumentIcon },
];

export const GLYPH_SUBS: { key: GlyphSub; label: string }[] = [
  { key: 'letters', label: 'الحروف وأشكالها' },
  { key: 'marks', label: 'التشكيل' },
  { key: 'numerals', label: 'الأرقام والترقيم' },
  { key: 'glyphs', label: 'كل المحارف' },
];

/** عناوين قديمة (?view=preview…) تُترجم إلى التبويبات الحالية */
const LEGACY_VIEW: Record<string, ViewKey> = { preview: 'styles' };
export const viewByKey = (k: string | null) => VIEWS.find((v) => v.key === (k && (LEGACY_VIEW[k] ?? k))) ?? VIEWS[0]!;
export const glyphSubByKey = (k: string | null) => GLYPH_SUBS.find((g) => g.key === k)?.key ?? 'letters';

/** وجهة كل أداة قديمة (?tool=) وبنود الفحص السريع */
export function routeOfTool(tool: ToolKey): { view: ViewKey; sub?: GlyphSub } {
  if (tool === 'letters' || tool === 'marks' || tool === 'numerals' || tool === 'glyphs')
    return { view: 'glyphs', sub: tool };
  if (tool === 'features') return { view: 'opentype' };
  if (tool === 'languages' || tool === 'overview') return { view: 'support' };
  if (tool === 'compare') return { view: 'compare' };
  if (tool === 'info') return { view: 'file' };
  return { view: 'styles' };
}
