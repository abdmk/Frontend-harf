import { describe, expect, it } from 'vitest';

import { parseLegal } from '../parse';
import privacy from '../privacy.txt?raw';
import terms from '../terms.txt?raw';

describe('parseLegal', () => {
  it('يفصل المقدّمة والبنود ويرقّمها، ويجمع عناصر القائمة المتتالية', () => {
    const doc = parseLegal('مقدّمة\n\n## الأول\nفقرة\n* أ\n* ب\n### فرعي\n1. واحد\n2. اثنان\n## الثاني\nنص');
    expect(doc.intro).toEqual([{ type: 'p', text: 'مقدّمة' }]);
    expect(doc.sections.map((s) => [s.id, s.n, s.title])).toEqual([
      ['s-1', 1, 'الأول'],
      ['s-2', 2, 'الثاني'],
    ]);
    expect(doc.sections[0]!.blocks).toEqual([
      { type: 'p', text: 'فقرة' },
      { type: 'ul', items: ['أ', 'ب'] },
      { type: 'h', text: 'فرعي' },
      { type: 'ol', items: ['واحد', 'اثنان'] },
    ]);
  });

  it('النصّان الفعليّان: 26 بنداً للشروط و19 للخصوصية', () => {
    expect(parseLegal(terms).sections).toHaveLength(26);
    expect(parseLegal(privacy).sections).toHaveLength(19);
  });
});
