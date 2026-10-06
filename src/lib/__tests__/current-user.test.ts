import { beforeEach, describe, expect, it } from 'vitest';

import { setAccountPlan } from '../../stores/account-overrides';
import { updateAccountProfile } from '../../stores/account-profile';
import { getCurrentUser, setDemoSession } from '../auth';

describe('مصدر واحد لبيانات المستخدم', () => {
  beforeEach(() => {
    localStorage.clear();
    setDemoSession('free');
  });

  it('تعديل الاسم والمهنة يظهر في المستخدم الحالي، والأحرف الأولى تتبع الاسم', () => {
    expect(updateAccountProfile('u-heba', { name: 'ريم سالم', profession: 'مصممة خطوط' })).toBe(true);
    const u = getCurrentUser()!;
    expect(u.name).toBe('ريم سالم');
    expect(u.profession).toBe('مصممة خطوط');
    expect(u.initials).toBe('رس');
  });

  it('تغيير الخطة يبقي الشخص نفسه: الاسم والصورة والبريد لا ترجع لقيم قديمة', () => {
    const photo = 'data:image/jpeg;base64,AAAA';
    updateAccountProfile('u-heba', { name: 'ريم سالم', avatar: photo });
    const before = getCurrentUser()!;
    expect(setAccountPlan(before.id, 'basic')).toBe(true);
    let u = getCurrentUser()!;
    expect([u.id, u.name, u.email, u.avatarUrl, u.plan]).toEqual([before.id, 'ريم سالم', before.email, photo, 'basic']);
    expect(u.usage.downloads.limit).toBeNull(); // المدفوعة بلا حدّ
    setAccountPlan(u.id, 'free');
    u = getCurrentUser()!;
    expect([u.name, u.avatarUrl, u.plan]).toEqual(['ريم سالم', photo, 'free']);
    expect(u.usage.downloads.limit).not.toBeNull();
  });

  it('المرجع ثابت ما لم يتغيّر شيء (يتطلّبه useSyncExternalStore)', () => {
    expect(getCurrentUser()).toBe(getCurrentUser());
  });

  it('مدخلات غير آمنة لا تُحفظ: صورة ليست JPEG مُعاد ترميزها، ورابط غير https', () => {
    updateAccountProfile('u-heba', { avatar: 'javascript:alert(1)', website: 'http://x.com' });
    const u = getCurrentUser()!;
    expect(u.avatarUrl).toBe('/avatars/heba.webp');
    expect(u.website).toBeUndefined();
  });
});
