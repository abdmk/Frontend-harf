import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { NON_ESSENTIAL_TOOLS } from '@/config/tracking';
import { type ConsentCategory, getConsent, onOpenConsentSettings, saveConsent, useConsent } from '@/lib/consent';

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
 * موافقة ملفات تعريف الارتباط: نافذة إعدادات (من التذييل وسياسة الخصوصية)، وشريط أوّل زيارة يظهر
 * فقط حين تُفعَّل أداة غير ضرورية. «الضرورية فقط» بوزن «قبول الكل» نفسه — لا دفع نحو الموافقة.
 */
export function CookieConsent() {
  const consent = useConsent();
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
    saveConsent(choice);
    setOpen(false);
  };
  const all = { analytics: true, marketing: true };
  const none = { analytics: false, marketing: false };
  const banner = NON_ESSENTIAL_TOOLS.length > 0 && !consent && !open;

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

      {banner && (
        <section
          aria-label="ملفات تعريف الارتباط"
          className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-2xl animate-page-in flex-col gap-4 rounded-xl border bg-card p-5 shadow-overlay sm:bottom-6 sm:flex-row sm:items-center"
        >
          <p className="flex-1 text-meta leading-relaxed text-muted-foreground">
            نستخدم ملفات ضرورية لتشغيل الموقع، وأخرى للتحليلات لا تعمل إلا بموافقتك.{' '}
            <Link to="/privacy#s-10" className="font-medium text-foreground underline underline-offset-4">
              سياسة الخصوصية
            </Link>
          </p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
              تخصيص
            </Button>
            <Button size="sm" variant="outline" onClick={() => decide(none)}>
              الضرورية فقط
            </Button>
            <Button size="sm" variant="outline" onClick={() => decide(all)}>
              قبول الكل
            </Button>
          </div>
        </section>
      )}
    </>
  );
}
