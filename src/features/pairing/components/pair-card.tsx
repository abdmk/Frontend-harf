import { Link } from 'react-router';

import { BookmarkIcon, CheckIcon, ClockIcon, CrownIcon, LockIcon } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';
import { weightsLabel } from '@/lib/format';
import { TYPE_LABEL } from '@/lib/labels';
import type { Font } from '@/types/domain/font';

import { BuyAction, DownloadAction, libraryItems } from './font-actions';
import type { Specimen } from '../data/specimens';
import { useFontsReady } from '../hooks/use-font-ready';
import type { Combo, Slot } from '../utils/pairing';

export const slotStyle = (s: Slot) => ({ fontFamily: `'${s.font.family}', var(--font-sans)`, fontWeight: s.weight });
export const comboSlots = (c: Combo) => [c.heading, c.sub, c.body].filter((s): s is Slot => !!s);
export const comboTitle = (c: Combo) => `تركيبة ${c.heading.font.nameAr} و${c.body.font.nameAr}`;

type Role = 'heading' | 'body';
const SHORT_ROLE = { العناوين: 'العناوين', 'العناوين الفرعية': 'الفرعي', النصوص: 'النصوص' } as const;

/** شارات الترخيص نفسها في بطاقة الخط */
const BADGE = {
  free: { cls: 'bg-ok-700 text-white', Icon: CheckIcon },
  trial: { cls: 'bg-trial-600 text-white', Icon: ClockIcon },
  paid: { cls: 'bg-gold-500 text-gold-foreground', Icon: CrownIcon },
} as const;

function LicenseBadge({ font }: { font: Font }) {
  const b = BADGE[font.type];
  return (
    <span
      className={cn(
        'inline-flex h-5.5 shrink-0 items-center gap-1 rounded-full px-2 text-caption leading-none font-medium',
        b.cls,
      )}
    >
      <b.Icon className="size-3" />
      {font.type === 'paid' ? <bdi dir="ltr">${font.price}</bdi> : TYPE_LABEL[font.type]}
    </span>
  );
}

/**
 * بطاقة التركيبة بتشريح بطاقة الخط: في الأعلى لوحة العيّنة — الخطّان معاً كما سيُستعملان
 * (عنوان فوق فقرة) — ثم سطر لكل خط: دوره، اسمه رابطاً لصفحته، أوزانه، شارة ترخيصه، والقفل.
 * في الأسفل سبب التناسق، ثم الحفظ والتحميل/الشراء. النقر في أي مكان آخر يفتح التفاصيل.
 */
