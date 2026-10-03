import { useId, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

import { BANNER_TONE_CLASS, BANNER_TONE_LABEL, BannerSlide } from '@/components/shared/banner-slide';
import { SectionCard } from '@/components/shared/section-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldHint, FieldLabel } from '@/components/ui/field';
import { ArrowDownIcon, ArrowUpIcon, PictureIcon, TextIcon, TrashIcon } from '@/components/ui/icons';
import { Input, Textarea } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';
import { prepareImage } from '@/lib/image-upload';
import {
  type Announcement,
  type Banner,
  BANNER_TONES,
  BANNERS_MAX,
  type Cta,
  DEFAULT_CTA,
  LIMITS,
  useSiteContent,
} from '@/lib/site-content';

import { AdminPageHeader } from './admin-nav';
import { BlogManager } from './blog-manager';
import { PlansManager } from './plans-manager';
import { newBannerId, saveAnnouncement, saveBanners, saveCta } from '../api/content';

/** مسودّة بنر: الصورة جاهزة (مُعاد ترميزها) والنصوص قيد الكتابة — تُتحقَّق كلّها عند الحفظ */
type Draft = Banner;

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function UnsavedBadge({ show }: { show: boolean }) {
  return show ? <Badge tone="warning">تغييرات غير محفوظة</Badge> : null;
}

const BLANK_BANNER: Omit<Banner, 'id'> = {
  image: '',
  alt: '',
  title: '',
  text: '',
  tone: 'dawn',
  href: '',
  active: true,
};

/** bare: بلا رأس البطاقة — داخل نافذة لها عنوانها (لا يتكرّر العنوان) */
function Frame({
  bare,
  children,
  ...card
}: {
  bare: boolean;
  title: string;
  description: string;
  action: React.ReactNode;
  children: React.ReactNode;
}) {
  return bare ? <div className="flex flex-col gap-3">{children}</div> : <SectionCard {...card}>{children}</SectionCard>;
}

export function BannersEditor({ saved, bare = false }: { saved: Banner[]; bare?: boolean }) {
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
    setItems((xs) => [...xs, { ...BLANK_BANNER, id: newBannerId(), image: r.url }]);
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
    <Frame
      bare={bare}
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
                  <div
                    aria-hidden
                    className={cn(
                      'aspect-[1120/290] w-full overflow-hidden rounded-md border',
                      !b.active && 'opacity-50 grayscale',
                    )}
                  >
                    <BannerSlide banner={{ ...b, alt: '' }} compact />
                  </div>
                  <span className="absolute start-2 top-2 rounded-full bg-paper/90 px-2 py-0.5 text-caption font-medium text-paper-foreground">
                    {i + 1}
                  </span>
                </div>
                <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                  {b.image ? (
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
                  ) : (
                    <>
                      <Field className="sm:col-span-2">
                        <FieldLabel htmlFor={`${id}-t-${b.id}`} required>
                          العنوان
                        </FieldLabel>
                        <Input
                          id={`${id}-t-${b.id}`}
                          value={b.title}
                          maxLength={LIMITS.title}
                          placeholder="مثال: خطوط جديدة كل أسبوع"
                          onChange={(e) => patch(i, { title: e.target.value })}
                        />
                      </Field>
                      <Field className="sm:col-span-2">
                        <FieldLabel htmlFor={`${id}-x-${b.id}`}>سطر تحت العنوان</FieldLabel>
                        <Input
                          id={`${id}-x-${b.id}`}
                          value={b.text}
                          maxLength={LIMITS.text}
                          onChange={(e) => patch(i, { text: e.target.value })}
                        />
                      </Field>
                      <Field className="sm:col-span-2">
                        <FieldLabel id={`${id}-tone-${b.id}`}>الأرضيّة</FieldLabel>
                        <div role="radiogroup" aria-labelledby={`${id}-tone-${b.id}`} className="flex flex-wrap gap-2">
                          {BANNER_TONES.map((t) => (
                            <button
                              key={t}
                              type="button"
                              role="radio"
                              aria-checked={b.tone === t}
                              onClick={() => patch(i, { tone: t })}
                              className={cn(
                                'flex items-center gap-2 rounded-full border py-1 ps-1 pe-3 text-meta transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                b.tone === t
                                  ? 'border-primary bg-tint-brand/40 font-medium text-primary'
                                  : 'hover:border-strong',
                              )}
                            >
                              <span className={cn('size-6 rounded-full border', BANNER_TONE_CLASS[t])} />
                              {BANNER_TONE_LABEL[t]}
                            </button>
                          ))}
                        </div>
                      </Field>
                    </>
                  )}
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
            <p className="text-meta text-muted-foreground">
              أضف بنراً بصورة أو بنراً نصّياً — حتى ذلك تظهر الشريحة بأرضيّات هادئة.
            </p>
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
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              loading={busy}
              disabled={items.length >= BANNERS_MAX}
              onClick={() => fileRef.current?.click()}
            >
              <PictureIcon />
              بنر بصورة
            </Button>
            <Button
              variant="outline"
              disabled={items.length >= BANNERS_MAX}
              onClick={() => setItems((xs) => [...xs, { ...BLANK_BANNER, id: newBannerId() }])}
            >
              <TextIcon />
              بنر نصّي
            </Button>
          </div>
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
        <FieldHint>
          الصورة اختيارية: PNG أو JPG أو WebP حتى 5 ميغابايت (تُعاد معالجتها وتُزال بياناتها الوصفية)، أو بنر نصّي
          بعنوان وأرضيّة لونية.
        </FieldHint>
      </div>
    </Frame>
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
const CONTENT_TABS = ['site', 'blog', 'plans'] as const;

export function ContentManager() {
  const content = useSiteContent();
  const [params, setParams] = useSearchParams();
  const tab = (CONTENT_TABS as readonly string[]).includes(params.get('tab') ?? '') ? params.get('tab')! : 'site';
  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader title="المحتوى" description="ما يراه الزائر — يظهر فور الحفظ ويُسجَّل في سجلّ النشاط." />
      <Tabs value={tab} onValueChange={(v) => setParams(v === 'site' ? {} : { tab: v }, { replace: true })}>
        <TabsList aria-label="أقسام المحتوى">
          <TabsTrigger value="site">الصفحة الرئيسية</TabsTrigger>
          <TabsTrigger value="blog">المدونة</TabsTrigger>
          <TabsTrigger value="plans">الخطط والأسعار</TabsTrigger>
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
        <TabsContent value="plans">
          <PlansManager embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}
