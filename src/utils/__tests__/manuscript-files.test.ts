import { readdirSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import data from '@/testing/mocks/manuscripts.data.json';

import { checkSvgText } from '../svg-check';

/** كل مخطوطة تجريبية: ملفّها موجود وآمن، وأبعادها وحجمها في البيان تطابق الملف، ولا معرّف مكرّر */
describe('المخطوطات التجريبية', () => {
  const files = new Set(readdirSync('public/manuscripts'));

  it('لا معرّفات مكرّرة', () => {
    const ids = data.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(data.map((m) => [m.id, m] as const))('%s: ملف SVG آمن ومطابق للبيان', (id, m) => {
    expect(files.has(`${id}.svg`)).toBe(true);
    const text = readFileSync(`public/manuscripts/${id}.svg`, 'utf8');
    const check = checkSvgText(text);
    expect(check.ok).toBe(true);
    if (check.ok) expect([check.width, check.height]).toEqual([m.width, m.height]);
    expect(Buffer.byteLength(text)).toBe(m.bytes);
  });
});