export function PairCard({
  combo,
  text,
  showLatin,
  locked,
  onLock,
  saved,
  onSave,
  onOpen,
}: {
  combo: Combo;
  text: Specimen;
  showLatin: boolean;
  locked: Partial<Record<Role, string>>;
  onLock?: (role: Role, id: string) => void;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
}) {
  const slots = comboSlots(combo);
  const { ready, failed } = useFontsReady(
    slots.map((s) => ({ family: s.font.family, weight: s.weight })),
    `${text.heading}${text.body}`,
  );
  const title = comboTitle(combo);
  const items = libraryItems(slots.map((s) => s.font));
  const paid = items.some((i) => i.font.type === 'paid');

  return (
    <article
      aria-label={title}
      className="group/card relative flex h-full flex-col overflow-hidden rounded-lg border bg-card transition-[transform,box-shadow,border-color] duration-(--dur-slow) ease-out-quint hover:-translate-y-1 hover:border-strong hover:shadow-float"
    >
      {/* رابط البطاقة الممتدّ: النقر في أي مكان خارج الأزرار يفتح التفاصيل */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`تفاصيل ${title}`}
        className="absolute inset-0 rounded-lg focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary focus-visible:outline-none"
      />

      {/* لوحة العيّنة — النص الحقيقي يحجز مكانه مخفيّاً حتى يصل خطّه، والهيكل فوقه: لا قفزة في الارتفاع */}
      <div aria-hidden className="pointer-events-none relative border-b bg-sunken px-6 pt-12 pb-7">
        <span className="absolute end-4 top-4 inline-flex h-6 items-center gap-1 rounded-full bg-card px-2.5 text-caption leading-none text-muted-foreground shadow-soft">
          تناسق
          <span dir="ltr" className="font-semibold text-foreground tabular-nums">
            {combo.score}٪
          </span>
        </span>
        <div
          className={cn(
            'flex flex-col gap-3 transition-[opacity,transform] duration-(--dur-slow) ease-out-quint group-hover/card:scale-[1.02]',
            !ready && 'opacity-0',
          )}
        >
          <p className="line-clamp-2 text-4xl leading-snug [overflow-wrap:anywhere]" style={slotStyle(combo.heading)}>
            {text.heading}
          </p>
          {showLatin && (
            <p dir="ltr" className="-mt-2 line-clamp-1 text-2xl text-muted-foreground" style={slotStyle(combo.heading)}>
              {text.latin}
            </p>
          )}
          {combo.sub && (
            <p className="line-clamp-1 text-xl" style={slotStyle(combo.sub)}>
              {text.sub}
            </p>
          )}
          <p className="line-clamp-3 text-sm leading-loose text-foreground/75" style={slotStyle(combo.body)}>
            {text.body}
          </p>
        </div>
        {!ready && (
          <span className="absolute inset-x-6 top-12 flex flex-col gap-3">
            <Skeleton className="h-9 w-4/5 bg-inset" />
            <Skeleton className="mt-2 h-3.5 w-full bg-inset" />
            <Skeleton className="h-3.5 w-5/6 bg-inset" />
          </span>
        )}
      </div>
      {!ready && <span role="status" aria-label="تحميل الخطوط" className="sr-only" />}

      {/* المحتوى يمرّر النقر إلى الرابط الممتدّ تحته — الأزرار والروابط وحدها تلتقطه */}
      <div className="pointer-events-none relative flex flex-1 flex-col gap-4 p-5 [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        <ul className="flex flex-col divide-y">
          {slots.map((s) => {
            const role: Role | null = s === combo.heading ? 'heading' : s === combo.body ? 'body' : null;
            const isLocked = role ? locked[role] === s.font.id : false;
            const lib = items.find((i) => i.pair.id === s.font.id)?.font;
            return (
              <li
                key={s.role}
                aria-label={`${s.role}: ${s.font.nameAr}`}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  {lib ? (
                    <Link
                      to={paths.font.getHref(lib.id)}
                      dir="ltr"
                      className="relative z-10 max-w-full self-start truncate font-semibold underline-offset-4 transition-colors hover:text-primary hover:underline"
                    >
                      {s.font.name}
                    </Link>
                  ) : (
                    <span dir="ltr" className="max-w-full self-start truncate font-semibold">
                      {s.font.name}
                    </span>
                  )}
                  <span className="truncate text-caption text-muted-foreground">
                    {SHORT_ROLE[s.role]} · {weightsLabel(s.font.weights.length)}
                  </span>
                </span>
                {lib && <LicenseBadge font={lib} />}
                {role && onLock && (
                  <button
                    type="button"
                    aria-pressed={isLocked}
                    aria-label={isLocked ? `فكّ تثبيت ${s.font.nameAr}` : `ثبّت ${s.font.nameAr} لـ${s.role}`}
                    title={isLocked ? 'مثبّت — «تركيبات جديدة» تغيّر الباقي فقط' : 'ثبّت هذا الخط وغيّر الباقي'}
                    onClick={() => onLock(role, s.font.id)}
                    className="relative z-10 -me-1.5 grid size-8 shrink-0 place-items-center rounded-full text-tertiary transition-[color,background-color] duration-(--dur-fast) hover:bg-sunken hover:text-foreground aria-pressed:bg-tint-brand aria-pressed:text-primary"
                  >
                    <LockIcon filled={isLocked} className={cn('size-4', isLocked && 'animate-pop-in')} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        <p className="line-clamp-2 text-meta leading-relaxed text-muted-foreground">{combo.reason}</p>
        {failed && <p className="text-caption text-warn-text">تعذّر تحميل أحد الخطوط — المعاينة تقريبية.</p>}

        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="truncate text-sm font-medium text-lic">{paid ? 'خط مدفوع' : 'مجانية بالكامل'}</span>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              aria-pressed={saved}
              aria-label={saved ? `إزالة ${title} من المحفوظة` : `حفظ ${title}`}
              title={saved ? 'محفوظة' : 'حفظ'}
              onClick={onSave}
              className="relative z-10 grid size-8 place-items-center rounded-xs border bg-sunken text-foreground transition-[background-color,border-color,color,transform] duration-(--dur-base) hover:bg-inset active:scale-[.95] aria-pressed:border-primary aria-pressed:bg-tint-brand aria-pressed:text-primary"
            >
              <BookmarkIcon filled={saved} className={cn('size-4', saved && 'animate-pop-in')} />
            </button>
            <DownloadAction items={items} tone={paid ? 'secondary' : 'primary'} />
            <BuyAction items={items} />
          </div>
        </div>
      </div>
    </article>
  );
}
