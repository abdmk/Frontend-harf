import type { IconComponent } from '@/components/ui/icons';
import {
  AlignJustifyIcon,
  AppsIcon,
  BadgeIcon,
  DocumentIcon,
  GlobeIcon,
  GridIcon,
  InterliningIcon,
  LayersIcon,
  MagicWandIcon,
  SlidersIcon,
  StatsIcon,
  TextIcon,
} from '@/components/ui/icons';

import type { LabFont } from '../types';

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

export type Tool = {
  key: ToolKey;
  label: string;
  lead: string;
  icon: IconComponent;
  count?: (f: LabFont) => number | string | null;
};

/**
 * أدوات المختبر مجمّعة حسب سؤال المصمّم: كيف يبدو؟ هل حروفه كاملة؟ ماذا يدعم؟ ما هو الملف؟
 * (كانت قائمة مسطّحة من 13 أداة؛ التجميع يجعل التنقّل بينها قراراً واضحاً.)
 */
export const TOOL_GROUPS: { label: string; tools: Tool[] }[] = [
  {
    label: '',
    tools: [
      {
        key: 'overview',
        label: 'نظرة عامة',
        lead: 'ملخّص الخط وفحص سريع لأهم نقاط الجودة.',
        icon: StatsIcon,
      },
    ],
  },
  {
    label: 'المعاينة',
    tools: [
      { key: 'sample', label: 'عيّنة النص', lead: 'حرّر النص مباشرةً واضبط قياساته وألوانه.', icon: TextIcon },
      {
        key: 'waterfall',
        label: 'تدرّج الأحجام',
        lead: 'النص نفسه من أصغر أحجام القراءة إلى أحجام العرض.',
        icon: InterliningIcon,
      },
      {
        key: 'weights',
        label: 'الأوزان والمحاور',
        lead: 'الأوزان الحقيقية في الملفات، ومحاور الخط المتغيّر.',
        icon: SlidersIcon,
        count: (f) => (f.axes.length ? `${f.axes.length} محاور` : null),
      },
    ],
  },
  {
    label: 'الحروف',
    tools: [
      {
        key: 'letters',
        label: 'الحروف وأشكالها',
        lead: 'كل حرف بأشكاله السياقية الأربعة وفي كلمة.',
        icon: GridIcon,
      },
      { key: 'marks', label: 'التشكيل', lead: 'مواضع الحركات وتراكبها على الحروف والنصوص.', icon: BadgeIcon },
      {
        key: 'numerals',
        label: 'الأرقام والترقيم',
        lead: 'الأرقام العربية والهندية والعملات والكسور.',
        icon: AlignJustifyIcon,
      },
      {
        key: 'glyphs',
        label: 'المحارف',
        lead: 'كل محرف في الملف برسمه ورمزه وقياساته.',
        icon: AppsIcon,
        count: (f) => f.glyphCount,
      },
    ],
  },
  {
    label: 'الدعم',
    tools: [
      {
        key: 'languages',
        label: 'اللغات',
        lead: 'تقدير مبنيّ على تغطية الحروف المطلوبة لكل لغة.',
        icon: GlobeIcon,
      },
      {
        key: 'features',
        label: 'ميزات OpenType',
        lead: 'الميزات الموجودة فعلاً في الملف — شغّلها وأطفئها وشاهد أثرها.',
        icon: MagicWandIcon,
        count: (f) => f.features.length,
      },
    ],
  },
  {
    label: 'الملف',
    tools: [
      { key: 'compare', label: 'المقارنة', lead: 'خطوطك المحمّلة جنباً إلى جنب بالنص نفسه.', icon: LayersIcon },
      {
        key: 'info',
        label: 'المعلومات والتصدير',
        lead: 'بيانات الملف كما في جداوله، وتصديرها.',
        icon: DocumentIcon,
      },
    ],
  },
];

export const TOOLS = TOOL_GROUPS.flatMap((g) => g.tools);
export const toolByKey = (k: string | null) => TOOLS.find((t) => t.key === k) ?? TOOLS[0]!;
