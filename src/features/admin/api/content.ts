import {
  announcementSchema,
  BANNERS_MAX,
  bannerSchema,
  ctaSchema,
  getSiteContent,
  saveSiteContent,
  type SiteContent,
} from '@/lib/site-content';

import { logAdmin } from './audit';
import { adminOrNull, type AdminResult, DENIED } from './guard';

/** حفظ محتوى الموقع بعد التحقّق من الدور والقيم — لا يُحفظ شيء لم يمرّ على المخطّط */
function save(action: string, target: string, next: SiteContent): AdminResult {
  const admin = adminOrNull();
  if (!admin) return DENIED;
  if (!saveSiteContent(next))
    return { ok: false, error: 'تعذّر الحفظ — مساحة التخزين ممتلئة. صغّر الصور أو احذف بنراً قديماً.' };
  logAdmin(admin.name, action, target);
  return { ok: true };
}

export function saveBanners(input: unknown[], action = 'تحديث البنرات'): AdminResult {
  if (input.length > BANNERS_MAX) return { ok: false, error: `${BANNERS_MAX} بنرات على الأكثر.` };
  const banners = [];
  for (const b of input) {
    const r = bannerSchema.safeParse(b);
    if (!r.success) return { ok: false, error: r.error.issues[0]?.message ?? 'بنر غير صالح.' };
    banners.push(r.data);
  }
  return save(action, `${banners.length} بنرات`, { ...getSiteContent(), banners });
}

export function saveAnnouncement(input: unknown): AdminResult {
  const r = announcementSchema.safeParse(input);
  if (!r.success) return { ok: false, error: r.error.issues[0]?.message ?? 'بيانات غير صالحة.' };
  if (r.data.active && !r.data.text) return { ok: false, error: 'اكتب نصّ الإعلان قبل تفعيله.' };
  return save('تحديث شريط الإعلان', r.data.active ? 'مفعّل' : 'معطّل', { ...getSiteContent(), announcement: r.data });
}

export function saveCta(input: unknown): AdminResult {
  const r = ctaSchema.safeParse(input);
  if (!r.success) return { ok: false, error: r.error.issues[0]?.message ?? 'بيانات غير صالحة.' };
  return save('تحديث دعوة التواصل', r.data.title, { ...getSiteContent(), cta: r.data });
}

export const newBannerId = () => `b-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
