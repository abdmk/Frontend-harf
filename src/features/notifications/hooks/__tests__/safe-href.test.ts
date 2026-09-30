import { describe, expect, it } from 'vitest';

import { safeHref } from '../use-notifications';

describe('safeHref', () => {
  it('يقبل المسارات الداخلية فقط', () => {
    expect(safeHref('/studio')).toBe('/studio');
    expect(safeHref('/fonts/tajarib?x=1')).toBe('/fonts/tajarib?x=1');
    for (const bad of [
      'https://evil.com',
      '//evil.com',
      '/\\\\evil.com',
      'javascript:alert(1)',
      'studio',
      '',
      undefined,
    ])
      expect(safeHref(bad)).toBeUndefined();
  });
});
