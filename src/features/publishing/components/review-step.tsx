import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { CheckIcon, ExclamationIcon, PencilIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { CATEGORY_LABEL, LANG_LABEL } from '@/lib/labels';

import { ConsentField, type StepProps } from './publish-steps';
import type { WorkDraft } from '../types/draft';

type Issue = { step: number; message: string };
type Image = { url: string; name: string };

const SOURCE_KIND = { purchased: 'مشترى من موقع', free: 'مجاني من موقع', trial: 'تجريبي فقط' } as const;
const SOURCE_LICENSE = { personal: 'شخصي فقط', commercial: 'شخصي وتجاري', ofl: 'SIL OFL' } as const;

/**
 * المراجعة (نمط «مراجعة التفاصيل» في مراجع Wayl): تنبيه بعدد النواقص، ثم بطاقة لكل خطوة
 * بما أُدخل فعلاً وعلامة ✓ أو «أكمل»، ومعاينة البطاقة كما ستظهر في المكتبة، ثم الإقرار.
 */
export function ReviewStep({
  draft,
  set,
  errors,
  images,
  issues,
  labels,
  onEdit,
}: StepProps & {
  images: Image[];
  issues: Issue[];
  labels: readonly string[];
  onEdit: (step: number) => void;
}) {
  const missing = issues.filter((i) => i.step < 4);
  const dash = <span className="text-tertiary">—</span>;
  const sections: { rows: [string, ReactNode][] }[] = [
    {
      rows: [
        ['الأوزان', draft.files.length ? filesSummary(draft) : dash],
        ['الصيغ', draft.files.length ? [...new Set(draft.files.map((f) => f.format.toUpperCase()))].join(' · ') : dash],
      ],
    },
    {
      rows: [
        [
          'الصور',
          images.length ? (
            <span className="flex flex-wrap justify-end gap-1.5">
              {images.slice(0, 5).map((img) => (
                <img key={img.url} src={img.url} alt="" className="h-9 w-12 rounded-xs border object-cover" />
              ))}
              {images.length > 5 && (
                <span className="self-center text-caption text-tertiary">+{images.length - 5}</span>
              )}
            </span>
          ) : (
            dash
          ),
        ],
      ],
    },
    {
      rows: [
        ['الاسم', draft.nameAr || dash],
        ['الاسم اللاتيني', draft.nameLatin ? <span dir="ltr">{draft.nameLatin}</span> : dash],
        ['المصمّمون', draft.designers || dash],
        ['التصنيف', draft.categories.map((c) => CATEGORY_LABEL[c]).join('، ') || dash],
        ['اللغات', draft.langs.map((l) => LANG_LABEL[l]).join('، ') || dash],
      ],
    },
    {
      rows:
        draft.mode === 'admin'
          ? [
              ['المصدر', SOURCE_KIND[draft.source.kind]],
              ['الرابط', draft.source.url ? <span dir="ltr">{draft.source.url}</span> : dash],
              ['الرخصة', SOURCE_LICENSE[draft.source.license]],
            ]
          : draft.availability === 'free'
            ? [['الإتاحة', 'مجاني']]
            : [
                ['الإتاحة', 'مدفوع'],
                ['العائلة كاملة', <span dir="ltr">${draft.familyPrice}</span>],
                ['الوزن الواحد', <span dir="ltr">${Math.round((draft.familyPrice * draft.singlePct) / 100)}</span>],
                ['نسخة تجريبية', draft.trial ? 'نعم' : 'لا'],
              ],
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {missing.length > 0 ? (
        <div role="status" className="flex gap-3 rounded-lg bg-tint-warn p-4 text-warn-text">
          <ExclamationIcon className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="text-control font-semibold">{missingLabel(missing.length)}</p>
            <p className="mt-0.5 text-meta opacity-85">أكملها ثم أرسل الخط. كل ما أدخلته محفوظ في هذا المتصفّح.</p>
          </div>
        </div>
      ) : (
        <div role="status" className="flex gap-3 rounded-lg bg-tint-ok p-4 text-ok-text">
          <CheckIcon className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="text-control font-semibold">كل شيء جاهز</p>
            <p className="mt-0.5 text-meta opacity-85">أقرّ بالحقوق أدناه وأرسل الخط للمراجعة.</p>
          </div>
        </div>
      )}

      <Preview draft={draft} cover={images[0]?.url} />

      {sections.map((sec, i) => {
        const own = missing.filter((m) => m.step === i);
        return (
          <section
            key={labels[i]}
            aria-labelledby={`rv-${i}`}
            className={cn('rounded-lg border bg-card p-4 sm:p-5', own.length && 'border-warn-500/60')}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 id={`rv-${i}`} className="flex items-center gap-2 text-control font-semibold">
                {own.length ? (
                  <span className="grid size-5 place-items-center rounded-full bg-tint-warn text-warn-text">
                    <ExclamationIcon className="size-3" />
                  </span>
                ) : (
                  <span className="grid size-5 place-items-center rounded-full bg-ok-500 text-white">
                    <CheckIcon className="size-3" />
                  </span>
                )}
                {labels[i]}
              </h2>
              <button
                type="button"
                onClick={() => onEdit(i)}
                aria-label={`${own.length ? 'أكمل' : 'عدّل'} ${labels[i]}`}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-meta font-medium transition-colors',
                  own.length ? 'bg-tint-warn text-warn-text hover:opacity-80' : 'text-muted-foreground hover:bg-sunken',
                )}
              >
                {!own.length && <PencilIcon className="size-3.5" />}
                {own.length ? 'أكمل' : 'تعديل'}
              </button>
            </div>
            <dl className="mt-3 flex flex-col gap-2.5">
              {sec.rows.map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-6 text-control">
                  <dt className="shrink-0 text-muted-foreground">{k}</dt>
                  <dd className="min-w-0 text-end break-words">{v}</dd>
                </div>
              ))}
            </dl>
            {own.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1 border-t pt-3 text-caption text-warn-text">
                {own.map((m) => (
                  <li key={m.message}>{m.message}</li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      <ConsentField draft={draft} set={set} errors={errors} />
    </div>
  );
}

/** بطاقة الخط كما ستظهر في المكتبة */
function Preview({ draft, cover }: { draft: WorkDraft; cover?: string }) {
  const badge =
    draft.mode === 'admin'
      ? ({ tone: 'neutral', label: 'خارجي' } as const)
      : draft.availability === 'paid'
        ? ({ tone: 'studio', label: 'مدفوع' } as const)
        : ({ tone: 'success', label: 'مجاني' } as const);
  return (
    <figure className="flex items-center gap-4 rounded-lg border bg-card p-3">
      <div className="relative grid aspect-[4/3] w-28 shrink-0 place-items-center overflow-hidden rounded-md bg-(image:--grad-ink) text-lg font-semibold text-white sm:w-36">
        {cover ? (
          <img src={cover} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          draft.nameAr || 'خطّك'
        )}
      </div>
      <figcaption className="min-w-0 flex-1">
        <span className="text-caption text-tertiary">كما سيظهر في المكتبة</span>
        <span className="mt-1 block truncate text-lead font-semibold">{draft.nameAr || 'اسم الخط'}</span>
        <span className="block truncate text-caption text-muted-foreground">{draft.designers || 'المصمّم'}</span>
        <span className="mt-2 inline-block">
          <Badge tone={badge.tone}>{badge.label}</Badge>
        </span>
      </figcaption>
    </figure>
  );
}

function filesSummary(draft: WorkDraft) {
  const w = [...new Set(draft.files.map((f) => f.weight))].sort((a, b) => a - b);
  return (
    <span dir="ltr" className="tabular-nums">
      {w.join(' · ')}
    </span>
  );
}

function missingLabel(n: number) {
  if (n === 1) return 'ينقص عنصر واحد';
  if (n === 2) return 'ينقص عنصران';
  if (n <= 10) return `تنقص ${n} عناصر`;
  return `ينقص ${n} عنصراً`;
}
