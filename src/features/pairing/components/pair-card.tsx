import { Link } from 'react-router';

import { ArrowLeftIcon, BookmarkIcon, LockIcon, MagicWandIcon } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';
import { weightsLabel } from '@/lib/format';

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
 * بطاقة التركيبة كـ«ورقة عيّنات»: لكل خط قسمه — دوره واسمه، المسبك والأوزان والسعر، القفل،
 * ثم عيّنته بدوره الحقيقي (عنوان كبير، أو فقرة). في الأسفل: لماذا يتناسقان، الحفظ والتحميل/الشراء،
 * وروابط صفحات الخطوط. النقر في أي مكان آخر يفتح التفاصيل.
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

      {/* المحتوى يمرّر النقر إلى الرابط الممتدّ تحته — الأزرار والروابط وحدها تلتقطه */}
      <div className="pointer-events-none relative flex flex-1 flex-col divide-y px-5 [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&>*]:py-5">
        {slots.map((s) => {
          const role: Role | null = s === combo.heading ? 'heading' : s === combo.body ? 'body' : null;
          const isLocked = role ? locked[role] === s.font.id : false;
          const lib = items.find((i) => i.pair.id === s.font.id)?.font;
          return (
            <section key={s.role} aria-label={`${s.role}: ${s.font.nameAr}`} className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="flex min-w-0 items-baseline gap-2">
                    <span className="shrink-0 text-meta font-medium text-primary">{SHORT_ROLE[s.role]}</span>
                    <span dir="ltr" className="truncate text-lead font-semibold">
                      {s.font.name}
                    </span>
                  </p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-muted-foreground">
                    <span dir="auto" className="truncate">
                      {s.font.foundry}
                    </span>
                    <span aria-hidden>·</span>
                    <span>{weightsLabel(s.font.weights.length)}</span>
                    {lib && (
                      <span
                        className={cn(
                          'inline-flex h-5.5 items-center rounded-full px-2 text-caption leading-none font-semibold',
                          lib.type === 'paid' ? 'bg-ink text-ink-foreground' : 'bg-ok-700 text-white',
                        )}
                      >
                        {lib.type === 'paid' ? <bdi dir="ltr">${lib.price}</bdi> : 'مجاني'}
                      </span>
                    )}
                  </p>
                </div>
                {role && onLock && (
                  <button
                    type="button"
                    aria-pressed={isLocked}
                    aria-label={isLocked ? `فكّ تثبيت ${s.font.nameAr}` : `ثبّت ${s.font.nameAr} لـ${s.role}`}
                    title={isLocked ? 'مثبّت — «تركيبات جديدة» تغيّر الباقي فقط' : 'ثبّت هذا الخط وغيّر الباقي'}
                    onClick={() => onLock(role, s.font.id)}
                    className="relative z-10 grid size-9 shrink-0 place-items-center rounded-full border text-muted-foreground transition-[color,background-color,border-color] duration-(--dur-fast) hover:border-strong hover:text-foreground aria-pressed:border-primary aria-pressed:bg-tint-brand aria-pressed:text-primary"
                  >
                    <LockIcon className={cn('size-4', isLocked && 'animate-pop-in')} />
                  </button>
                )}
              </div>

              {/* العيّنة بدور الخط الحقيقي */}
              {!ready ? (
                <span role="status" aria-label="تحميل الخطوط" className="flex flex-col gap-2">
                  <Skeleton className={cn('bg-inset', role === 'body' ? 'h-3.5 w-full' : 'h-9 w-4/5')} />
                  {role === 'body' && <Skeleton className="h-3.5 w-5/6 bg-inset" />}
                </span>
              ) : role === 'body' ? (
                <p
                  className="line-clamp-4 animate-fade-up text-sm leading-loose text-foreground/75"
                  style={slotStyle(s)}
                >
                  {text.body}
                </p>
              ) : role === 'heading' ? (
                <div className="animate-fade-up">
                  <p className="line-clamp-2 text-4xl leading-snug [overflow-wrap:anywhere]" style={slotStyle(s)}>
                    {text.heading}
                  </p>
                  {showLatin && (
                    <p dir="ltr" className="mt-1 line-clamp-1 text-2xl text-muted-foreground" style={slotStyle(s)}>
                      {text.latin}
                    </p>
                  )}
                </div>
              ) : (
                <p className="line-clamp-1 animate-fade-up text-xl" style={slotStyle(s)}>
                  {text.sub}
                </p>
              )}
            </section>
          );
        })}
        {failed && <p className="text-caption text-warn-text">تعذّر تحميل أحد الخطوط — المعاينة تقريبية.</p>}
      </div>

      <footer className="pointer-events-none relative flex flex-col gap-4 border-t bg-sunken/60 p-5 pt-4 [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        <p className="flex gap-2.5 text-meta leading-relaxed text-muted-foreground">
          <MagicWandIcon className="mt-0.5 size-4 shrink-0 text-primary" />
          <span className="flex-1">{combo.reason}</span>
          <span className="shrink-0 text-caption">
            تناسق{' '}
            <span dir="ltr" className="font-semibold text-foreground tabular-nums">
              {combo.score}٪
            </span>
          </span>
        </p>

        <div className="flex gap-2 [&>*]:h-10 [&>*]:flex-1">
          <button
            type="button"
            aria-pressed={saved}
            aria-label={saved ? `إزالة ${title} من المحفوظة` : `حفظ ${title}`}
            onClick={onSave}
            className="relative z-10 inline-flex items-center justify-center gap-2 rounded-xs border bg-card text-meta font-medium transition-[background-color,border-color,color,transform] duration-(--dur-base) hover:border-strong active:scale-[.97] aria-pressed:border-primary aria-pressed:text-primary"
          >
            <BookmarkIcon className={cn('size-4', saved && 'animate-pop-in [&_path]:fill-current')} />
            {saved ? 'محفوظة' : 'حفظ'}
          </button>
          <DownloadAction items={items} tone={paid ? 'secondary' : 'primary'} className="h-10" />
          <BuyAction items={items} className="h-10" />
        </div>

        <nav aria-label={`صفحات خطوط ${title}`} className="flex flex-wrap gap-x-5 gap-y-1 border-t pt-3">
          {items.map(({ pair, font }) => (
            <Link
              key={pair.id}
              to={paths.font.getHref(font.id)}
              className="group/ln relative z-10 inline-flex items-center gap-1 text-meta font-medium text-primary"
            >
              <span dir="ltr">{pair.name}</span>
              <ArrowLeftIcon className="size-3.5 transition-transform duration-(--dur-base) ease-out-quint group-hover/ln:-translate-x-0.5" />
            </Link>
          ))}
        </nav>
      </footer>
    </article>
  );
}
