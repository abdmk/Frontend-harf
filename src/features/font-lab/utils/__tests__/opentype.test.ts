import { readFileSync } from 'node:fs';

import { unzipSync } from 'fflate';
import * as fontkit from 'fontkit';
import { describe, expect, it } from 'vitest';

import type { LabFont } from '../../types';
import { analyzeOpenType } from '../opentype';

function amiri() {
  const files = unzipSync(new Uint8Array(readFileSync('public/downloads/fonts/amiri.zip')));
  const name = Object.keys(files).find((n) => /Amiri-Regular\.ttf$/.test(n))!;
  const kit = fontkit.create(Buffer.from(files[name]!)) as fontkit.Font;
  return { kit } as unknown as LabFont;
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
});
