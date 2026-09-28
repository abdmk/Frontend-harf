/**
 * معالجة صورة الكتابة إلى «قناع حبر» قابل للمقارنة — دوال نقية تعمل على بكسلات RGBA
 * (نفس شكل ImageData) حتى تُختبر بلا متصفّح.
 */

export type Pixels = { width: number; height: number; data: Uint8ClampedArray };
/** قناع بقيم 0..1 (1 = حبر) */
export type Mask = { width: number; height: number; data: Float32Array };
export type Rect = { x: number; y: number; w: number; h: number };
export type Polarity = 'auto' | 'dark-on-light' | 'light-on-dark';

/** الإضاءة 0..255، والشفافية تُركَّب فوق الأبيض (شعار PNG بخلفية شفافة) */
export function toGray({ width, height, data }: Pixels): Float32Array {
  const out = new Float32Array(width * height);
  for (let i = 0, p = 0; i < out.length; i++, p += 4) {
    const a = data[p + 3]! / 255;
    const lum = 0.299 * data[p]! + 0.587 * data[p + 1]! + 0.114 * data[p + 2]!;
    out[i] = lum * a + 255 * (1 - a);
  }
  return out;
}

/** عتبة Otsu: تفصل الحبر عن الخلفية بأفضل تباين بين المجموعتين */
export function otsuThreshold(gray: Float32Array): number {
  const hist = new Array<number>(256).fill(0);
  for (const v of gray) hist[Math.max(0, Math.min(255, Math.round(v)))]!++;
  const total = gray.length;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i]!;
  let sumB = 0;
  let wB = 0;
  let best = 0;
  let threshold = 127;
  for (let t = 0; t < 256; t++) {
    wB += hist[t]!;
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += t * hist[t]!;
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) ** 2;
    if (between > best) {
      best = between;
      threshold = t;
    }
  }
  return threshold;
}

/**
 * يحوّل الإضاءة إلى قناع حبر. الاتجاه التلقائي: لون الإطار هو الخلفية — فالكتابة الفاتحة
 * على خلفية داكنة تُقلب تلقائياً.
 */
export function binarize(
  gray: Float32Array,
  width: number,
  height: number,
  polarity: Polarity = 'auto',
): { mask: Mask; lightInk: boolean } {
  const t = otsuThreshold(gray);
  let lightInk = polarity === 'light-on-dark';
  if (polarity === 'auto') {
    let dark = 0;
    let n = 0;
    const edge = (i: number) => {
      n++;
      if (gray[i]! <= t) dark++;
    };
    for (let x = 0; x < width; x++) {
      edge(x);
      edge((height - 1) * width + x);
    }
    for (let y = 1; y < height - 1; y++) {
      edge(y * width);
      edge(y * width + width - 1);
    }
    lightInk = dark > n / 2;
  }
  const data = new Float32Array(width * height);
  for (let i = 0; i < data.length; i++) data[i] = (lightInk ? gray[i]! > t : gray[i]! <= t) ? 1 : 0;
  return { mask: { width, height, data }, lightInk };
}

/**
 * حدود الحبر. يتجاهل الصفوف والأعمدة التي حبرها أقلّ من `minInk` بكسل — فنقطة غبار
 * في الزاوية لا تمدّ الإطار.
 */
export function inkBounds(mask: Mask, minInk = 1): Rect | null {
  const { width, height, data } = mask;
  const rows = new Array<number>(height).fill(0);
  const cols = new Array<number>(width).fill(0);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const v = data[y * width + x]!;
      rows[y]! += v;
      cols[x]! += v;
    }
  const first = (a: number[]) => a.findIndex((v) => v >= minInk);
  const last = (a: number[]) => a.length - 1 - [...a].reverse().findIndex((v) => v >= minInk);
  const y0 = first(rows);
  const x0 = first(cols);
  if (y0 < 0 || x0 < 0) return null;
  const y1 = last(rows);
  const x1 = last(cols);
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

export function crop(mask: Mask, r: Rect): Mask {
  const x0 = Math.max(0, Math.floor(r.x));
  const y0 = Math.max(0, Math.floor(r.y));
  const w = Math.max(1, Math.min(mask.width - x0, Math.round(r.w)));
  const h = Math.max(1, Math.min(mask.height - y0, Math.round(r.h)));
  const data = new Float32Array(w * h);
  for (let y = 0; y < h; y++)
    data.set(mask.data.subarray((y0 + y) * mask.width + x0, (y0 + y) * mask.width + x0 + w), y * w);
  return { width: w, height: h, data };
}

/** إعادة تحجيم بمتوسّط المساحة — القيم تبقى نسبة تغطية 0..1 */
export function resample(mask: Mask, width: number, height: number): Mask {
  const out = new Float32Array(width * height);
  const sx = mask.width / width;
  const sy = mask.height / height;
  for (let y = 0; y < height; y++) {
    const ya = y * sy;
    const yb = ya + sy;
    for (let x = 0; x < width; x++) {
      const xa = x * sx;
      const xb = xa + sx;
      let sum = 0;
      let area = 0;
      for (let yy = Math.floor(ya); yy < Math.min(mask.height, Math.ceil(yb)); yy++) {
        const hy = Math.min(yb, yy + 1) - Math.max(ya, yy);
        for (let xx = Math.floor(xa); xx < Math.min(mask.width, Math.ceil(xb)); xx++) {
          const wx = Math.min(xb, xx + 1) - Math.max(xa, xx);
          const a = wx * hy;
          sum += mask.data[yy * mask.width + xx]! * a;
          area += a;
        }
      }
      out[y * width + x] = area ? sum / area : 0;
    }
  }
  return { width, height, data: out };
}

/** تنعيم صندوقي — يسامح إزاحة بكسل أو اثنين بين الصورة والخط المرسوم */
export function blur(mask: Mask, r: number): Mask {
  const { width, height, data } = mask;
  const tmp = new Float32Array(data.length);
  const out = new Float32Array(data.length);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      let s = 0;
      let n = 0;
      for (let k = -r; k <= r; k++) {
        const xx = x + k;
        if (xx >= 0 && xx < width) {
          s += data[y * width + xx]!;
          n++;
        }
      }
      tmp[y * width + x] = s / n;
    }
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      let s = 0;
      let n = 0;
      for (let k = -r; k <= r; k++) {
        const yy = y + k;
        if (yy >= 0 && yy < height) {
          s += tmp[yy * width + x]!;
          n++;
        }
      }
      out[y * width + x] = s / n;
    }
  return { width, height, data: out };
}

/** من بكسلات إلى قناع مقصوص على الحبر فقط — المسار نفسه للصورة وللخط المرسوم */
export function inkMask(px: Pixels, polarity: Polarity = 'auto'): { mask: Mask; lightInk: boolean } | null {
  const { mask, lightInk } = binarize(toGray(px), px.width, px.height, polarity);
  const noise = Math.max(1, Math.round(Math.min(px.width, px.height) / 400));
  const box = inkBounds(mask, noise);
  if (!box) return null;
  return { mask: crop(mask, box), lightInk };
}
