import { describe, expect, it } from 'vitest';

import { validateFile, validateImportUrl } from '@/features/publishing/utils/validate';

describe('validateFile', () => {
  it('accepts the allowed formats', () => {
    for (const n of ['a.otf', 'b.TTF', 'c.pdf', 'd.zip']) expect(validateFile({ name: n, size: 10 })).toBeNull();
  });
  it('rejects other formats, empty files and files over 250MB', () => {
    expect(validateFile({ name: 'evil.exe', size: 10 })).toMatch(/صيغة/);
    expect(validateFile({ name: 'font.otf.exe', size: 10 })).toMatch(/صيغة/);
    expect(validateFile({ name: 'a.otf', size: 0 })).toMatch(/فارغ/);
    expect(validateFile({ name: 'a.zip', size: 251 * 1024 * 1024 })).toMatch(/250/);
  });
});

describe('validateImportUrl', () => {
  it('accepts public https links', () => {
    expect(validateImportUrl('https://example.com/fonts/a.zip').ok).toBe(true);
  });
  it.each([
    ['http://example.com/a.zip', /https/],
    ['javascript:alert(1)', /https/],
    ['https://user:pw@example.com/a.zip', /بيانات دخول/],
    ['https://localhost/a.zip', /عامّ/],
    ['https://10.0.0.1/a.zip', /عامّ/],
    ['https://[::1]/a.zip', /عامّ/],
    ['https://metadata.internal/a', /عامّ/],
    ['not a url', /غير صالح/],
  ])('rejects %s', (url, msg) => {
    const r = validateImportUrl(url);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(msg);
  });
});
