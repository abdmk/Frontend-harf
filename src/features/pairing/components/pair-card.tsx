import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookmarkIcon, CopyIcon, ExpandIcon, LockIcon } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

import { EditableText } from './editable-text';
import type { Specimen } from '../data/specimens';
import { useFontsReady } from '../hooks/use-font-ready';
import type { Combo, Slot } from '../utils/pairing';

const faceStyle = (s: Slot) => ({ fontFamily: `'${s.font.family}', system-ui`, fontWeight: s.weight });

/**
 * بطاقة «ملصق» حيّة: تخطيط مصغّر حقيقي بخطوط التركيبة — عنوان، (عنوان فرعي)، (سطر لاتيني)، ومتن.
 * النص يُحرَّر على البطاقة نفسها ويتغيّر في كل البطاقات. أسفلها الخطوط وأقفالها والتعليل.
 */
export function PairCard({
  combo,
  index,
  text,
  onText,
  showLatin,
  locked,
  onLock,
  saved,
  onSave,
  onCopy,
  onOpen,
}: {
  combo: Combo;
  index: number;
  text: Specimen;
  onText: (t: Specimen) => void;
  showLatin: boolean;
  locked: { heading?: string; body?: string };
  onLock?: (role: 'heading' | 'body', id: string) => void;
  saved: boolean;
  onSave: () => void;
  onCopy: () => void;
  onOpen: () => void;
}) {
  const slots = [combo.heading, combo.sub, combo.body].filter((s): s is Slot => !!s);
  const { ready, failed } = useFontsReady(
    slots.map((s) => ({ family: s.font.family, weight: s.weight })),
    `${text.heading}${text.body}`,
  );
  const title = `تركيبة ${combo.heading.font.nameAr} و${combo.body.font.nameAr}`;

  return (
    <article
      aria-label={title}
      className="flex animate-fade-up flex-col overflow-hidden rounded-xl border bg-card"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-center justify-between gap-3 px-5 pt-4">
        <span className="inline-flex items-center gap-2 text-caption text-muted-foreground">
          <span dir="ltr" className="font-medium tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span aria-hidden className="h-3 w-px bg-border" />
          <span>
            تناسق{' '}
            <strong dir="ltr" className="font-semibold text-foreground tabular-nums">
              {combo.score}٪
            </strong>
          </span>
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            aria-pressed={saved}
            aria-label={saved ? `إزالة ${title} من المحفوظة` : `حفظ ${title}`}
            onClick={onSave}
            className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground aria-pressed:text-primary"
          >
            <BookmarkIcon className={cn('size-4', saved && 'animate-pop-in [&_path]:fill-current')} />
          </button>
          <button
            type="button"
            aria-label={`تفاصيل ${title}`}
            onClick={onOpen}
            className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground"
          >
            <ExpandIcon className="size-4" />
          </button>
        </div>
      </div>

      <div className="relative flex-1 px-6 pt-4 pb-8 sm:px-8">
        {!ready && (
          <div
            role="status"
            aria-label="تحميل الخطوط"
            className="absolute inset-x-6 top-4 flex flex-col gap-4 sm:inset-x-8"
          >
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}
        <div className={cn('transition-opacity duration-(--dur-slow)', ready ? 'opacity-100' : 'opacity-0')}>
          <EditableText
            label="العنوان"
            value={text.heading}
            onChange={(heading) => onText({ ...text, heading })}
            className="text-4xl leading-snug sm:text-5xl"
            style={faceStyle(combo.heading)}
          />
          {combo.sub && (
            <EditableText
              label="العنوان الفرعي"
              value={text.sub}
              onChange={(sub) => onText({ ...text, sub })}
              className="mt-3 text-xl leading-normal"
              style={faceStyle(combo.sub)}
            />
          )}
          {showLatin && (
            <EditableText
              label="السطر اللاتيني"
              dir="ltr"
              value={text.latin}
              onChange={(latin) => onText({ ...text, latin })}
              className="mt-2 text-left text-lg text-muted-foreground"
              style={faceStyle(combo.heading)}
            />
          )}
          <EditableText
            label="النص"
            value={text.body}
            max={600}
            onChange={(body) => onText({ ...text, body })}
            className="mt-5 text-base leading-loose text-foreground/80"
            style={faceStyle(combo.body)}
          />
          {failed && (
            <p className="mt-3 text-caption text-warn-text">تعذّر تحميل أحد الخطوط — المعاينة قد لا تكون دقيقة.</p>
          )}
        </div>
      </div>

      <ul className="divide-y border-t">
        {slots.map((s) => {
          const role = s === combo.heading ? 'heading' : s === combo.body ? 'body' : null;
          const isLocked = role ? locked[role] === s.font.id : false;
          return (
            <li key={s.role} className="flex items-center gap-3 px-5 py-2.5">
              <span className="min-w-0 flex-1">
                <span className="block text-caption text-tertiary">{s.role}</span>
                <span className="block truncate text-control font-medium">
                  {s.font.nameAr}{' '}
                  <span dir="ltr" className="font-normal text-muted-foreground">
                    {s.font.name} · {s.weight}
                  </span>
                </span>
              </span>
              <Badge tone={s.font.tier === 'free' ? 'success' : 'studio'}>
                {s.font.tier === 'free' ? 'مجاني' : 'مدفوع'}
              </Badge>
              {role && onLock && (
                <button
                  type="button"
                  aria-pressed={isLocked}
                  aria-label={isLocked ? `فكّ تثبيت ${s.font.nameAr}` : `ثبّت ${s.font.nameAr} لـ${s.role}`}
                  title={isLocked ? 'مثبّت — «تركيبات جديدة» تغيّر الباقي فقط' : 'ثبّت هذا الخط وغيّر الباقي'}
                  onClick={() => onLock(role, s.font.id)}
                  className="grid size-8 shrink-0 place-items-center rounded-full text-tertiary transition-colors hover:bg-sunken hover:text-foreground aria-pressed:bg-tint-brand aria-pressed:text-primary"
                >
                  <LockIcon className="size-3.5" />
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-sunken/50 px-5 py-3">
        <p className="min-w-0 flex-1 text-caption leading-relaxed text-muted-foreground">{combo.reason}</p>
        <Button variant="ghost" size="sm" onClick={onCopy}>
          <CopyIcon />
          نسخ CSS
        </Button>
      </div>
    </article>
  );
}
