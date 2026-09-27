/**
 * نسخة TypeScript من رموز التصميم — للقيم التي تحتاجها الشيفرة نفسها
 * (بيانات Metadata، مدد الحركة في JS، الرسوم البيانية، استعلامات الوسائط).
 * يجب أن تطابق tokens.css؛ يتحقّق من ذلك اختبار tokens.test.ts.
 */

/** ألوان أرضية الصفحة — تُستعمل في theme-color لشريط المتصفّح */
export const surface = {
  light: '#ffffff',
  dark: '#100f0f',
} as const;

/** نقاط التحوّل (px) — مطابقة لـTailwind مع xs من دليل التصميم */
export const breakpoints = {
  xs: 520,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

/** استعلام وسائط جاهز لـuseMediaQuery: أصغر من نقطة التحوّل المعطاة */
export const below = (bp: keyof typeof breakpoints) => `(max-width: ${breakpoints[bp]}px)`;

/** مدد الحركة (ms) */
export const duration = {
  fast: 120,
  base: 200,
  slow: 320,
  xslow: 560,
} as const;

/** منحنيات الحركة */
export const easing = {
  outQuint: 'cubic-bezier(0.2, 0, 0, 1)',
  pop: 'cubic-bezier(0.34, 1.4, 0.64, 1)',
  inOutStrong: 'cubic-bezier(0.65, 0, 0.35, 1)',
} as const;

/** ألوان ثابتة للرسوم البيانية — مرتبة حسب الأولوية */
export const chartPalette = ['#ec3b3c', '#6233f5', '#008bfe', '#3dce68', '#f5a524'] as const;
