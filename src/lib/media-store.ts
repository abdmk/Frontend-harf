import { useEffect, useState } from 'react';

import { checkSvgText, MAX_SVG_BYTES } from '@/utils/svg-check';

/**
 * فيديوهات المقالات: تُفحص بايتاتها الأولى (MP4/WebM فقط) وتُخزَّن في IndexedDB بهذا المتصفّح،
 * وتُعرض عبر blob: محلّي. ⚠️ عرض: في المنتج تُرفع إلى تخزين الملفات بعد فحصها على الخادم
 * (ونوصي بإعادة ترميزها هناك)، ويُحفظ في المقال رابطها فقط.
 */
export const VIDEO_MAX_BYTES = 50 * 1024 * 1024;
const DB = 'harf-media';
const STORE = 'videos';
/** وثائق التوثيق (صور الهوية والتوقيع) — مخزن منفصل كي لا تختلط بوسائط المقالات */
const DOCS = 'docs';
/** ملفات المخطوطات المرفوعة (SVG) — أكبر من أن تتّسع لها localStorage */
const MANUSCRIPTS = 'manuscripts';
type StoreName = typeof STORE | typeof DOCS | typeof MANUSCRIPTS;

export type VideoKind = 'mp4' | 'webm';

/** MP4: «ftyp» عند البايت 4 — WebM/Matroska: 1A 45 DF A3 */
export function sniffVideo(b: Uint8Array): VideoKind | null {
  if (b.length >= 8 && b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) return 'mp4';
  if (b.length >= 4 && b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return 'webm';
  return null;
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 3);
    req.onupgradeneeded = () => {
      for (const name of [STORE, DOCS, MANUSCRIPTS])
        if (!req.result.objectStoreNames.contains(name)) req.result.createObjectStore(name);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>,
  store: StoreName = STORE,
): Promise<T> {
  const db = await open();
  try {
    return await new Promise<T>((resolve, reject) => {
      const req = fn(db.transaction(store, mode).objectStore(store));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

export type StoredVideo = { ok: true; id: string } | { ok: false; error: string };

export async function storeVideo(file: File): Promise<StoredVideo> {
  if (file.size > VIDEO_MAX_BYTES) return { ok: false, error: 'الفيديو أكبر من 50 ميغابايت.' };
  const kind = sniffVideo(new Uint8Array(await file.slice(0, 16).arrayBuffer()));
  if (!kind) return { ok: false, error: 'الصيغ المقبولة: MP4 أو WebM.' };
  const id = `v-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  // نحفظ بنوع مُشتقّ من البايتات لا من اسم الملف أو نوعه المُعلَن
  const blob = new Blob([file], { type: kind === 'mp4' ? 'video/mp4' : 'video/webm' });
  try {
    await tx('readwrite', (s) => s.put(blob, id));
  } catch {
    return { ok: false, error: 'تعذّر حفظ الفيديو — قد تكون مساحة المتصفّح ممتلئة.' };
  }
  return { ok: true, id };
}

export function deleteVideo(id: string) {
  return tx('readwrite', (s) => s.delete(id)).catch(() => undefined);
}

/** رابط blob: للعرض، يُحرَّر عند الإزالة؛ null أثناء التحميل أو إن لم يوجد */
export function useVideoUrl(id: string | undefined): string | null {
  return useBlobUrl(id, STORE);
}

function useBlobUrl(id: string | undefined, store: StoreName): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!id) return;
    let alive = true;
    let made: string | null = null;
    tx<Blob | undefined>('readonly', (s) => s.get(id) as IDBRequest<Blob | undefined>, store)
      .then((blob) => {
        if (!alive || !blob) return;
        made = URL.createObjectURL(blob);
        setUrl(made);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
      if (made) URL.revokeObjectURL(made);
      setUrl(null);
    };
  }, [id, store]);
  return url;
}

/* ── وثائق التوثيق ─────────────────────────────────────────────────────────
 * الصورة تصل هنا بعد prepareImage (فحص البايتات + إعادة ترميز JPEG تُزيل EXIF وموقع GPS).
 * ⚠️ عرض: في المنتج تُرفع إلى تخزين خاصّ غير عامّ (لا رابط مباشر)، مشفّرة، ولا يراها إلا المشرف
 * عبر رابط موقّع قصير العمر يُسجَّل فتحه، وتُحذف بعد مدّة الاحتفاظ المذكورة في سياسة الخصوصية.
 */
const DOC_ID = /^d-[a-z0-9]{6,24}$/;
export const isDocId = (id: unknown): id is string => typeof id === 'string' && DOC_ID.test(id);

export async function storeDoc(dataUrl: string): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!dataUrl.startsWith('data:image/jpeg;base64,')) return { ok: false, error: 'صيغة غير مقبولة.' };
  const blob = await (await fetch(dataUrl)).blob();
  const id = `d-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  try {
    await tx('readwrite', (s) => s.put(blob, id), DOCS);
  } catch {
    return { ok: false, error: 'تعذّر حفظ الملف — قد تكون مساحة المتصفّح ممتلئة.' };
  }
  return { ok: true, id };
}

export function deleteDoc(id: string) {
  return tx('readwrite', (s) => s.delete(id), DOCS).catch(() => undefined);
}

export function useDocUrl(id: string | undefined): string | null {
  return useBlobUrl(isDocId(id) ? id : undefined, DOCS);
}

/* ── ملفات المخطوطات ───────────────────────────────────────────────────────
 * يُعاد فحص النصّ هنا قبل الحفظ (لا يكفي فحص الواجهة)، ويُحفظ بنوع image/svg+xml ثابت لا من الملف.
 * العرض دائماً عبر <img> — لا يُنفَّذ فيه سكربت ولا يُحمَّل منه رابط خارجي.
 * ⚠️ عرض: في المنتج يُرفع إلى تخزين خاصّ ويُعاد فحصه وتعقيمه على الخادم، ولا يصير عامّاً قبل القبول.
 */
const MS_ID = /^m-[a-z0-9]{6,24}$/;
export const isManuscriptFileId = (id: unknown): id is string => typeof id === 'string' && MS_ID.test(id);

export async function storeManuscriptSvg(
  text: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (new Blob([text]).size > MAX_SVG_BYTES) return { ok: false, error: 'الملف أكبر من 5 ميغابايت.' };
  const check = checkSvgText(text);
  if (!check.ok) return check;
  const id = `m-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  try {
    await tx('readwrite', (s) => s.put(new Blob([text], { type: 'image/svg+xml' }), id), MANUSCRIPTS);
  } catch {
    return { ok: false, error: 'تعذّر حفظ الملف — قد تكون مساحة المتصفّح ممتلئة.' };
  }
  return { ok: true, id };
}

export function deleteManuscriptSvg(id: string) {
  return tx('readwrite', (s) => s.delete(id), MANUSCRIPTS).catch(() => undefined);
}

/** نصّ الملف المحفوظ — لإعادة فحصه عند فتح المشرف له */
export function readManuscriptSvg(id: string): Promise<string | null> {
  if (!isManuscriptFileId(id)) return Promise.resolve(null);
  return tx<Blob | undefined>('readonly', (s) => s.get(id) as IDBRequest<Blob | undefined>, MANUSCRIPTS)
    .then((b) => (b ? b.text() : null))
    .catch(() => null);
}

export function useManuscriptUrl(id: string | undefined): string | null {
  return useBlobUrl(isManuscriptFileId(id) ? id : undefined, MANUSCRIPTS);
}

/**
 * رابط blob: دائم طوال الجلسة لمخطوطة منشورة — المكتبة تعرض القائمة نفسها في البطاقة والعارض والتحميل،
 * فلا يُحرَّر عند إغلاق مكوّن واحد. عدد المقبولة صغير، والروابط تزول مع الصفحة.
 */
const publishedUrls = new Map<string, Promise<string | null>>();
export function publishedManuscriptUrl(id: string): Promise<string | null> {
  if (!isManuscriptFileId(id)) return Promise.resolve(null);
  let p = publishedUrls.get(id);
  if (!p) {
    p = tx<Blob | undefined>('readonly', (s) => s.get(id) as IDBRequest<Blob | undefined>, MANUSCRIPTS)
      .then((b) => (b ? URL.createObjectURL(b) : null))
      .catch(() => null);
    publishedUrls.set(id, p);
  }
  return p;
}
