import { asObject, createJsonStore } from '../lib/json-store';
import { isSafeImageUrl } from '../utils/image-upload';

/**
 * بيانات الحساب التي يعدّلها صاحبها: الاسم، الصورة، المهنة، الموقع، الرابط — لكل حساب بمعرّفه.
 * مصدر واحد: lib/auth يدمجها في المستخدم الحالي، فكل ما يعرض الاسم أو الصورة (الترويسة، القائمة،
 * بطاقة الاستوديو، الملف الشخصي…) يتحدّث فوراً من مكان واحد، ولا يتغيّر بتغيّر الخطة.
 * ⚠️ عرض: محفوظة في المتصفّح وحده؛ مع الخادم تصير حقول الحساب نفسه (والتحقّق يُعاد هناك).
 */
export type AccountProfile = {
  name?: string;
  profession?: string;
  location?: string;
  website?: string;
  /** صورة مُعاد ترميزها JPEG عند الرفع — لا يُقبل غير ذلك */
  avatar?: string;
};
type Profiles = Record<string, AccountProfile>;

const ID = /^u[-a-z0-9]{1,40}$/;
const text = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : undefined);

function parse(x: unknown): Profiles {
  const out: Profiles = {};
  for (const [id, raw] of Object.entries(asObject(x)).slice(0, 50)) {
    if (!ID.test(id)) continue;
    const r = asObject(raw);
    const website = text(r.website, 200);
    out[id] = {
      name: text(r.name, 80),
      profession: text(r.profession, 60),
      location: text(r.location, 60),
      website: website && /^https:\/\//.test(website) ? website : undefined,
      avatar: isSafeImageUrl(r.avatar) ? r.avatar : undefined,
    };
  }
  return out;
}

const store = createJsonStore<Profiles>('harf_account_profile', parse, {});

/** نقل الصورة المحفوظة بالمفتاح القديم (harf_account_photo) مرّة واحدة */
try {
  const old = localStorage.getItem('harf_account_photo');
  if (old) {
    const photos = asObject(JSON.parse(old));
    const next = { ...store.get() };
    for (const [id, url] of Object.entries(photos))
      if (ID.test(id) && isSafeImageUrl(url) && !next[id]?.avatar) next[id] = { ...next[id], avatar: url };
    store.set(next);
    localStorage.removeItem('harf_account_photo');
  }
} catch {
  /* التخزين غير متاح */
}

export const getAccountProfiles = store.get;
export const subscribeAccountProfiles = store.subscribe;

/** يحدّث حقول الحساب (undefined يزيل الحقل) — false إن امتلأ التخزين */
export function updateAccountProfile(userId: string, patch: Partial<AccountProfile>): boolean {
  if (!ID.test(userId)) return false;
  const all = store.get();
  const merged = parse({ [userId]: { ...all[userId], ...patch } })[userId] ?? {};
  return store.set({ ...all, [userId]: merged });
}

/** الأحرف الأولى من الاسم (للصورة البديلة) — «هبة عبدالحميد» ← «هع» */
export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0]![0]! + parts[1]![0]! : (parts[0] ?? '').slice(0, 2)).toUpperCase();
}
