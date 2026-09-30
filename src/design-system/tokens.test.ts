import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { breakpoints, duration, easing, surface } from './tokens';

const css = readFileSync(join(__dirname, 'tokens.css'), 'utf8');
/** كتلة المحدِّد — ‎:root‎ مشترك مع جزيرة ‎.light‎ («:root,\n.light {») */
const block = (selector: string) => {
  const m = new RegExp(`(^|\\n)${selector.replace('.', '\\.')}(,[^{]*)? \\{`).exec(css);
  const start = m ? m.index : -1;
  return css.slice(start, css.indexOf('\n}', start));
};
const cssVar = (scope: string, name: string) => new RegExp(`--${name}:\\s*([^;]+);`).exec(scope)?.[1].trim();

describe('tokens.ts ↔ tokens.css', () => {
  it('أرضية الصفحة', () => {
    expect(cssVar(block(':root'), 'background')).toBe(surface.light);
    expect(cssVar(block('.dark'), 'background')).toBe(surface.dark);
  });

  it('مدد الحركة', () => {
    for (const [k, ms] of Object.entries(duration)) expect(cssVar(css, `dur-${k}`)).toBe(`${ms}ms`);
  });

  it('المنحنيات', () => {
    expect(cssVar(css, 'ease-out-quint')).toBe(easing.outQuint);
    expect(cssVar(css, 'ease-pop')).toBe(easing.pop);
    expect(cssVar(css, 'ease-in-out-strong')).toBe(easing.inOutStrong);
  });

  it('نقطة التحوّل الإضافية xs', () => {
    expect(cssVar(css, 'breakpoint-xs')).toBe(`${breakpoints.xs}px`);
  });
});
