import { useId, useRef, useState } from 'react';

import { SectionCard } from '@/components/shared/section-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldHint, FieldLabel } from '@/components/ui/field';
import { ArrowDownIcon, ArrowUpIcon, PictureIcon, PlusIcon, TrashIcon } from '@/components/ui/icons';
import { Input, Textarea } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';
import { prepareImage } from '@/lib/image-upload';
import {
  type Announcement,
  type Banner,
  BANNERS_MAX,
  type Cta,
  DEFAULT_CTA,
  LIMITS,
  useSiteContent,
} from '@/lib/site-content';

import { AdminPageHeader } from './admin-nav';
import { BlogManager } from './blog-manager';
import { newBannerId, saveAnnouncement, saveBanners, saveCta } from '../api/content';

/** مسودّة بنر: الصورة جاهزة (مُعاد ترميزها) والنصوص قيد الكتابة — تُتحقَّق كلّها عند الحفظ */
type Draft = Banner;

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function UnsavedBadge({ show }: { show: boolean }) {
  return show ? <Badge tone="warning">تغييرات غير محفوظة</Badge> : null;
}

export function BannersEditor({ saved }: { saved: Banner[] }) {
  const [items, setItems] = useState<Draft[]>(saved);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const dirty = !same(items, saved);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    // فحص البايتات الأولى، رفض SVG، وإعادة ترميز إلى JPEG (يزيل البيانات الوصفية)
    const r = await prepareImage(file, { maxBytes: 5 * 1024 * 1024, maxSide: 2240, minSide: 280, quality: 0.82 });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    setError(undefined);
    setItems((xs) => [...xs, { id: newBannerId(), image: r.url, alt: '', href: '', active: true }]);
  }

  const patch = (i: number, p: Partial<Draft>) => setItems((xs) => xs.map((x, k) => (k === i ? { ...x, ...p } : x)));
  const move = (i: number, d: -1 | 1) =>
    setItems((xs) => {
      const next = [...xs];
      [next[i], next[i + d]] = [next[i + d]!, next[i]!];
      return next;
    });

  function save() {
    const r = saveBanners(items);
    if (!r.ok) return setError(r.error);
    setError(undefined);
    toast({ tone: 'success', title: 'حُفظت البنرات', description: 'تظهر في الشريحة أعلى المكتبة.' });
  }

  return (
    <SectionCard
      title="بنرات الصفحة الرئيسية"
      description={`الشريحة أعلى المكتبة · حتى ${BANNERS_MAX} بنرات · المقاس المقترح 2240×580`}
      action={<UnsavedBadge show={dirty} />}
    >
      <div className="flex flex-col gap-4">
        {items.length ? (
          <ol className="flex flex-col gap-4">
            {items.map((b, i) => (
              <li key={b.id} className="flex flex-col gap-4 rounded-lg border p-4 lg:flex-row">
                <div className="relative shrink-0 lg:w-72">
                  <img
                    src={b.image}
                    alt=""
                    className={cn(
                      'aspect-[1120/290] w-full rounded-md border object-cover',
                      !b.active && 'opacity-50 grayscale',
                    )}
                  />
                  <span className="absolute start-2 top-2 rounded-full bg-paper/90 px-2 py-0.5 text-caption font-medium text-paper-foreground">
                    {i + 1}
                  </span>
                </div>
                <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                  <Field className="sm:col-span-2">
                    <FieldLabel htmlFor={`${id}-alt-${b.id}`} required>
                      وصف الصورة
                    </FieldLabel>
                    <Input
                      id={`${id}-alt-${b.id}`}
                      value={b.alt}
                      maxLength={LIMITS.alt}
                      placeholder="ما الذي يظهر في البنر؟ (لقارئ الشاشة)"
                      onChange={(e) => patch(i, { alt: e.target.value })}
                    />
                  </Field>
                  <Field className="sm:col-span-2">
                    <FieldLabel htmlFor={`${id}-href-${b.id}`}>الرابط</FieldLabel>
                    <Input
                      id={`${id}-href-${b.id}`}
                      value={b.href}
                      dir="ltr"
                      maxLength={LIMITS.href}
                      placeholder="/fonts/zaetoon أو https://…"
                      onChange={(e) => patch(i, { href: e.target.value })}
                    />
                  </Field>
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-2">
                    <label className="inline-flex items-center gap-2 text-meta">
                      <Switch checked={b.active} onCheckedChange={(v) => patch(i, { active: v })} />
                      {b.active ? 'مفعّل' : 'معطّل'}
                    </label>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={i === 0}
                        onClick={() => move(i, -1)}
                        aria-label={`تقديم البنر ${i + 1}`}
                      >
                        <ArrowUpIcon className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={i === items.length - 1}
                        onClick={() => move(i, 1)}
                        aria-label={`تأخير البنر ${i + 1}`}
                      >
                        <ArrowDownIcon className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setItems((xs) => xs.filter((_, k) => k !== i))}
                        aria-label={`حذف البنر ${i + 1}`}
                      >
                        <TrashIcon className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center">
            <PictureIcon className="size-6 text-tertiary" />
            <p className="text-control font-medium">لا بنرات بعد</p>
            <p className="text-meta text-muted-foreground">تظهر الشريحة بأرضيات هادئة حتى تضيف بنراً مفعّلاً.</p>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={onFile}
        />
        <FieldError>{error}</FieldError>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            loading={busy}
            disabled={items.length >= BANNERS_MAX}
            onClick={() => fileRef.current?.click()}
          >
            <PlusIcon />
            إضافة بنر
          </Button>
          <div className="flex gap-2">
            {dirty && (
              <Button variant="ghost" onClick={() => setItems(saved)}>
                تجاهل التغييرات
              </Button>
            )}
            <Button disabled={!dirty} onClick={save}>
              حفظ البنرات
            </Button>
          </div>
        </div>
        <FieldHint>PNG أو JPG أو WebP حتى 5 ميغابايت. تُعاد معالجة الصورة وتُزال بياناتها الوصفية قبل الحفظ.</FieldHint>
      </div>
    </SectionCard>
  );
}

function AnnouncementEditor({ saved }: { saved: Announcement }) {
  const [a, setA] = useState(saved);
  const [error, setError] = useState<string>();
  const id = useId();
  const dirty = !same(a, saved);
  function save() {
    const r = saveAnnouncement(a);
    if (!r.ok) return setError(r.error);
    setError(undefined);
    toast({ tone: 'success', title: a.active ? 'فُعّل شريط الإعلان' : 'حُفظ شريط الإعلان' });
  }
  return (
    <SectionCard
      title="شريط الإعلان"
      description="سطر أعلى كل صفحات الموقع — لعرض أو خبر مؤقّت"
      action={<UnsavedBadge show={dirty} />}
    >
      <div className="flex flex-col gap-4">
        <label className="inline-flex items-center gap-2 self-start text-control font-medium">
          <Switch checked={a.active} onCheckedChange={(v) => setA({ ...a, active: v })} />
          {a.active ? 'ظاهر في الموقع' : 'مخفي'}
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor={`${id}-t`}>النص</FieldLabel>
            <Input
              id={`${id}-t`}
              value={a.text}
              maxLength={LIMITS.text}
              placeholder="خصم 30% على الخطة السنوية حتى نهاية الشهر"
              onChange={(e) => setA({ ...a, text: e.target.value })}
            />
            <FieldHint>
              <span dir="ltr">{a.text.length}</span>/{LIMITS.text}
            </FieldHint>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-h`}>الرابط (اختياري)</FieldLabel>
            <Input
              id={`${id}-h`}
              value={a.href}
              dir="ltr"
              maxLength={LIMITS.href}
              placeholder="/account/subscription"
              onChange={(e) => setA({ ...a, href: e.target.value })}
            />
          </Field>
        </div>
        {a.text && (
          <div aria-hidden className="rounded-md bg-ink px-4 py-2.5 text-center text-meta text-ink-foreground">
            {a.text}
          </div>
        )}
        <FieldError>{error}</FieldError>
        <Button disabled={!dirty} onClick={save} className="self-end">
          حفظ
        </Button>
      </div>
    </SectionCard>
  );
}

function CtaEditor({ saved }: { saved: Cta }) {
  const [c, setC] = useState(saved);
  const [error, setError] = useState<string>();
  const id = useId();
  const dirty = !same(c, saved);
  function save() {
    const r = saveCta(c);
    if (!r.ok) return setError(r.error);
    setError(undefined);
    toast({ tone: 'success', title: 'حُفظت دعوة التواصل' });
  }
  return (
    <SectionCard
      title="دعوة التواصل"
      description="الصندوق أسفل المكتبة وصفحات الخطوط"
      action={<UnsavedBadge show={dirty} />}
    >
      <div className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor={`${id}-t`} required>
            العنوان
          </FieldLabel>
          <Input
            id={`${id}-t`}
            value={c.title}
            maxLength={LIMITS.ctaTitle}
            onChange={(e) => setC({ ...c, title: e.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-l`} required>
            النص
          </FieldLabel>
          <Textarea
            id={`${id}-l`}
            value={c.lead}
            maxLength={LIMITS.ctaLead}
            onChange={(e) => setC({ ...c, lead: e.target.value })}
            className="min-h-20"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-b`} required>
            نصّ الزرّ
          </FieldLabel>
          <Input
            id={`${id}-b`}
            value={c.button}
            maxLength={LIMITS.ctaButton}
            onChange={(e) => setC({ ...c, button: e.target.value })}
          />
        </Field>
        <FieldError>{error}</FieldError>
        <div className="flex flex-wrap justify-end gap-2">
          {!same(c, DEFAULT_CTA) && (
            <Button variant="ghost" onClick={() => setC(DEFAULT_CTA)}>
              النص الأصلي
            </Button>
          )}
          <Button disabled={!dirty} onClick={save}>
            حفظ
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}

/** «المحتوى»: ما يظهر للزوّار ويتغيّر دون نشر نسخة جديدة — البنرات، شريط الإعلان، ودعوة التواصل */
export function ContentManager() {
  const content = useSiteContent();
  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader title="المحتوى" description="التغييرات تظهر في الموقع فور الحفظ، وتُسجَّل في سجلّ النشاط." />
      <Tabs defaultValue="site">
        <TabsList aria-label="أقسام المحتوى">
          <TabsTrigger value="site">الصفحة الرئيسية</TabsTrigger>
          <TabsTrigger value="blog">المدونة</TabsTrigger>
        </TabsList>
        <TabsContent value="site" className="flex flex-col gap-5">
          {/* key: يعيد تهيئة المسودّة بعد الحفظ أو تغيّر المحفوظ من تبويب آخر */}
          <BannersEditor
            key={JSON.stringify(content.banners.map((b) => [b.id, b.active, b.alt, b.href]))}
            saved={content.banners}
          />
          <AnnouncementEditor key={JSON.stringify(content.announcement)} saved={content.announcement} />
          <CtaEditor key={JSON.stringify(content.cta)} saved={content.cta} />
        </TabsContent>
        <TabsContent value="blog">
          <BlogManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
