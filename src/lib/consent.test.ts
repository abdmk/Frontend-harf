import { beforeEach, describe, expect, it } from 'vitest';

import { getConsent, hasConsent, saveConsent } from './consent';

describe('consent', () => {
  beforeEach(() => localStorage.clear());

  it('بلا اختيار: غير الضروري معطّل', () => {
    expect(getConsent()).toBeNull();
    expect(hasConsent('analytics')).toBe(false);
    expect(hasConsent('marketing')).toBe(false);
  });

  it('يحفظ الاختيار ويقرؤه', () => {
    saveConsent({ analytics: true, marketing: false });
    expect(hasConsent('analytics')).toBe(true);
    expect(hasConsent('marketing')).toBe(false);
    expect(getConsent()?.at).toMatch(/^\d{4}-/);
  });

  it('قيمة معدّلة أو من نسخة أخرى لا تُعدّ موافقة', () => {
    localStorage.setItem('harf_consent', JSON.stringify({ v: 1, analytics: 'yes', marketing: true, at: 'x' }));
    expect(hasConsent('marketing')).toBe(false);
    localStorage.setItem('harf_consent', JSON.stringify({ v: 0, analytics: true, marketing: true, at: 'x' }));
    expect(hasConsent('analytics')).toBe(false);
    localStorage.setItem('harf_consent', '{bad json');
    expect(getConsent()).toBeNull();
  });
});
