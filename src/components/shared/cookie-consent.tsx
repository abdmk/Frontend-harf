import { useEffect, useId, useState, useSyncExternalStore } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { ShieldCheckIcon } from '@/components/ui/icons';
import { Switch } from '@/components/ui/switch';
import { NON_ESSENTIAL_TOOLS } from '@/config/tracking';
import { getCurrentUser, subscribeSession } from '@/lib/auth';
import {
  type ConsentCategory,
  getConsent,
  needsConsent,
  onOpenConsentSettings,
  saveConsent,
  useConsent,
} from '@/stores/consent';

const ROWS: { key: 'necessary' | ConsentCategory; title: string; body: string }[] = [
  {
    key: 'necessary',
    title: 'الضرورية',
    body: 'تسجيل الدخول، الجلسة، حماية الحساب، السلة، المظهر، وتذكّر هذا الاختيار. لا يعمل الموقع بدونها.',
  },
  { key: 'analytics', title: 'التحليلات', body: 'قياس الأداء وفهم كيف تُستخدم المنصة — لتحسينها.' },
  { key: 'marketing', title: 'التسويق', body: 'قياس الحملات والإعلانات، إن أُضيفت مستقبلاً.' },
];

/**
 * موافقة ملفات تعريف الارتباط: بطاقة كالإشعارات تظهر في أوّل زيارة، ومرّة بعد أوّل دخول لكل حساب —
 * «موافق» و«لا» بالوزن نفسه (لا دفع نحو الموافقة)، و«تخصيص» يفتح نافذة الإعدادات (وهي أيضاً في
 * التذييل وسياسة الخصوصية).
 */
export function CookieConsent() {
  const consent = useConsent();
  const userId = useSyncExternalStore(
    subscribeSession,
    () => getCurrentUser()?.id ?? null,
    () => null,
  );
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<ConsentCategory, boolean>>({ analytics: false, marketing: false });
  const id = useId();

  useEffect(
    () =>
      onOpenConsentSettings(() => {
        const cur = getConsent();
        setDraft({ analytics: cur?.analytics ?? false, marketing: cur?.marketing ?? false });
        setOpen(true);
      }),
    [],
  );

  const decide = (choice: Record<ConsentCategory, boolean>) => {
    saveConsent(choice, userId);
    setOpen(false);
  };
  const all = { analytics: true, marketing: true };
  const none = { analytics: false, marketing: false };
  // الزائر يُسأل أوّل مرّة، والحساب يُسأل بعد أوّل دخول له — لا يظهر فوق نافذة الإعدادات
  const prompt = needsConsent(consent, userId) && !open;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-dialog-md">
          <div>
            <DialogTitle>إعدادات ملفات تعريف الارتباط</DialogTitle>
            <DialogDescription className="mt-1 text-meta leading-relaxed text-muted-foreground">
              اختر ما تسمح به. يمكنك تغيير اختيارك في أي وقت من تذييل الموقع.
            </DialogDescription>
          </div>

          <ul className="divide-y rounded-lg border">
            {ROWS.map((r) => {
              const fixed = r.key === 'necessary';
              return (
                <li key={r.key} className="flex items-start gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <p id={`${id}-${r.key}`} className="text-control font-medium">
                      {r.title}
                      {fixed && <span className="ms-2 text-caption font-normal text-tertiary">تعمل دائماً</span>}
                    </p>
                    <p className="mt-1 text-meta leading-relaxed text-muted-foreground">{r.body}</p>
                  </div>
                  <Switch
                    aria-labelledby={`${id}-${r.key}`}
                    checked={fixed ? true : draft[r.key as ConsentCategory]}
                    disabled={fixed}
                    onCheckedChange={(v) => !fixed && setDraft((d) => ({ ...d, [r.key]: v }))}
                    className="mt-0.5"
                  />
                </li>
              );
            })}
          </ul>

          {NON_ESSENTIAL_TOOLS.length === 0 && (
            <p className="rounded-md bg-sunken px-4 py-3 text-meta leading-relaxed text-muted-foreground">
              لا نستخدم حالياً أي أداة تحليل أو تسويق. يُحفظ اختيارك ويُطبَّق فور إضافة أيٍّ منها.
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" className="sm:flex-1" onClick={() => decide(none)}>
              الضرورية فقط
            </Button>
            <Button variant="outline" className="sm:flex-1" onClick={() => decide(all)}>
              قبول الكل
            </Button>
            <Button className="sm:flex-1" onClick={() => decide(draft)}>
              حفظ اختياري
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {prompt && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${id}-p`}
          className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-95 animate-fade-up flex-col gap-3 rounded-xl border bg-card p-4 shadow-overlay sm:inset-x-auto sm:end-6 sm:bottom-6 sm:mx-0 sm:w-95"
        >
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sunken">
              <ShieldCheckIcon className="size-4.5" />
            </span>
            <div className="min-w-0">
              <h2 id={`${id}-p`} className="text-control font-semibold">
                ملفات تعريف الارتباط
              </h2>
              <p className="mt-0.5 text-meta leading-relaxed text-muted-foreground">
                نستخدم ملفات ضرورية لتشغيل الموقع، وأخرى للتحليلات لا تعمل إلا بموافقتك.{' '}
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  تخصيص
                </button>
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" onClick={() => decide(none)}>
              لا
            </Button>
            <Button size="sm" variant="outline" onClick={() => decide(all)}>
              موافق
            </Button>
          </div>
        </section>
      )}
    </>
  );
}
