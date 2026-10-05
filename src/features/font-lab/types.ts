import type { Font as FontkitFont } from 'fontkit';

export type Axis = { tag: string; name: string; min: number; default: number; max: number };

/** خط محمَّل في المختبر — كل ما نعرضه مقروء من الملف نفسه على جهاز المستخدم */
export type LabFont = {
  id: string;
  fileName: string;
  bytes: number;
  format: 'OTF' | 'TTF' | 'WOFF' | 'WOFF2' | 'TTC';
  /** اسم العائلة في CSS لهذا الملف وحده (FontFace مسجّل) */
  css: string;
  /** اسم عائلة مشترك لكل ملفات العائلة نفسها — الأوزان الحقيقية تُختار تلقائياً */
  familyCss: string;
  /** هل قبل المتصفّح الملف للعرض (قد يرفض بعض ملفات TTC) */
  previewable: boolean;
  family: string;
  style: string;
  fullName: string;
  postscript: string;
  version: string;
  weight: number;
  italic: boolean;
  names: { label: string; value: string }[];
  unitsPerEm: number;
  metrics: { ascent: number; descent: number; lineGap: number; capHeight: number; xHeight: number };
  glyphCount: number;
  codepoints: number[];
  outline: 'TrueType (glyf)' | 'CFF' | 'CFF2';
  tables: string[];
  features: { tag: string; table: 'GSUB' | 'GPOS' }[];
  axes: Axis[];
  instances: { name: string; coords: Record<string, number> }[];
  /** وجوه FontFace المسجّلة في document.fonts — تُحذف بـreleaseFont — لا يُسلسَل */
  faces: FontFace[];
  /** للوصول إلى المحارف ومساراتها — لا يُسلسَل */
  kit: FontkitFont;
};

export type LabSettings = {
  text: string;
  size: number;
  weight: number;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  width: number;
  align: 'start' | 'center' | 'end' | 'justify';
  color: string;
  background: string;
  /** حالة ميزات OpenType: true مفعّلة، false معطّلة، undefined افتراضي الخط */
  features: Record<string, boolean>;
  /** قيم المحاور المتغيّرة */
  axes: Record<string, number>;
  /** لغة النص (BCP-47) — تُظهر الأشكال المحلّية (locl) للأردية والفارسية… ؛ '' = الافتراضية */
  lang: string;
};
