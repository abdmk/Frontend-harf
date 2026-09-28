import { Button } from '@/components/ui/button';
import { BookmarkIcon, LockIcon } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

import { BuyAction, DownloadAction, libraryItems, PriceTag } from './font-actions';
import type { Specimen } from '../data/specimens';
import { useFontsReady } from '../hooks/use-font-ready';
import type { Combo, Slot } from '../utils/pairing';

export const slotStyle = (s: Slot) => ({ fontFamily: `'${s.font.family}', var(--font-sans)`, fontWeight: s.weight });
export const comboSlots = (c: Combo) => [c.heading, c.sub, c.body].filter((s): s is Slot => !!s);
export const comboTitle = (c: Combo) => `تركيبة ${c.heading.font.nameAr} و${c.body.font.nameAr}`;

type Role = 'heading' | 'body';

/**
 * بطاقة تركيبة موحّدة الارتفاع: الرقم والتناسق، ثم عيّنة بخطوطها الحقيقية على سطح هادئ
 * (النقر عليها يفتح التفاصيل)، ثم سطر مضغوط لكل خط مع قفله، ثم الأفعال: حفظ · تحميل · شراء.
 */
export function PairCard({
  combo,
  index,
  text,
  showLatin,
  locked,
  onLock,
  saved,
  onSave,
  onOpen,
}: {
  combo: Combo;
  index: number;
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

  return (
    <article
      aria-label={title}
      className="flex h-full animate-fade-up flex-col rounded-xl border bg-card transition-[border-color,box-shadow] duration-(--dur-base) hover:border-strong"
      style={{ animationDelay: `${(index % 9) * 35}ms` }}
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-3">
        <span dir="ltr" className="text-caption font-medium text-tertiary tabular-nums">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="text-caption text-muted-foreground">
          تناسق{' '}
          <strong dir="ltr" className="font-semibold text-foreground tabular-nums">
            {combo.score}٪
          </strong>
        </span>
      </div>

      {/* العيّنة: زرّ واحد يفتح التفاصيل — أحجام ثابتة وأسطر مقصوصة حتى تتساوى البطاقات */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`تفاصيل ${title}`}
        className="group/spec relative mx-3 flex min-h-48 flex-1 flex-col overflow-hidden rounded-lg bg-sunken px-5 py-5 text-start outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {!ready && (
          <span role="status" aria-label="تحميل الخطوط" className="absolute inset-x-5 top-5 flex flex-col gap-3">
            <Skeleton className="h-9 w-3/4 bg-inset" />
            <Skeleton className="h-3.5 w-full bg-inset" />
            <Skeleton className="h-3.5 w-5/6 bg-inset" />
          </span>
        )}
        <span
          className={cn('flex flex-col transition-opacity duration-(--dur-slow)', ready ? 'opacity-100' : 'opacity-0')}
        >
          <span
            className="line-clamp-2 text-4xl leading-snug [overflow-wrap:anywhere] text-foreground"
            style={slotStyle(combo.heading)}
          >
            {text.heading}
          </span>
          {combo.sub && (
            <span className="mt-2 line-clamp-1 text-lg text-foreground" style={slotStyle(combo.sub)}>
              {text.sub}
            </span>
          )}
          {showLatin && (
            <span
              dir="ltr"
              className="mt-1.5 line-clamp-1 text-left text-base text-muted-foreground"
              style={slotStyle(combo.heading)}
            >
              {text.latin}
            </span>
          )}
          <span className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/75" style={slotStyle(combo.body)}>
            {text.body}
          </span>
        </span>
        {failed && (
          <span className="mt-auto pt-3 text-caption text-warn-text">تعذّر تحميل أحد الخطوط — المعاينة تقريبية.</span>
        )}
        <span
          aria-hidden
          className="absolute end-3 bottom-3 rounded-full bg-paper px-2.5 py-1 text-caption text-muted-foreground opacity-0 shadow-soft transition-opacity duration-(--dur-base) group-hover/spec:opacity-100 group-focus-visible/spec:opacity-100"
        >
          التفاصيل
        </span>
      </button>

      <ul className="mt-1 px-4">
        {slots.map((s) => {
          const role: Role | null = s === combo.heading ? 'heading' : s === combo.body ? 'body' : null;
          const isLocked = role ? locked[role] === s.font.id : false;
          return (
            <li key={s.role} className="flex min-h-12 items-center gap-3 border-b py-1.5 last:border-b-0">
              <span className="w-14 shrink-0 text-caption text-tertiary">
                {s.role === 'العناوين الفرعية' ? 'الفرعي' : s.role}
              </span>
              <span className="min-w-0 flex-1 truncate text-control font-medium">
                {s.font.nameAr}{' '}
                <span dir="ltr" className="text-caption font-normal text-muted-foreground tabular-nums">
                  {s.weight}
                </span>
              </span>
              <span className={cn('shrink-0 text-caption', s.font.tier === 'free' ? 'text-ok-text' : 'text-warn-text')}>
                <PriceTag id={s.font.id} />
              </span>
              {role && onLock ? (
                <button
                  type="button"
                  aria-pressed={isLocked}
                  aria-label={isLocked ? `فكّ تثبيت ${s.font.nameAr}` : `ثبّت ${s.font.nameAr} لـ${s.role}`}
                  title={isLocked ? 'مثبّت — «تركيبات جديدة» تغيّر الباقي فقط' : 'ثبّت هذا الخط وغيّر الباقي'}
                  onClick={() => onLock(role, s.font.id)}
                  className="-me-1.5 grid size-8 shrink-0 place-items-center rounded-full text-tertiary transition-colors hover:bg-sunken hover:text-foreground aria-pressed:bg-tint-brand aria-pressed:text-primary"
                >
                  <LockIcon className="size-3.5" />
                </button>
              ) : (
                <span aria-hidden className="-me-1.5 size-8 shrink-0" />
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-auto flex items-center gap-2 border-t px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          aria-pressed={saved}
          aria-label={saved ? `إزالة ${title} من المحفوظة` : `حفظ ${title}`}
          onClick={onSave}
          className="-ms-2 aria-pressed:text-primary"
        >
          <BookmarkIcon className={cn(saved && 'animate-pop-in [&_path]:fill-current')} />
          {saved ? 'محفوظة' : 'حفظ'}
        </Button>
        <div className="ms-auto flex items-center gap-2">
          <DownloadAction items={items} />
          <BuyAction items={items} />
        </div>
      </div>
    </article>
  );
}
