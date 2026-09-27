import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { cn } from '../cn';

describe('cn مع رموز حرف', () => {
  it('يبقي حجم الخطّ واللون معاً', () => {
    expect(cn('text-caption text-white')).toBe('text-caption text-white');
    expect(cn('text-meta', 'text-muted-foreground')).toBe('text-meta text-muted-foreground');
  });

  it('يحلّ التعارض بين حجمين', () => {
    expect(cn('text-caption', 'text-lead')).toBe('text-lead');
    expect(cn('text-sm', 'text-meta')).toBe('text-meta');
  });

  it('الظلال المخصّصة', () => {
    expect(cn('shadow-soft', 'shadow-overlay')).toBe('shadow-overlay');
    expect(cn('shadow-soft ring-primary')).toBe('shadow-soft ring-primary');
  });
});

describe('كل أحجام الخطّ في tokens.css معروفة لـcn', () => {
  const css = readFileSync(join(__dirname, '../../design-system/tokens.css'), 'utf8');
  const sizes = [...css.matchAll(/--text-([\w-]+?):/g)].map((m) => m[1]).filter((n) => !n.includes('--'));
  it.each(sizes)('text-%s', (size) => {
    expect(cn(`text-${size} text-white`)).toBe(`text-${size} text-white`);
  });
});
