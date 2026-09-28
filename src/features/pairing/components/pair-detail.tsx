import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { BookmarkIcon, CopyIcon, LinkIcon } from '@/components/ui/icons';

import type { Specimen } from '../data/specimens';
import { type Combo, type Slot, styleLabel } from '../utils/pairing';

const SCRIPT_LABEL = { ar: 'العربية', en: 'الإنجليزية', ku: 'الكردية' } as const;
const face = (s: Slot) => ({ fontFamily: `'${s.font.family}', system-ui`, fontWeight: s.weight });

/** التفاصيل: عيّنة واسعة للتركيبة، ثم بطاقة لكل خط بمعلوماته وترخيصه ومصدره */
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
  const slots = combo ? [combo.heading, combo.sub, combo.body].filter((s): s is Slot => !!s) : [];
  return (
    <Dialog open={!!combo} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-3xl sm:p-0">
        {combo && (
          <>
            <div className="border-b px-6 pt-6 pb-5 sm:px-8">
              <DialogTitle className="text-xl">
                {combo.heading.font.nameAr} + {combo.body.font.nameAr}
                {combo.sub && ` + ${combo.sub.font.nameAr}`}
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
              <p className="text-5xl leading-snug sm:text-6xl" style={face(combo.heading)}>
                {text.heading}
              </p>
              {combo.sub && (
                <p className="mt-4 text-2xl" style={face(combo.sub)}>
                  {text.sub}
                </p>
              )}
              {showLatin && (
                <p dir="ltr" className="mt-3 text-left text-2xl text-muted-foreground" style={face(combo.heading)}>
                  {text.latin}
                </p>
              )}
              <p className="mt-6 max-w-[60ch] text-lg leading-loose text-foreground/80" style={face(combo.body)}>
                {text.body}
              </p>
            </div>

            <ul className="grid gap-px bg-border sm:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
              {slots.map((s) => (
                <li key={s.role} className="flex flex-col gap-3 bg-background p-6">
                  <span className="text-caption text-tertiary">{s.role}</span>
                  <p className="text-3xl leading-snug" style={face(s)}>
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
                    <dd>
                      <Badge tone={s.font.tier === 'free' ? 'success' : 'studio'}>
                        {s.font.tier === 'free' ? 'مجاني · SIL OFL' : 'مدفوع'}
                      </Badge>
                    </dd>
                  </dl>
                  {s.font.source === 'google' && (
                    <a
                      href={`https://fonts.google.com/specimen/${s.font.family.replace(/ /g, '+')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex w-fit items-center gap-1.5 text-caption font-medium text-primary hover:underline"
                    >
                      <LinkIcon className="size-3.5" />
                      صفحة الخط في Google Fonts
                    </a>
                  )}
                </li>
              ))}
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
