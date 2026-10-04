import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon } from '@/components/ui/icons';

import { DEFAULT_TEXT, useLab } from '../../hooks/lab-context';
import type { LabSettings } from '../../types';
import { Panel } from '../bits';

export const PRESETS: [string, string][] = [
  ['عنوان', DEFAULT_TEXT],
  [
    'فقرة',
    'الخطُّ العربي فنٌّ قائم على التوازن بين الحرف والفراغ، وبين امتداد الكلمة ووقفتها. حين يُحسن المصمّم توزيع الأوزان وضبط المسافات، يصير النص مقروءًا قبل أن يكون جميلًا، ويصير الجمال نتيجةً للوضوح لا بديلًا عنه.',
  ],
  ['الأبجدية', 'ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي ء آ أ إ ؤ ئ ة ى'],
  ['أرقام', '٠١٢٣٤٥٦٧٨٩ · 0123456789 · ٪ ، ؛ ؟ ( ) « »'],
  ['مختلط', 'حرف Harf — مكتبة الخطوط العربية Arabic Type Library ٢٠٢٦'],
];

// الألوان من رموز التصميم فقط — لا قيم ثابتة
export const SWATCHES: { label: string; color: string; background: string }[] = [
  { label: 'افتراضي', color: '', background: '' },
  { label: 'حبر على ورق', color: 'var(--ink)', background: 'var(--card)' },
  { label: 'ورق على حبر', color: 'var(--ink-foreground)', background: 'var(--ink)' },
  { label: 'أحمر حرف', color: 'var(--primary)', background: 'var(--tint-brand)' },
  { label: 'هادئ', color: 'var(--foreground)', background: 'var(--sunken)' },
];

export const ALIGN: { value: LabSettings['align']; label: string; Icon: typeof AlignRightIcon }[] = [
  { value: 'start', label: 'محاذاة لليمين', Icon: AlignRightIcon },
  { value: 'center', label: 'توسيط', Icon: AlignCenterIcon },
  { value: 'end', label: 'محاذاة لليسار', Icon: AlignLeftIcon },
  { value: 'justify', label: 'ضبط الطرفين', Icon: AlignJustifyIcon },
];

/**
 * لوحة العيّنة — نصّك بالخط بالحجم والإعدادات المختارة في الشريط، وتُحرَّر في مكانها.
 * الوزن يأتي من النمط المختار (ملف حقيقي) لا من وزن يصطنعه المتصفّح.
 */
export function Sample() {
  const { active, settings: s, set, specimen } = useLab();
  if (!active) return null;
  return (
    <Panel label="العيّنة" className="overflow-hidden">
      <div className="p-6 sm:p-10" style={{ background: s.background || undefined }}>
        <textarea
          aria-label="نص العيّنة — قابل للتحرير"
          value={s.text}
          onChange={(e) => set({ text: e.target.value.slice(0, 2000) })}
          spellCheck={false}
          dir="auto"
          className="block min-h-32 resize-none bg-transparent [field-sizing:content] outline-none focus-visible:outline-none"
          style={specimen(active, {
            fontSize: s.size,
            lineHeight: s.lineHeight,
            letterSpacing: s.letterSpacing,
            wordSpacing: s.wordSpacing,
            width: `${s.width}%`,
            textAlign: s.align,
            color: s.color || undefined,
          })}
        />
      </div>
    </Panel>
  );
}
