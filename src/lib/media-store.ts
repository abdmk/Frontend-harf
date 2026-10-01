import { useEffect, useState } from 'react';

/**
 * فيديوهات المقالات: تُفحص بايتاتها الأولى (MP4/WebM فقط) وتُخزَّن في IndexedDB بهذا المتصفّح،
 * وتُعرض عبر blob: محلّي. ⚠️ عرض: في المنتج تُرفع إلى تخزين الملفات بعد فحصها على الخادم
 * (ونوصي بإعادة ترميزها هناك)، ويُحفظ في المقال رابطها فقط.
 */
export const VIDEO_MAX_BYTES = 50 * 1024 * 1024;
const DB = 'harf-media';
const STORE = 'videos';

export type VideoKind = 'mp4' | 'webm';

/** MP4: «ftyp» عند البايت 4 — WebM/Matroska: 1A 45 DF A3 */
export function sniffVideo(b: Uint8Array): VideoKind | null {
  if (b.length >= 8 && b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) return 'mp4';
  if (b.length >= 4 && b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return 'webm';
  return null;
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  try {
    return await new Promise<T>((resolve, reject) => {
      const req = fn(db.transaction(STORE, mode).objectStore(STORE));
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
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!id) return;
    let alive = true;
    let made: string | null = null;
    tx<Blob | undefined>('readonly', (s) => s.get(id) as IDBRequest<Blob | undefined>)
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
  }, [id]);
  return url;
}
