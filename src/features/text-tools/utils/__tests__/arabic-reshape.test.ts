import { describe, expect, it } from 'vitest';

import { prepareArabic, reverseVisual, shapeArabic, simulateBroken, stripMarks } from '../arabic-reshape';

const cp = (s: string) => Array.from(s).map((c) => c.codePointAt(0)!.toString(16));

describe('shapeArabic', () => {
  it('يختار أول/وسط/آخر لكلمة متّصلة', () => {
    // ب (أول) ي (وسط) ت (آخر)
    expect(cp(shapeArabic('بيت'))).toEqual(['fe91', 'fef4', 'fe96']);
  });

  it('الحروف التي لا تتّصل بما بعدها تقطع الاتصال', () => {
    // د (منفرد) ا (منفرد لأنّ الدال لا تتّصل بما بعدها) ر (منفرد)
    expect(cp(shapeArabic('دار'))).toEqual(['fea9', 'fe8d', 'fead']);
  });

  it('لام‑ألف حرف واحد، منفرد أو متّصل بما قبله', () => {
    expect(cp(shapeArabic('لا'))).toEqual(['fefb']);
    expect(cp(shapeArabic('سلام'))).toEqual(['feb3', 'fefc', 'fee1']);
  });

  it('الحركات شفّافة ولا تقطع الاتصال', () => {
    const out = cp(shapeArabic('بَت'));
    expect(out[0]).toBe('fe91');
    expect(out[2]).toBe('fe96');
  });

  it('يترك غير العربي كما هو', () => {
    expect(shapeArabic('Harf 2026')).toBe('Harf 2026');
  });
});

describe('reverseVisual', () => {
  it('يعكس العربي ويُبقي اللاتيني والأرقام على ترتيبها', () => {
    expect(reverseVisual('خط Harf 2026')).toBe('Harf 2026 طخ');
    expect(reverseVisual('سعر 25 دولار')).toBe('رالود 25 رعس');
  });

  it('يقلب الأقواس ويحافظ على ترتيب الأسطر', () => {
    expect(reverseVisual('(أ)\nب')).toBe('(أ)\nب');
    expect(reverseVisual('أ (ب)')).toBe('(ب) أ');
  });

  it('الحركة تبقى بعد حرفها', () => {
    expect(reverseVisual('بَت')).toBe('تبَ');
  });
});

describe('prepareArabic', () => {
  it('يطبّق الخطوتين معاً أو كلّاً وحدها', () => {
    expect(prepareArabic('لا', { shape: false, reverse: false })).toBe('لا');
    expect(prepareArabic('لا', { shape: true, reverse: true })).toBe('ﻻ');
  });
});

describe('stripMarks', () => {
  it('يحذف الحركات ويُبقي الحروف واللاتيني', () => {
    expect(stripMarks('مُحَمَّدٌ Harf')).toBe('محمد Harf');
  });

  it('prepareArabic يحذف التشكيل قبل الوصل فلا ينقطع الاتصال', () => {
    expect(prepareArabic('بَت', { shape: true, reverse: false, strip: true })).toBe(shapeArabic('بت'));
  });
});

describe('simulateBroken', () => {
  it('يفصل كل حرف عربي بـZWNJ ويترك الترتيب واللاتيني', () => {
    expect(simulateBroken('بت A')).toBe('ب\u200cت\u200c A');
  });

  it('لا يفصل الحرف عن حركته', () => {
    expect(simulateBroken('بَ')).toBe('بَ\u200c');
  });

  it('يحافظ على الأسطر', () => {
    expect(simulateBroken('ب\nت').split('\n')).toHaveLength(2);
  });
});
