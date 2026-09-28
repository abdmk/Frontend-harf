import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeftIcon, BookmarkIcon, CopyIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';

import { BuyAction, DownloadAction, libraryItems, PriceTag } from './font-actions';
import { comboSlots, slotStyle } from './pair-card';
import type { Specimen } from '../data/specimens';
import { type Combo, styleLabel } from '../utils/pairing';

const SCRIPT_LABEL = { ar: 'العربية', en: 'الإنجليزية', ku: 'الكردية' } as const;

/** التفاصيل: عيّنة واسعة، ثم لكل خط معلوماته ورابط صفحته في حرف وتحميله أو شراؤه */
export function PairDetail({
  combo,
  text,
  showLatin,
  saved,
  onSave,
  onCopy,
  onOpenChange,
}: {
  combo: Combo | null;
  text: Specimen;
  showLatin: boolean;
  saved: boolean;
  onSave: () => void;
  onCopy: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const slots = combo ? comboSlots(combo) : [];
  return (
    <Dialog open={!!combo} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-dialog-lg sm:p-0">
        {combo && (
          <>
            <div className="border-b px-6 pt-6 pb-5 sm:px-8">
              <DialogTitle className="text-xl">
                {combo.heading.font.nameAr} + {combo.sub && `${combo.sub.font.nameAr} + `}
                {combo.body.font.nameAr}
              </DialogTitle>
              <DialogDescription className="mt-1">
                تناسق{' '}
                <strong dir="ltr" className="text-foreground">
                  {combo.score}٪
                </strong>{' '}
                — {combo.reason}
              </DialogDescription>
            </div>

            <div className="bg-sunken px-6 py-10 sm:px-12">
              <p
                className="text-5xl leading-snug [overflow-wrap:anywhere] sm:text-6xl"
                style={slotStyle(combo.heading)}
              >
                {text.heading}
              </p>
              {combo.sub && (
                <p className="mt-4 text-2xl" style={slotStyle(combo.sub)}>
                  {text.sub}
                </p>
              )}
              {showLatin && (
                <p dir="ltr" className="mt-3 text-left text-2xl text-muted-foreground" style={slotStyle(combo.heading)}>
                  {text.latin}
                </p>
              )}
              <p className="mt-6 max-w-[60ch] text-lg leading-loose text-foreground/80" style={slotStyle(combo.body)}>
                {text.body}
              </p>
            </div>

            <ul className="grid gap-px bg-border sm:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
              {slots.map((s) => {
                const items = libraryItems([s.font]);
                return (
                  <li key={s.role} className="flex flex-col gap-3 bg-background p-6">
                    <span className="text-caption text-tertiary">{s.role}</span>
                    <p className="text-3xl leading-snug" style={slotStyle(s)}>
                      أبجد هوز
                    </p>
                    <div>
                      <p className="text-control font-semibold">
                        {s.font.nameAr}{' '}
                        <span dir="ltr" className="font-normal text-muted-foreground">
                          {s.font.name}
                        </span>
                      </p>
                      <p className="text-caption text-muted-foreground">{s.font.designer ?? s.font.foundry}</p>
                    </div>
                    <p className="text-meta leading-relaxed text-muted-foreground">{s.font.desc}</p>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-caption">
                      <dt className="text-tertiary">الأسلوب</dt>
                      <dd>{styleLabel(s.font.style)}</dd>
                      <dt className="text-tertiary">الأوزان</dt>
                      <dd dir="ltr" className="text-right tabular-nums">
                        {s.font.weights.join(' · ')}
                      </dd>
                      <dt className="text-tertiary">اللغات</dt>
                      <dd>{s.font.scripts.map((x) => SCRIPT_LABEL[x]).join('، ')}</dd>
                      <dt className="text-tertiary">الترخيص</dt>
                      <dd>{s.font.tier === 'free' ? 'مجاني · SIL OFL' : <PriceTag id={s.font.id} />}</dd>
                    </dl>
                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                      <DownloadAction items={items} />
                      <BuyAction items={items} />
                      {items[0] && (
                        <Link
                          to={paths.font.getHref(items[0].font.id)}
                          className="ms-auto inline-flex items-center gap-1 text-caption font-medium text-primary hover:underline"
                        >
                          صفحة الخط
                          <ArrowLeftIcon className="size-3.5" />
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-wrap justify-end gap-2 border-t px-6 py-4 sm:px-8">
              <Button variant="outline" onClick={onCopy}>
                <CopyIcon />
                نسخ CSS
              </Button>
              <Button variant={saved ? 'secondary' : 'primary'} aria-pressed={saved} onClick={onSave}>
                <BookmarkIcon />
                {saved ? 'محفوظة' : 'حفظ التركيبة'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
