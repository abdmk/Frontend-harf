/**
 * الجزء الذي يحتاج المتصفّح: قراءة الملف، رسم النص بخط ما، وتحويل الأقنعة إلى صور للعرض.
 * لا شيء يُرفع — كل المعالجة على جهاز المستخدم.
 */
import { inkMask, type Mask, type Pixels, type Polarity, resample } from './image';

export const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp'] as const;
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_SIDE = 1600;

export type LoadedImage = { url: string; pixels: Pixels; width: number; height: number };

export class ImageError extends Error {}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new ImageError('المتصفّح لا يدعم معالجة الصور.');
  return { c, ctx };
}

/** يتحقّق من النوع والحجم، ثم يقرأ الصورة مصغّرةً إلى 1600px كحدّ أقصى */
export async function loadImage(file: File): Promise<LoadedImage> {
  if (!(ACCEPTED as readonly string[]).includes(file.type))
    throw new ImageError('الصيغة غير مدعومة — استخدم PNG أو JPG أو WEBP.');
  if (file.size > MAX_BYTES) throw new ImageError('الصورة أكبر من 10 ميغابايت.');
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new ImageError('تعذّرت قراءة الصورة — جرّب ملفاً آخر.');
  }
  const k = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const { c, ctx } = canvas(bitmap.width * k, bitmap.height * k);
  ctx.drawImage(bitmap, 0, 0, c.width, c.height);
  bitmap.close();
  const pixels = ctx.getImageData(0, 0, c.width, c.height);
  const url = await new Promise<string>((resolve, reject) =>
    c.toBlob(
      (b) => (b ? resolve(URL.createObjectURL(b)) : reject(new ImageError('تعذّرت قراءة الصورة.'))),
      'image/png',
    ),
  );
  return { url, pixels, width: c.width, height: c.height };
}

/** يقتطع جزءاً من بكسلات الصورة */
export function cropPixels(px: Pixels, r: { x: number; y: number; w: number; h: number }): Pixels {
  const x0 = Math.max(0, Math.round(r.x));
  const y0 = Math.max(0, Math.round(r.y));
  const w = Math.max(1, Math.min(px.width - x0, Math.round(r.w)));
  const h = Math.max(1, Math.min(px.height - y0, Math.round(r.h)));
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++)
    data.set(px.data.subarray(((y0 + y) * px.width + x0) * 4, ((y0 + y) * px.width + x0 + w) * 4), y * w * 4);
  return { width: w, height: h, data };
}

const SIZE = 120;

/** يرسم النص بالخط والوزن ويعيد قناع الحبر — أو null إن لم يُحمَّل الخط فعلاً */
export async function renderMask(text: string, family: string, weight: number): Promise<Mask | null> {
  const font = `${weight} ${SIZE}px '${family}'`;
  try {
    await document.fonts.load(font, text);
  } catch {
    return null;
  }
  if (!document.fonts.check(font, text)) return null;
  const probe = canvas(1, 1).ctx;
  probe.font = font;
  const width = Math.ceil(probe.measureText(text).width) + SIZE;
  const { c, ctx } = canvas(width, SIZE * 2);
  ctx.fillStyle = '#fff'; // tokens-ignore: لوحة رسم داخلية للمقارنة، لا تُعرض
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#000'; // tokens-ignore: حبر لوحة المقارنة الداخلية
  ctx.font = font;
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, c.width - SIZE / 2, SIZE);
  return inkMask(ctx.getImageData(0, 0, c.width, c.height), 'dark-on-light' satisfies Polarity)?.mask ?? null;
}

/** قناع ← صورة بلون معيّن (CSS، من رموز التصميم) وخلفية شفافة */
export function maskToUrl(mask: Mask, color: string, width = mask.width, height = mask.height) {
  const m = width === mask.width && height === mask.height ? mask : resample(mask, width, height);
  const { c, ctx } = canvas(width, height);
  const img = ctx.createImageData(width, height);
  for (let i = 0; i < m.data.length; i++) img.data[i * 4 + 3] = Math.round(Math.min(1, m.data[i]!) * 255);
  ctx.putImageData(img, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  return c.toDataURL('image/png');
}

/** يقرأ لون رمز تصميم (مثل --primary) لاستعماله في الرسم */
export function tokenColor(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || 'currentColor';
}
