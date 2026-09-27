'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { extOf, UPLOAD_LIMITS, validateFile, validateImportUrl } from '@/features/publishing/utils/validate';
import type { FileKind } from '@/types/domain/file';
import type { UploadItem } from '@/types/domain/publishing';

const kindOf = (name: string): FileKind => {
  const e = extOf(name);
  return (UPLOAD_LIMITS.exts as readonly string[]).includes(e) ? (e as FileKind) : 'file';
};

/**
 * حالة الرفع. التقدّم هنا محاكاة للعرض.
 * في المنتج: يطلب العميل من الخادم رابط رفع موقّتاً موقّعاً (بعد التحقّق من الصلاحية)،
 * يرفع إليه مباشرة مع متابعة التقدّم، ثم يفحص الخادم الملف (النوع من المحتوى، الحجم،
 * سلامة الخط) قبل قبوله.
 */
export function useUploads(initial: UploadItem[] = []) {
  const [items, setItems] = useState<UploadItem[]>(initial);
  const timers = useRef(new Map<string, number>());

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((id) => window.clearInterval(id));
  }, []);

  const simulate = useCallback((id: string, size: number) => {
    const step = Math.max(size / 12, 1);
    const t = window.setInterval(() => {
      setItems((xs) =>
        xs.map((x) => {
          if (x.id !== id) return x;
          const loaded = Math.min(size, x.loaded + step);
          return { ...x, loaded, status: loaded >= size ? 'done' : 'uploading' };
        }),
      );
    }, 220);
    timers.current.set(id, t);
    window.setTimeout(() => {
      window.clearInterval(t);
      timers.current.delete(id);
    }, 220 * 14);
  }, []);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const next: UploadItem[] = Array.from(files).map((f) => {
        const error = validateFile(f);
        return {
          id: crypto.randomUUID(),
          name: f.name.slice(0, 180),
          size: f.size,
          loaded: 0,
          kind: kindOf(f.name),
          status: error ? 'error' : 'uploading',
          error: error ?? undefined,
          source: 'file',
        };
      });
      setItems((xs) => [...next, ...xs]);
      next.filter((x) => x.status === 'uploading').forEach((x) => simulate(x.id, x.size));
    },
    [simulate],
  );

  const addUrl = useCallback(
    (raw: string): string | null => {
      const v = validateImportUrl(raw);
      if (!v.ok) return v.error;
      const name = decodeURIComponent(v.url.pathname.split('/').pop() || v.url.hostname).slice(0, 180);
      const size = 120 * 1024; // الحجم الحقيقي يعرفه الخادم بعد الجلب
      const item: UploadItem = {
        id: crypto.randomUUID(),
        name,
        size,
        loaded: 0,
        kind: kindOf(name),
        status: 'uploading',
        source: 'url',
      };
      setItems((xs) => [item, ...xs]);
      simulate(item.id, size);
      return null;
    },
    [simulate],
  );

  const remove = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) window.clearInterval(t);
    timers.current.delete(id);
    setItems((xs) => xs.filter((x) => x.id !== id));
  }, []);

  return { items, addFiles, addUrl, remove };
}
