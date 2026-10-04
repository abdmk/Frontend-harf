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

/* ── مساحة العمل الجديدة: خمسة مشاهد بدل اثنتي عشرة صفحة ─────────────────────────────── */

export type ViewKey = 'preview' | 'glyphs' | 'support' | 'compare' | 'file';
/** أقسام «الحروف» — شرائح داخل المشهد نفسه */
export type GlyphSub = 'letters' | 'marks' | 'numerals' | 'glyphs';

export type View = { key: ViewKey; label: string; lead: string; icon: IconComponent };

/**
 * المشاهد حسب سؤال المصمّم: كيف يبدو نصّي به؟ هل حروفه كاملة؟ هل يدعم ما أحتاج؟ كيف يقارن بغيره؟ ما الملف؟
 * النص والحجم والنمط في شريط واحد فوقها كلها — يتغيّر مرّة ويتبعه كل مشهد.
 */
export const VIEWS: View[] = [
  {
    key: 'preview',
    label: 'المعاينة',
    lead: 'نصّك بالخط: بالحجم الذي تختاره، بكل أنماط العائلة، ومن أصغر حجم لأكبره.',
    icon: TextIcon,
  },
  { key: 'glyphs', label: 'الحروف', lead: 'أشكال كل حرف، التشكيل، الأرقام، وكل محارف الملف.', icon: GridIcon },
  {
    key: 'support',
    label: 'الدعم',
    lead: 'هل الخط جاهز لعملك؟ فحص سريع، اللغات، وميزات OpenType التي في الملف.',
    icon: GlobeIcon,
  },
  { key: 'compare', label: 'المقارنة', lead: 'خطوطك المحمّلة جنباً إلى جنب بالنص نفسه.', icon: LayersIcon },
  { key: 'file', label: 'الملف', lead: 'بيانات الملف كما في جداوله، وتصديرها.', icon: DocumentIcon },
];

export const GLYPH_SUBS: { key: GlyphSub; label: string }[] = [
  { key: 'letters', label: 'الحروف وأشكالها' },
  { key: 'marks', label: 'التشكيل' },
  { key: 'numerals', label: 'الأرقام والترقيم' },
  { key: 'glyphs', label: 'كل المحارف' },
];

export const viewByKey = (k: string | null) => VIEWS.find((v) => v.key === k) ?? VIEWS[0]!;
export const glyphSubByKey = (k: string | null) => GLYPH_SUBS.find((g) => g.key === k)?.key ?? 'letters';

/** وجهة كل أداة قديمة في المشاهد الجديدة — روابط ?tool= القديمة وبنود الفحص السريع */
export function routeOfTool(tool: ToolKey): { view: ViewKey; sub?: GlyphSub } {
  if (tool === 'letters' || tool === 'marks' || tool === 'numerals' || tool === 'glyphs')
    return { view: 'glyphs', sub: tool };
  if (tool === 'languages' || tool === 'features' || tool === 'overview') return { view: 'support' };
  if (tool === 'compare') return { view: 'compare' };
  if (tool === 'info') return { view: 'file' };
  return { view: 'preview' };
}
