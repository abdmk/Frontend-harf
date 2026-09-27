'use client';

import { Tabs as TabsPrimitive } from 'radix-ui';
import { useLayoutEffect, useRef, useState } from 'react';

import { FileIcon, type FileKind } from '@/components/shared/file-icon';
import { formatDateAr, weightsLabel } from '@/lib/format';

import type { Font } from '@/types/domain/font';
import { CATEGORY_LABEL, LANG_LABEL } from '@/lib/labels';

/** «معلومات الخط» و«محتويات الحزمة» — المؤشّر الأحمر ينزلق بين التبويبين */
export function FontDetailsTabs({ font }: { font: Font }) {
  const [tab, setTab] = useState('info');
  const list = useRef<HTMLDivElement>(null);
  const ind = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const l = list.current;
    const i = ind.current;
    if (!l || !i) return;
    const place = () => {
      const on = l.querySelector<HTMLElement>('[data-state="active"]');
      if (!on) return;
      i.style.width = `${on.offsetWidth}px`;
      i.style.transform = `translateX(${on.offsetLeft}px)`;
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(l);
    return () => ro.disconnect();
  }, [tab]);

  const files: [string, FileKind, string][] = [
    [`${font.name.replace(/\s+/g, '')}-OTF.zip`, 'otf', `${weightsLabel(font.weights)} · OTF`],
    [`${font.name.replace(/\s+/g, '')}-TTF.zip`, 'ttf', `${weightsLabel(font.weights)} · TTF`],
    [`${font.name.replace(/\s+/g, '')}-Web.zip`, 'zip', 'WOFF2 للمواقع'],
    ['License.pdf', 'pdf', 'ملف الترخيص'],
  ];

  return (
    <TabsPrimitive.Root value={tab} onValueChange={setTab} className="mt-16">
      <TabsPrimitive.List ref={list} aria-label="تفاصيل الخط" className="relative flex gap-10 border-b">
        {[
          ['info', 'معلومات الخط'],
          ['files', 'محتويات الحزمة'],
        ].map(([v, label]) => (
          <TabsPrimitive.Trigger
            key={v}
            value={v!}
            className="h-13 text-[15px] text-tertiary transition-colors duration-200 hover:text-foreground data-[state=active]:font-medium data-[state=active]:text-foreground"
          >
            {label}
          </TabsPrimitive.Trigger>
        ))}
        <span
          ref={ind}
          aria-hidden
          className="absolute -bottom-px left-0 h-0.5 rounded-full bg-primary transition-[transform,width] duration-300 ease-out-quint"
        />
      </TabsPrimitive.List>

      <TabsPrimitive.Content value="info" className="animate-fade-up py-8 outline-none">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-[140px_minmax(0,1fr)]">
          <dt className="text-tertiary">تاريخ الإصدار</dt>
          <dd className="mb-3 font-medium sm:mb-0">{formatDateAr(font.releasedAt)}</dd>
          <dt className="text-tertiary">اللغات المدعومة</dt>
          <dd className="mb-3 font-medium sm:mb-0">{font.langs.map((l) => LANG_LABEL[l]).join('، ')}</dd>
          <dt className="text-tertiary">الأوزان | الستايل</dt>
          <dd className="mb-3 font-medium sm:mb-0">
            {weightsLabel(font.weights)}
            {font.style ? ` | ${font.style}` : ''}
          </dd>
          <dt className="text-tertiary">الوسوم :</dt>
          <dd />
        </dl>
        <ul className="mt-5 flex flex-wrap gap-2">
          {(font.tags ?? [CATEGORY_LABEL[font.category], 'عربي']).map((t) => (
            <li
              key={t}
              className="inline-flex h-[30px] items-center rounded-full bg-sunken px-4 text-[11.5px] text-muted-foreground"
            >
              {t}
            </li>
          ))}
        </ul>
      </TabsPrimitive.Content>

      <TabsPrimitive.Content value="files" className="animate-fade-up py-8 outline-none">
        <ul className="flex flex-col">
          {files.map(([name, kind, desc]) => (
            <li key={name} className="flex items-center gap-4 border-b border-subtle py-3 text-sm">
              <FileIcon kind={kind} className="h-10 w-8" />
              <span dir="ltr" className="flex-1 text-right font-mono text-[12.5px]">
                {name}
              </span>
              <span className="text-[12.5px] text-tertiary">{desc}</span>
            </li>
          ))}
        </ul>
      </TabsPrimitive.Content>
    </TabsPrimitive.Root>
  );
}
