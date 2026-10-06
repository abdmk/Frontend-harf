import { describe, expect, it } from 'vitest';

import { checkSvgText } from '../svg-check';

const svg = (inner: string, attrs = 'viewBox="0 0 400 200"') =>
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ${attrs}>${inner}</svg>`;

describe('فحص مخطوطة SVG', () => {
  it('يقبل رسماً عادياً ويقرأ أبعاده من viewBox', () => {
    expect(checkSvgText(svg('<path d="M0 0L10 10"/><use href="#a"/>'))).toEqual({
      ok: true,
      width: 400,
      height: 200,
      elements: 2,
    });
  });

  it.each([
    ['سكربت', svg('<script>alert(1)</script>')],
    ['سمة on*', svg('<path d="M0 0" onclick="alert(1)"/>')],
    ['foreignObject', svg('<foreignObject><div>x</div></foreignObject>')],
    ['رابط خارجي', svg('<image href="https://evil.example/x.png"/>')],
    ['javascript:', svg('<a href="javascript:alert(1)"><path d="M0 0"/></a>')],
    ['url() خارجي', svg('<rect fill="url(https://evil.example/p)"/>')],
    ['@import', svg('<style>@import url(https://evil.example/a.css);</style><path d="M0 0"/>')],
    ['DOCTYPE', `<!DOCTYPE svg [<!ENTITY a "x">]>${svg('<path d="M0 0"/>')}`],
    ['بلا أبعاد', svg('<path d="M0 0"/>', '')],
    ['ليس SVG', '<html><body>x</body></html>'],
  ])('يرفض: %s', (_, text) => {
    expect(checkSvgText(text).ok).toBe(false);
  });
});
