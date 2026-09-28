import { BookmarkIcon, CheckIcon, CrownIcon, LockIcon } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

import { BuyAction, DownloadAction, libraryItems } from './font-actions';
import type { Specimen } from '../data/specimens';
import { useFontsReady } from '../hooks/use-font-ready';
import type { Combo, Slot } from '../utils/pairing';

export const slotStyle = (s: Slot) => ({ fontFamily: `'${s.font.family}', var(--font-sans)`, fontWeight: s.weight });
export const comboSlots = (c: Combo) => [c.heading, c.sub, c.body].filter((s): s is Slot => !!s);
export const comboTitle = (c: Combo) => `تركيبة ${c.heading.font.nameAr} و${c.body.font.nameAr}`;

type Role = 'heading' | 'body';
const SHORT_ROLE = { العناوين: 'العناوين', 'العناوين الفرعية': 'الفرعي', النصوص: 'النصوص' } as const;

/**
 * بطاقة التركيبة بتشريح بطاقة الخط في المكتبة: عيّنة على سطح هادئ مع شارة الترخيص وزرّ الحفظ فوقها،
 * ثم الاسم والتناسق، والخطوط بأدوارها وأقفالها، ثم سطر الترخيص والفعل (تحميل/شراء).
 * البطاقة كلها تفتح التفاصيل.
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
  const paid = items.filter((i) => i.font.type === 'paid');
  const cheapest = paid.length ? Math.min(...paid.map((i) => i.font.price)) : 0;

  return (
    <article
      aria-label={title}
      className="group/card relative flex h-full flex-col overflow-hidden rounded-lg border bg-card transition-[transform,box-shadow,border-color] duration-300 ease-out-quint hover:-translate-y-1 hover:border-strong hover:shadow-float"
    >
      <div
        aria-hidden
        className="relative flex aspect-[7/5] flex-col justify-center overflow-hidden border-b bg-sunken px-6 text-center"
      >
        {!ready && (
          <span role="status" aria-label="تحميل الخطوط" className="flex flex-col items-center gap-3">
            <Skeleton className="h-10 w-3/4 bg-inset" />
            <Skeleton className="h-3.5 w-5/6 bg-inset" />
          </span>
        )}
        <div
          className={cn(
            'flex flex-col transition-[opacity,transform] duration-500 ease-out-quint group-hover/card:scale-[1.03]',
            ready ? 'opacity-100' : 'absolute inset-x-6 opacity-0',
          )}
        >
          <p className="line-clamp-2 text-4xl leading-snug [overflow-wrap:anywhere]" style={slotStyle(combo.heading)}>
            {text.heading}
          </p>
          {combo.sub && (
            <p className="mt-1.5 line-clamp-1 text-lg" style={slotStyle(combo.sub)}>
              {text.sub}
            </p>
          )}
          {showLatin && (
            <p dir="ltr" className="mt-1 line-clamp-1 text-base text-muted-foreground" style={slotStyle(combo.heading)}>
              {text.latin}
            </p>
          )}
          <p
            className="mx-auto mt-3 line-clamp-2 max-w-[34ch] text-sm leading-relaxed text-foreground/75"
            style={slotStyle(combo.body)}
          >
            {text.body}
          </p>
          {failed && <p className="mt-2 text-caption text-warn-text">تعذّر تحميل أحد الخطوط — المعاينة تقريبية.</p>}
        </div>
      </div>

      <span
        className={cn(
          'absolute end-4 top-4 z-10 inline-flex h-6 items-center gap-1 rounded-full px-2 text-caption leading-none font-medium',
          paid.length ? 'bg-gold-500 text-gold-foreground' : 'bg-ok-600 text-white',
        )}
      >
        {paid.length ? <CrownIcon className="size-3" /> : <CheckIcon className="size-3" />}
        {paid.length ? 'مدفوع' : 'مجاني'}
      </span>
      {/* الحفظ بشكل زرّ المفضّلة في بطاقة الخط */}
      <button
        type="button"
        aria-pressed={saved}
        aria-label={saved ? `إزالة ${title} من المحفوظة` : `حفظ ${title}`}
        title={saved ? 'محفوظة' : 'حفظ'}
        onClick={onSave}
        className="absolute start-4 top-4 z-10 grid size-8 place-items-center rounded-full bg-heart text-white backdrop-blur-sm transition-[transform,background-color] duration-200 ease-pop hover:scale-105 active:scale-95 aria-pressed:bg-primary"
      >
        <BookmarkIcon className={cn('size-3.75', saved && 'animate-pop-in [&_path]:fill-current')} />
      </button>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-baseline justify-between gap-3">
          {/* رابط البطاقة الممتدّ: النقر في أي مكان يفتح التفاصيل */}
          <button
            type="button"
            onClick={onOpen}
            aria-label={`تفاصيل ${title}`}
            className="min-w-0 truncate text-start text-xl font-semibold tracking-tight after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-primary"
          >
            {slots.map((s) => s.font.nameAr).join(' + ')}
          </button>
          <span className="shrink-0 text-meta text-muted-foreground">
            تناسق{' '}
            <span dir="ltr" className="font-medium text-foreground tabular-nums">
              {combo.score}٪
            </span>
          </span>
        </div>

        <ul className="flex flex-col gap-1">
          {slots.map((s) => {
            const role: Role | null = s === combo.heading ? 'heading' : s === combo.body ? 'body' : null;
            const isLocked = role ? locked[role] === s.font.id : false;
            return (
              <li key={s.role} className="flex min-h-7 min-w-0 items-center gap-2 text-sm font-medium">
                <span className="w-14 shrink-0 text-meta font-normal text-muted-foreground">{SHORT_ROLE[s.role]}</span>
                <span className="min-w-0 truncate">
                  {s.font.nameAr}{' '}
                  <span dir="ltr" className="text-meta font-normal text-tertiary tabular-nums">
                    {s.weight}
                  </span>
                </span>
                {role && onLock && (
                  <button
                    type="button"
                    aria-pressed={isLocked}
                    aria-label={isLocked ? `فكّ تثبيت ${s.font.nameAr}` : `ثبّت ${s.font.nameAr} لـ${s.role}`}
                    title={isLocked ? 'مثبّت — «تركيبات جديدة» تغيّر الباقي فقط' : 'ثبّت هذا الخط وغيّر الباقي'}
                    onClick={() => onLock(role, s.font.id)}
                    className={cn(
                      'relative z-10 grid size-7 shrink-0 place-items-center rounded-full text-tertiary transition-[color,background-color,opacity] hover:bg-sunken hover:text-foreground aria-pressed:bg-tint-brand aria-pressed:text-primary',
                      !isLocked &&
                        'sm:opacity-0 sm:group-focus-within/card:opacity-100 sm:group-hover/card:opacity-100',
                    )}
                  >
                    <LockIcon className="size-3.5" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <span className={cn('min-w-0 truncate text-sm font-medium', paid.length ? 'text-foreground' : 'text-lic')}>
            {paid.length ? (
              <>
                الترخيص من <bdi dir="ltr">${cheapest}</bdi>
              </>
            ) : (
              'مجانية بالكامل'
            )}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            <DownloadAction items={items} tone={paid.length ? 'secondary' : 'primary'} />
            <BuyAction items={items} />
          </div>
        </div>
      </div>
    </article>
  );
}
