import { FONT_FILE_EXTS, type FileMeta } from '../types/draft';

const WEIGHTS: [RegExp, number, string][] = [
  [/hair|thin/i, 100, 'Thin'],
  [/extra-?light|ultra-?light/i, 200, 'ExtraLight'],
  [/light/i, 300, 'Light'],
  [/medium/i, 500, 'Medium'],
  [/semi-?bold|demi-?bold/i, 600, 'SemiBold'],
  [/extra-?bold|ultra-?bold/i, 800, 'ExtraBold'],
  [/black|heavy/i, 900, 'Black'],
  [/bold/i, 700, 'Bold'],
];

/**
 * يستنتج الوزن والصيغة من اسم الملف (عرض).
 * في المنتج يقرأ الخادم جداول الخط نفسها (OS/2 وname) بعد الرفع — لا يُوثق باسم الملف.
 */
export function inferFontMeta(file: { name: string; size: number }): FileMeta | { error: string } {
  const ext = /\.([a-z0-9]+)$/i.exec(file.name)?.[1]?.toLowerCase() ?? '';
  if (!(FONT_FILE_EXTS as readonly string[]).includes(ext)) return { error: 'صيغة غير مدعومة — OTF أو TTF أو WOFF2' };
  const base = file.name.replace(/\.[^.]+$/, '');
  const hit = WEIGHTS.find(([re]) => re.test(base));
  return {
    name: file.name.slice(0, 180),
    size: file.size,
    weight: hit?.[1] ?? 400,
    style: hit?.[2] ?? 'Regular',
    format: ext as FileMeta['format'],
  };
}
