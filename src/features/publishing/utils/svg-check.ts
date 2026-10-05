/**
 * فحص ملف مخطوطة SVG قبل قبوله — الملف نصّ قد يحمل سكربتاً أو روابط خارجية، فيُرفض كل ما ليس رسماً:
 * <script>، <foreignObject>، الإطارات والكائنات المضمّنة، سمات on*، وأي رابط ليس مرجعاً داخلياً (#…)
 * أو صورة data: خاماً. المعاينة تُعرض في <img> (لا تنفّذ سكربتاً أصلاً) — والفحص طبقة ثانية.
 * ⚠️ عرض: في المنتج يُعاد الفحص والتعقيم على الخادم قبل التخزين والنشر.
 */
export const MAX_SVG_BYTES = 5 * 1024 * 1024;

export type SvgCheck = { ok: true; width: number; height: number; elements: number } | { ok: false; error: string };

const FORBIDDEN_TAGS = new Set([
  'script',
  'foreignobject',
  'iframe',
  'embed',
  'object',
  'audio',
  'video',
  'link',
  'meta',
]);
const LINK_ATTRS = new Set(['href', 'xlink:href', 'src']);
const SAFE_DATA_IMAGE = /^data:image\/(png|jpe?g|webp|gif);base64,[a-z0-9+/=\s]+$/i;

export function checkSvgText(text: string): SvgCheck {
  if (!text.trim()) return { ok: false, error: 'الملف فارغ.' };
  // كيانات DOCTYPE قد توسّع النص أضعافاً (هجوم «مليار ضحكة») — لا حاجة لها في رسم
  if (/<!DOCTYPE|<!ENTITY/i.test(text)) return { ok: false, error: 'الملف يحتوي تعريفات DOCTYPE غير مسموحة.' };
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const root = doc.documentElement;
  if (doc.getElementsByTagName('parsererror').length || root.nodeName.toLowerCase() !== 'svg')
    return { ok: false, error: 'هذا ليس ملف SVG صالحاً.' };

  const all = [root, ...Array.from(root.getElementsByTagName('*'))];
  for (const el of all) {
    const tag = el.nodeName.toLowerCase();
    if (FORBIDDEN_TAGS.has(tag)) return { ok: false, error: `الملف يحتوي عنصراً غير مسموح (${tag}).` };
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim();
      if (name.startsWith('on')) return { ok: false, error: 'الملف يحتوي سكربتاً مضمّناً في سماته.' };
      if (LINK_ATTRS.has(name) && !value.startsWith('#') && !SAFE_DATA_IMAGE.test(value))
        return { ok: false, error: 'الملف يشير إلى روابط أو ملفات خارجية — أرسله رسماً مستقلاً.' };
      if (/url\(\s*['"]?(?!#)/i.test(value) || /javascript:/i.test(value))
        return { ok: false, error: 'الملف يحتوي روابط خارجية في أنماطه.' };
    }
    if (tag === 'style' && /@import|url\(\s*['"]?(?!#)/i.test(el.textContent ?? ''))
      return { ok: false, error: 'أنماط الملف تستورد ملفات خارجية.' };
  }

  // الأبعاد: من viewBox أولاً، ثم width/height
  const vb = (root.getAttribute('viewBox') ?? '').split(/[\s,]+/).map(Number);
  const width = vb.length === 4 && vb[2]! > 0 ? vb[2]! : parseFloat(root.getAttribute('width') ?? '');
  const height = vb.length === 4 && vb[3]! > 0 ? vb[3]! : parseFloat(root.getAttribute('height') ?? '');
  if (!(width > 0) || !(height > 0)) return { ok: false, error: 'حدّد للملف أبعاداً (viewBox) ليُعرض بنسبته الصحيحة.' };
  if (all.length < 2) return { ok: false, error: 'الملف لا يحتوي رسماً.' };
  return { ok: true, width: Math.round(width), height: Math.round(height), elements: all.length - 1 };
}

/** فحص الملف نفسه: الامتداد والنوع والحجم، ثم المحتوى */
export async function checkSvgFile(file: File): Promise<SvgCheck> {
  if (!/\.svg$/i.test(file.name) || (file.type && file.type !== 'image/svg+xml'))
    return { ok: false, error: 'المخطوطات بصيغة SVG متجهة فقط.' };
  if (file.size > MAX_SVG_BYTES)
    return { ok: false, error: 'أكبر من 5 ميغابايت — بسّط المسارات أو احذف الطبقات المخفية.' };
  return checkSvgText(await file.text());
}
