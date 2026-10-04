import { isSafeImageUrl } from './image-upload';
import { asObject, createJsonStore } from './json-store';

/**
 * صورة الحساب — واحدة لكل مستخدم، مربوطة بمعرّفه لا بخطّته: تغيير الخطة أو الرجوع إليها لا يغيّرها.
 * تُحدَّث من «الملف الشخصي» (صورة الصفحة العامة) وتظهر في الترويسة وقائمة الحساب وبطاقة الاستوديو.
 * ⚠️ عرض: في المتصفّح وحده؛ مع الخادم تُرفع إلى التخزين (بعد الفحص وإعادة الترميز) ويُحفظ رابطها في الحساب.
 * الصورة نفسها أُعيد ترميزها JPEG عند الرفع (prepareImage) — ولا يُقبل هنا إلا ذلك (isSafeImageUrl).
 */
type Photos = Record<string, string>;

const store = createJsonStore<Photos>(
  'harf_account_photo',
  (x) => {
    const out: Photos = {};
    for (const [id, url] of Object.entries(asObject(x)).slice(0, 20))
      if (/^[\w-]{1,64}$/.test(id) && isSafeImageUrl(url)) out[id] = url;
    return out;
  },
  {},
);

/** يحفظ صورة الحساب أو يزيلها (undefined) — false إن امتلأ التخزين */
export function setAccountPhoto(userId: string, url: string | undefined): boolean {
  const next = { ...store.get() };
  if (url && isSafeImageUrl(url)) next[userId] = url;
  else delete next[userId];
  return store.set(next);
}

export function useAccountPhoto(userId: string | undefined): string | undefined {
  const all = store.use();
  return userId ? all[userId] : undefined;
}
