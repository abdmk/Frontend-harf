import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon } from '@/components/ui/icons';

import { DEFAULT_TEXT } from '../hooks/lab-context';
import type { LabSettings } from '../types';

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
