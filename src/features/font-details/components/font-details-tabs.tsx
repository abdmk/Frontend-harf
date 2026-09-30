import { FileIcon, type FileKind } from '@/components/shared/file-icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDateAr, weightsLabel } from '@/lib/format';
import { CATEGORY_LABEL, LANG_LABEL } from '@/lib/labels';
import type { Font } from '@/types/domain/font';

/** «معلومات الخط» و«محتويات الحزمة» — المؤشّر الأحمر ينزلق بين التبويبين */
export function FontDetailsTabs({ font }: { font: Font }) {
  const files: [string, FileKind, string][] = [
    [`${font.name.replace(/\s+/g, '')}-OTF.zip`, 'otf', `${weightsLabel(font.weights)} · OTF`],
    [`${font.name.replace(/\s+/g, '')}-TTF.zip`, 'ttf', `${weightsLabel(font.weights)} · TTF`],
    [`${font.name.replace(/\s+/g, '')}-Web.zip`, 'zip', 'WOFF2 للمواقع'],
    ['License.pdf', 'pdf', 'ملف الترخيص'],
  ];

  return (
    <Tabs defaultValue="info" className="mt-16">
      <TabsList aria-label="تفاصيل الخط">
        <TabsTrigger value="info">معلومات الخط</TabsTrigger>
        <TabsTrigger value="files">محتويات الحزمة</TabsTrigger>
      </TabsList>

      <TabsContent value="info">
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
              className="inline-flex h-7.5 items-center rounded-full bg-sunken px-4 text-caption text-muted-foreground"
            >
              {t}
            </li>
          ))}
        </ul>
      </TabsContent>

      <TabsContent value="files">
        <ul className="flex flex-col">
          {files.map(([name, kind, desc]) => (
            <li key={name} className="flex items-center gap-4 border-b border-subtle py-3 text-sm">
              <FileIcon kind={kind} className="h-10 w-8" />
              <span dir="ltr" className="flex-1 text-right text-meta tabular-nums">
                {name}
              </span>
              <span className="text-meta text-tertiary">{desc}</span>
            </li>
          ))}
        </ul>
      </TabsContent>
    </Tabs>
  );
}
