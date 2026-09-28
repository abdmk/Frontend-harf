import { blur, type Mask, resample } from './image';

/**
 * بصمة شكل الكتابة — كل ما يلزم للمقارنة، محسوباً مرّة واحدة لكل صورة ولكل خط مرسوم:
 *  grid     القناع على شبكة ثابتة (الشكل العام، مع تنعيم يسامح الإزاحة)
 *  cols     توزيع الحبر أفقياً (مواضع الحروف والفراغات)
 *  rows     توزيع الحبر رأسياً (خط الأساس، الصواعد والنوازل)
 *  stroke   متوسّط سماكة الضربة نسبةً للارتفاع
 *  aspect   العرض ÷ الارتفاع
 */
export type Signature = {
  grid: Float32Array;
  cols: Float32Array;
  rows: Float32Array;
  stroke: number;
  aspect: number;
  density: number;
};

const GW = 160;
const GH = 40;
const NORM_H = 64;

export function signature(mask: Mask): Signature {
  const aspect = mask.width / mask.height;
  const grid = blur(resample(mask, GW, GH), 1).data;

  const cols = new Float32Array(GW);
  const rows = new Float32Array(GH);
  for (let y = 0; y < GH; y++)
    for (let x = 0; x < GW; x++) {
      const v = grid[y * GW + x]!;
      cols[x]! += v;
      rows[y]! += v;
    }

  // السماكة: متوسّط طول مقاطع الحبر الرأسية على ارتفاع موحّد
  const norm = resample(mask, Math.max(1, Math.round(aspect * NORM_H)), NORM_H);
  let runs = 0;
  let inked = 0;
  for (let x = 0; x < norm.width; x++) {
    let inRun = false;
    for (let y = 0; y < NORM_H; y++) {
      const on = norm.data[y * norm.width + x]! >= 0.5;
      if (on) inked++;
      if (on && !inRun) runs++;
      inRun = on;
    }
  }
  const stroke = runs ? inked / runs / NORM_H : 0;
  const density = inked / (norm.width * NORM_H);

  return { grid, cols, rows, stroke, aspect, density };
}

function correlation(a: Float32Array, b: Float32Array) {
  const n = a.length;
  let ma = 0;
  let mb = 0;
  for (let i = 0; i < n; i++) {
    ma += a[i]!;
    mb += b[i]!;
  }
  ma /= n;
  mb /= n;
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i]! - ma;
    const y = b[i]! - mb;
    num += x * y;
    da += x * x;
    db += y * y;
  }
  if (!da || !db) return da === db ? 1 : 0;
  return Math.max(0, num / Math.sqrt(da * db));
}

/** تقاطع/اتحاد ليّن للقناعين — 1 متطابقان */
function softIoU(a: Float32Array, b: Float32Array) {
  let inter = 0;
  let union = 0;
  for (let i = 0; i < a.length; i++) {
    inter += Math.min(a[i]!, b[i]!);
    union += Math.max(a[i]!, b[i]!);
  }
  return union ? inter / union : 1;
}

const ratio = (a: number, b: number) => (a <= 0 || b <= 0 ? (a === b ? 1 : 0) : Math.min(a, b) / Math.max(a, b));

export type Breakdown = { shape: number; layout: number; stroke: number; proportion: number };

/** مكوّنات التشابه 0..1 — تُعرض للمستخدم ليفهم لماذا اقترحنا هذا الخط */
export function compare(a: Signature, b: Signature): Breakdown {
  return {
    shape: softIoU(a.grid, b.grid),
    layout: (correlation(a.cols, b.cols) + correlation(a.rows, b.rows)) / 2,
    stroke: (ratio(a.stroke, b.stroke) + ratio(a.density, b.density)) / 2,
    proportion: Math.exp(-Math.abs(Math.log(a.aspect / b.aspect)) * 2.5),
  };
}

/**
 * درجة التشابه 0..100. الأوزان والمعايرة تجريبية على خطوط المكتبة: نصّ مطابق بالخط نفسه
 * يحسب ~90+، وخط من عائلة أسلوبية مختلفة ~40–60.
 */
export function similarity(a: Signature, b: Signature): number {
  const c = compare(a, b);
  const raw = 0.42 * c.shape + 0.23 * c.layout + 0.2 * c.stroke + 0.15 * c.proportion;
  const calibrated = (raw - 0.35) / (0.95 - 0.35);
  return Math.round(Math.max(0, Math.min(1, calibrated)) * 100);
}
