/**
 * تجهيز صورة يرفعها المستخدم (صورة الملف، الغلاف) — في المتصفّح، قبل أي إرسال:
 * 1. الحجم: رفض ما يتجاوز الحدّ قبل قراءته.
 * 2. النوع من البايتات الأولى (لا من الامتداد أو MIME المُعلَن): PNG أو JPEG أو WebP فقط.
 *    SVG مرفوض دائماً — قد يحمل شيفرة.
 * 3. إعادة الرسم على canvas بمقاس محدود ثم تصدير JPEG: تُزال بيانات EXIF (مثل موقع GPS)
 *    وأي حمولة مخبّأة في الملف الأصلي.
 * ⚠️ الخادم يعيد الفحص نفسه ويعيد الترميز بنفسه — هذا للتجربة السريعة وتقليل الحجم فقط.
 */

export type ImageKind = 'png' | 'jpeg' | 'webp';

export function sniffImage(bytes: Uint8Array): ImageKind | null {
  const b = (i: number) => bytes[i] ?? -1;
  if (b(0) === 0x89 && b(1) === 0x50 && b(2) === 0x4e && b(3) === 0x47) return 'png';
  if (b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff) return 'jpeg';
  // RIFF....WEBP
  if (
    b(0) === 0x52 &&
    b(1) === 0x49 &&
    b(2) === 0x46 &&
    b(3) === 0x46 &&
    b(8) === 0x57 &&
    b(9) === 0x45 &&
    b(10) === 0x42 &&
    b(11) === 0x50
  )
    return 'webp';
  return null;
}

export type PreparedImage = { ok: true; url: string; width: number; height: number } | { ok: false; error: string };

export async function prepareImage(
  file: File,
  opts: { maxBytes: number; maxSide: number; minSide: number; quality?: number },
): Promise<PreparedImage> {
  if (file.size > opts.maxBytes)
    return { ok: false, error: `الملف أكبر من ${Math.round(opts.maxBytes / 1024 / 1024)} ميغابايت.` };
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!sniffImage(head)) return { ok: false, error: 'الصيغ المقبولة: PNG أو JPG أو WebP.' };

  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    return { ok: false, error: 'تعذّرت قراءة الصورة — قد يكون الملف تالفاً.' };
  }
  try {
    if (Math.min(bmp.width, bmp.height) < opts.minSide)
      return { ok: false, error: `الصورة صغيرة؛ أقلّ ضلع ${opts.minSide} بكسل على الأقل.` };
    const scale = Math.min(1, opts.maxSide / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { ok: false, error: 'المتصفّح لا يدعم معالجة الصور.' };
    // خلفية بيضاء: الشفافية في PNG لا تتحوّل سواداً في JPEG
    ctx.fillStyle = '#fff'; // tokens-ignore: خلفية بكسلات الصورة المُصدَّرة، لا لون واجهة
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bmp, 0, 0, w, h);
    return { ok: true, url: canvas.toDataURL('image/jpeg', opts.quality ?? 0.85), width: w, height: h };
  } finally {
    bmp.close();
  }
}

/** صورة محفوظة صالحة للعرض: JPEG مُعاد ترميزه فقط (لا data:text/html ولا SVG) */
export function isSafeImageUrl(u: unknown): u is string {
  return typeof u === 'string' && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(u) && u.length < 1_500_000;
}
