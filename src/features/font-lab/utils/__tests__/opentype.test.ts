import { readFileSync } from 'node:fs';

import { unzipSync } from 'fflate';
import * as fontkit from 'fontkit';
import { describe, expect, it } from 'vitest';

import { missingChars } from '../../data/specimens';
import type { LabFont } from '../../types';
import { analyzeOpenType, glyphNames } from '../opentype';

function amiri() {
  const files = unzipSync(new Uint8Array(readFileSync('public/downloads/fonts/amiri.zip')));
  const name = Object.keys(files).find((n) => /Amiri-Regular\.ttf$/.test(n))!;
  const kit = fontkit.create(Buffer.from(files[name]!)) as fontkit.Font;
  return { kit, glyphCount: kit.numGlyphs } as unknown as LabFont;
}

describe('محلّل OpenType', () => {
  it('Amiri: أسماء المجموعات الأسلوبية من الملف بالعربية، وأزواج قبل/بعد، وربطات، ولغات', () => {
    const r = analyzeOpenType(amiri());
    const ss01 = r.features.find((f) => f.tag === 'ss01')!;
    expect(ss01.name).toBe('خفض نقطة الباء المسبوقة براء أو واو');
    expect(ss01.kind).toBe('سياقي');
    expect(ss01.pairs.length).toBeGreaterThan(0);
    expect(ss01.sample.length).toBeGreaterThan(0);
    expect(r.ligatures.length).toBeGreaterThan(0);
    expect(r.scripts.find((s) => s.tag === 'arab')?.langs).toContain('URD');
    expect(r.features.some((f) => f.table === 'GPOS')).toBe(true);
  });

  it('Amiri بلا أسماء محارف (post v3): تُشتقّ من cmap وميزات الأشكال', () => {
    const font = amiri();
    const names = glyphNames(font);
    const beh = font.kit.glyphForCodePoint(0x0628).id;
    expect(names.get(beh)).toBe('uni0628');
    const values = [...names.values()];
    expect(values).toContain('uni0628.init');
    expect(values).toContain('uni0628.fina');
    expect(values.some((v) => v.includes('_'))).toBe(true); // ربطة
  });
});

describe('الحروف الناقصة', () => {
  it('تسمّي ما ليس في الخط وتتجاهل المسافات', () => {
    const cps = new Set([...'ابت'].map((c) => c.codePointAt(0)!));
    expect(missingChars('اب ت\nپ چ ب', cps)).toEqual(['پ', 'چ']);
  });
});
