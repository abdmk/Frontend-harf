import { useEffect, useMemo, useState } from 'react';

import { publishedManuscriptUrl } from '@/lib/media-store';
import { useApprovedSubmissions } from '@/stores/manuscript-submissions';
import type { Manuscript } from '@/types/domain/manuscript';

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

/**
 * المخطوطات التي رفعتها الاستوديوهات وقبلتها الإدارة — تُضاف إلى المكتبة بجانب الأعمال الأخرى.
 * ⚠️ عرض: من هذا المتصفّح فقط (الملف في IndexedDB). في المنتج تأتي من الـAPI مع البقية برابط عامّ.
 */
export function usePublishedManuscripts(): Manuscript[] {
  const approved = useApprovedSubmissions();
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let alive = true;
    for (const s of approved) {
      const id = s.file.id!;
      void publishedManuscriptUrl(id).then((url) => {
        if (alive && url) setUrls((u) => (u[id] === url ? u : { ...u, [id]: url }));
      });
    }
    return () => {
      alive = false;
    };
  }, [approved]);

  return useMemo(
    () =>
      approved.flatMap((s): Manuscript[] => {
        const url = urls[s.file.id!];
        if (!url) return [];
        return [
          {
            id: `u-${s.reference.toLowerCase()}`,
            title: s.title,
            category: s.category,
            width: s.file.width,
            height: s.file.height,
            bytes: s.file.bytes,
            url,
            fonts: s.fonts,
            designer: {
              id: `studio-${s.userId}`,
              nameAr: s.studioName,
              nameEn: s.studioName,
              initials: initialsOf(s.studioName),
            },
            designerLinked: false,
            downloads: 0,
            createdAt: s.decidedAt ?? s.createdAt,
            license: s.license,
          },
        ];
      }),
    [approved, urls],
  );
}
