import { describe, expect, it } from 'vitest';

import { binarize, crop, inkBounds, inkMask, otsuThreshold, type Pixels, resample, toGray } from '../image';
import { signature, similarity } from '../score';

type Box = [x: number, y: number, w: number, h: number];

/** صورة اختبار: خلفية بلون، ومستطيلات «حبر» بلون آخر */
function draw(width: number, height: number, boxes: Box[], ink = 20, bg = 240, alpha = 255): Pixels {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) data.set([bg, bg, bg, alpha], i * 4);
  for (const [bx, by, bw, bh] of boxes)
    for (let y = by; y < by + bh; y++)
      for (let x = bx; x < bx + bw; x++) data.set([ink, ink, ink, 255], (y * width + x) * 4);
  return { width, height, data };
}

// «كلمتان» مختلفتا الشكل بالنسبة نفسها تقريباً
const WORD: Box[] = [
  [10, 20, 6, 30],
  [22, 38, 30, 6],
  [58, 30, 8, 14],
  [72, 38, 24, 6],
];
const OTHER: Box[] = [
  [10, 20, 40, 8],
  [10, 42, 40, 8],
  [60, 20, 36, 30],
];

describe('image', () => {
  it('toGray يركّب الشفافية فوق الأبيض', () => {
    const g = toGray(draw(2, 1, [], 0, 0, 0));
    expect(g[0]).toBeCloseTo(255);
  });

  it('otsuThreshold يقع بين لوني الحبر والخلفية', () => {
    const t = otsuThreshold(toGray(draw(40, 40, [[5, 5, 10, 10]])));
    expect(t).toBeGreaterThanOrEqual(20);
    expect(t).toBeLessThan(240);
  });

  it('binarize يكتشف الكتابة الفاتحة على خلفية داكنة ويقلبها', () => {
    const dark = draw(40, 40, [[10, 10, 10, 10]], 250, 10);
    const { mask, lightInk } = binarize(toGray(dark), 40, 40);
    expect(lightInk).toBe(true);
    expect(mask.data[15 * 40 + 15]).toBe(1);
    expect(mask.data[0]).toBe(0);
  });

  it('inkBounds يحدّ الحبر ويتجاهل الغبار الأقل من الحدّ', () => {
    const px = draw(60, 40, [
      [10, 12, 20, 8],
      [55, 2, 1, 1],
    ]);
    const { mask } = binarize(toGray(px), 60, 40);
    expect(inkBounds(mask, 2)).toEqual({ x: 10, y: 12, w: 20, h: 8 });
    expect(inkBounds(mask, 1)?.w).toBe(46);
  });

  it('inkMask يعيد null لصورة بلا حبر', () => {
    expect(inkMask(draw(20, 20, []))).toBeNull();
  });

  it('crop وresample يحافظان على نسبة التغطية', () => {
    const { mask } = binarize(toGray(draw(20, 20, [[0, 0, 10, 20]])), 20, 20);
    const half = resample(crop(mask, { x: 0, y: 0, w: 20, h: 20 }), 2, 1);
    expect(half.data[0]).toBeCloseTo(1);
    expect(half.data[1]).toBeCloseTo(0);
  });
});

describe('similarity', () => {
  const sig = (boxes: Box[], w = 110, h = 70, scale = 1) => {
    const scaled = boxes.map(([x, y, bw, bh]) => [x * scale, y * scale, bw * scale, bh * scale] as Box);
    return signature(inkMask(draw(w * scale, h * scale, scaled))!.mask);
  };

  it('الشكل مع نفسه 100', () => {
    expect(similarity(sig(WORD), sig(WORD))).toBe(100);
  });

  it('لا يتأثّر بالحجم ولا بالهوامش ولا باتجاه الألوان', () => {
    const big = sig(WORD, 110, 70, 3);
    const padded = signature(
      inkMask(
        draw(
          300,
          200,
          WORD.map(([x, y, w, h]) => [x + 90, y + 60, w, h] as Box),
        ),
      )!.mask,
    );
    const inverted = signature(inkMask(draw(110, 70, WORD, 240, 15))!.mask);
    for (const s of [big, padded, inverted]) expect(similarity(sig(WORD), s)).toBeGreaterThanOrEqual(90);
  });

  it('شكل مختلف أبعد من الشكل نفسه', () => {
    const self = similarity(sig(WORD), sig(WORD, 110, 70, 2));
    const other = similarity(sig(WORD), sig(OTHER));
    expect(other).toBeLessThan(self - 20);
  });

  it('حتمي وفي النطاق 0..100', () => {
    const a = similarity(sig(WORD), sig(OTHER));
    expect(similarity(sig(WORD), sig(OTHER))).toBe(a);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThanOrEqual(100);
  });
});
