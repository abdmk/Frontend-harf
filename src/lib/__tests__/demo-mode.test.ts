import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCurrentUser, setDemoSession } from '../auth';

// بناء الإنتاج: العرض التجريبي مطفأ
vi.mock('@/config/demo', () => ({ DEMO_MODE: false }));

describe('الجلسة في الإنتاج (العرض التجريبي مطفأ)', () => {
  beforeEach(() => localStorage.clear());

  it('الزائر بلا جلسة غير مسجّل — لا حساب وهمي', () => {
    expect(getCurrentUser()).toBeNull();
  });

  it('جلسة إدارة محفوظة سابقاً في المتصفّح لا تُقبل', () => {
    setDemoSession('admin');
    expect(getCurrentUser()).toBeNull();
    setDemoSession('newstudio');
    expect(getCurrentUser()).toBeNull();
  });

  it('الدخول من النموذج يبقى يعمل بالحساب المجاني أو الاستوديو', () => {
    setDemoSession('free');
    expect(getCurrentUser()?.role).not.toBe('admin');
    setDemoSession('studio');
    expect(getCurrentUser()).not.toBeNull();
    expect(getCurrentUser()?.role).not.toBe('admin');
  });
});
