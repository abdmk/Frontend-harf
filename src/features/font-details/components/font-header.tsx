import type { ReactNode } from 'react';

import { Avatar } from '@/components/shared/avatar';
import { DownloadButton } from '@/components/shared/download-button';
import { CATEGORY_LABEL, USAGE_LABEL } from '@/lib/labels';
import type { Font } from '@/types/domain/font';

/** العنوان والمصمّمون والأفعال، ثم شريط المعلومات */
export function FontHeader({ font, favorite }: { font: Font; favorite?: ReactNode }) {
  const meta = [
    ['الأوزان', String(font.weights)],
    ['اللغات', String(font.langs.length)],
    ['الرخصة', USAGE_LABEL[font.usage]],
    ['التصنيف', CATEGORY_LABEL[font.category]],
    ['النشر', font.releasedAt.slice(0, 4)],
  ] as const;
  return (
    <>
      <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0">
          <h1 dir="ltr" className="text-right text-title font-semibold tracking-tight">
            {font.name}
          </h1>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {font.designers.map((d) => (
              <span key={d.id} className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar initials={d.initials} seed={d.id} size="sm" className="size-5.5" />
                <span dir="ltr">{d.nameEn}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {favorite}
          <DownloadButton fontName={font.name} label="تحميل الخط" size="lg" />
        </div>
      </div>
      <dl className="mt-8 grid grid-cols-2 rounded-md border bg-card sm:grid-cols-5">
        {meta.map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between gap-3 border-border px-5 py-4 text-meta text-muted-foreground max-sm:border-t max-sm:first:border-t-0 sm:justify-center sm:border-s sm:first:border-s-0 max-sm:[&:nth-child(2)]:border-t-0"
          >
            <dt>{k}</dt>
            <dd className="text-sm font-semibold text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
      {font.description && (
        <div className="mt-8 flex flex-col gap-4 text-sm leading-[1.9] text-muted-foreground">
          {font.description.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      )}
    </>
  );
}
