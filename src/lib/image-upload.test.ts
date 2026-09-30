import { describe, expect, it } from 'vitest';

import { isSafeImageUrl, sniffImage } from './image-upload';

const bytes = (...xs: number[]) => new Uint8Array([...xs, ...Array(16).fill(0)]);

describe('image-upload', () => {
  it('يتعرّف على الصيغ من البايتات', () => {
    expect(sniffImage(bytes(0x89, 0x50, 0x4e, 0x47))).toBe('png');
    expect(sniffImage(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe('jpeg');
    expect(sniffImage(bytes(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50))).toBe('webp');
    // SVG / HTML مقنّع بامتداد صورة
    expect(sniffImage(new TextEncoder().encode('<svg xmlns="http://'))).toBeNull();
    expect(sniffImage(new TextEncoder().encode('GIF89a'))).toBeNull();
  });

  it('لا يقبل للعرض إلا JPEG مُعاد ترميزه', () => {
    expect(isSafeImageUrl('data:image/jpeg;base64,/9j/4AAQ')).toBe(true);
    expect(isSafeImageUrl('data:image/svg+xml;base64,PHN2Zz4=')).toBe(false);
    expect(isSafeImageUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeImageUrl('https://evil.example/x.jpg')).toBe(false);
  });
});
