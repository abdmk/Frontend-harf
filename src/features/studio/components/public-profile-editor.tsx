import { useId, useRef, useState } from 'react';
import { Link } from 'react-router';

import { SectionCard } from '@/components/shared/section-card';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldHint, FieldLabel } from '@/components/ui/field';
import {
  ArrowLeftIcon,
  BuildingIcon,
  CheckIcon,
  GlobeIcon,
  PictureIcon,
  TrashIcon,
  UploadIcon,
  UserIcon,
} from '@/components/ui/icons';
import { Input, Textarea } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';
import { prepareImage } from '@/lib/image-upload';
import {
  BIO_MAX,
  BIO_MIN,
  markOf,
  PROFILE_KINDS,
  getPublicProfile,
  profileChecklist,
  profileSchema,
  type PublicProfile,
  savePublicProfile,
  SOCIALS,
  type SocialKey,
} from '@/lib/public-profile';
import type { Foundry } from '@/types/domain/foundry';

const IMG = {
  avatar: { maxBytes: 2 * 1024 * 1024, maxSide: 512, minSide: 128 },
  cover: { maxBytes: 5 * 1024 * 1024, maxSide: 1600, minSide: 300 },
} as const;

/** زرّ رفع صورة: يفحص الملف ويعيد ترميزه قبل أن يصل إلى المعاينة */
function ImagePicker({
  kind,
  label,
  onPicked,
  className,
}: {
  kind: keyof typeof IMG;
  label: string;
  onPicked: (url: string | null, error?: string) => void;
  className?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        data-kind={kind}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          setBusy(true);
          const r = await prepareImage(file, IMG[kind]);
          setBusy(false);
          if (r.ok) onPicked(r.url);
          else onPicked(null, r.error);
        }}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        loading={busy}
        className={className}
        onClick={() => input.current?.click()}
      >
        <UploadIcon />
        {label}
      </Button>
    </>
  );
}

/**
 * «الملف العام»: ما يراه الناس في صفحة استوديوك — الشعار، الغلاف، النبذة، وحسابات التواصل.
 * قائمة الاكتمال في الأعلى، و«غير مكتمل» يبقى في القائمة الجانبية حتى تكتمل.
 */
export function PublicProfileEditor({ foundry }: { foundry: Foundry }) {
  const [draft, setDraft] = useState<PublicProfile>(() => {
    const saved = getPublicProfile();
    // ما لم يُحفظ بعد يبدأ من بيانات الاستوديو الحالية
    return {
      kind: saved?.kind ?? 'foundry',
      name: saved?.name || foundry.name,
      nameEn: saved?.nameEn || foundry.nameEn,
      location: saved?.location || foundry.location,
      avatar: saved?.avatar,
      cover: saved?.cover,
      bio: saved?.bio ?? foundry.bio,
      website: saved?.website ?? foundry.links.website ?? '',
      social: saved?.social ?? {},
    };
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [saving, setSaving] = useState(false);
  const id = useId();
  const checklist = profileChecklist(draft);
  const done = checklist.filter((c) => c.done).length;
  const set = (patch: Partial<PublicProfile>) => setDraft((d) => ({ ...d, ...patch }));
  const picked = (kind: 'avatar' | 'cover') => (url: string | null, error?: string) => {
    setErrors((e) => ({ ...e, [kind]: error }));
    if (url) set({ [kind]: url });
  };

  function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = profileSchema.safeParse({
      kind: draft.kind,
      name: draft.name,
      nameEn: draft.nameEn,
      location: draft.location,
      bio: draft.bio,
      website: draft.website,
      ...Object.fromEntries((Object.keys(SOCIALS) as SocialKey[]).map((k) => [k, draft.social[k] ?? ''])),
    });
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      setErrors(Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v?.[0]])));
      return;
    }
    const v = parsed.data as Record<string, string>;
    const social = Object.fromEntries(
      (Object.keys(SOCIALS) as SocialKey[]).filter((k) => v[k]).map((k) => [k, v[k]]),
    ) as PublicProfile['social'];
    setSaving(true);
    const ok = savePublicProfile({
      ...draft,
      name: v.name!,
      nameEn: v.nameEn!,
      location: v.location!,
      bio: v.bio!,
      website: v.website!,
      social,
    });
    setSaving(false);
    setErrors({});
    if (ok) toast({ tone: 'success', title: 'حُفظ ملفك العام', description: 'يظهر الآن في صفحة استوديوك.' });
    else
      toast({ tone: 'danger', title: 'تعذّر الحفظ', description: 'الصور كبيرة على مساحة المتصفّح — جرّب صورة أصغر.' });
  }

  return (
    <form onSubmit={save} noValidate className="flex flex-col gap-5">
      {done < checklist.length && (
        <section aria-labelledby={`${id}-cl`} className="rounded-xl border border-warn-500/40 bg-tint-warn p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id={`${id}-cl`} className="font-semibold text-warn-text">
              أكمل ملفك العام
            </h2>
            <span className="text-meta text-warn-text tabular-nums">
              {done} من {checklist.length}
            </span>
          </div>
          <p className="mt-1 text-meta text-muted-foreground">الملف المكتمل يعرّف الناس بك ويكسب ثقتهم بخطوطك.</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {checklist.map((c) => (
              <li key={c.key} className="flex items-center gap-2 text-control">
                <span
                  className={cn(
                    'grid size-5 shrink-0 place-items-center rounded-full border',
                    c.done ? 'border-ok-700 bg-ok-700 text-white' : 'border-warn-500/60 bg-card',
                  )}
                >
                  {c.done && <CheckIcon className="size-3" />}
                </span>
                <span className={c.done ? 'text-muted-foreground line-through' : ''}>{c.label}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <SectionCard title="نوع الصفحة" description="كيف يراك الناس — يمكنك تغييره متى شئت.">
        <div role="radiogroup" aria-label="نوع الصفحة" className="grid gap-3 sm:grid-cols-2">
          {PROFILE_KINDS.map((k) => {
            const on = draft.kind === k;
            const Icon = k === 'foundry' ? BuildingIcon : UserIcon;
            return (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => set({ kind: k })}
                className={cn(
                  'flex items-start gap-3 rounded-lg border bg-card p-4 text-start transition-[border-color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  on ? 'border-foreground ring-1 ring-foreground' : 'hover:border-strong',
                )}
              >
                <span
                  className={cn(
                    'grid size-10 shrink-0 place-items-center bg-sunken text-foreground [&_svg]:size-4.5',
                    k === 'foundry' ? 'rounded-md' : 'rounded-full',
                  )}
                >
                  <Icon />
                </span>
                <span>
                  <span className="block text-control font-semibold">{k === 'foundry' ? 'مسبك' : 'مصمّم مستقلّ'}</span>
                  <span className="mt-0.5 block text-meta leading-relaxed text-muted-foreground">
                    {k === 'foundry'
                      ? 'فريق أو علامة تنشر خطوطاً لعدّة مصمّمين — شعار مربّع، ومصمّمو المسبك في صفحتك.'
                      : 'صفحتك الشخصية كمصمّم — صورتك، وأعمالك أنت.'}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="الصور" description="الغلاف والشعار أو الصورة كما يظهران في صفحتك." bodyClassName="p-0">
        <div className="relative h-28 overflow-hidden border-b bg-sunken sm:aspect-[4/1] sm:h-auto">
          {draft.cover ? (
            <img src={draft.cover} alt="غلاف الاستوديو" className="size-full object-cover" />
          ) : (
            <span className="grid size-full place-items-center text-meta text-tertiary">
              <span className="flex items-center gap-2">
                <PictureIcon className="size-4.5" />
                بلا غلاف — 1600×400 بكسل مناسب
              </span>
            </span>
          )}
          <div className="absolute end-3 bottom-3 flex gap-2">
            {draft.cover && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                aria-label="إزالة الغلاف"
                onClick={() => set({ cover: undefined })}
              >
                <TrashIcon />
              </Button>
            )}
            <ImagePicker
              kind="cover"
              label={draft.cover ? 'تغيير الغلاف' : 'رفع غلاف'}
              onPicked={picked('cover')}
              className="bg-card"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-5 p-6">
          {draft.avatar ? (
            <img
              src={draft.avatar}
              alt={draft.kind === 'designer' ? 'صورتك' : 'شعار المسبك'}
              className={cn('size-20 object-cover', draft.kind === 'designer' ? 'rounded-full' : 'rounded-lg')}
            />
          ) : (
            <span
              className={cn(
                'grid size-20 place-items-center bg-sunken text-3xl font-semibold text-muted-foreground',
                draft.kind === 'designer' ? 'rounded-full' : 'rounded-lg',
              )}
            >
              {draft.name ? markOf(draft.name) : foundry.mark}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{draft.kind === 'designer' ? 'صورتك الشخصية' : 'شعار المسبك'}</p>
            <p className="text-meta text-muted-foreground">PNG أو JPG أو WebP · مربّع 512 بكسل على الأقل مناسب</p>
          </div>
          <div className="flex gap-2">
            {draft.avatar && (
              <Button type="button" size="sm" variant="ghost" onClick={() => set({ avatar: undefined })}>
                إزالة
              </Button>
            )}
            <ImagePicker
              kind="avatar"
              label={draft.avatar ? 'تغيير' : draft.kind === 'designer' ? 'رفع صورة' : 'رفع شعار'}
              onPicked={picked('avatar')}
            />
          </div>
        </div>
        {(errors.avatar || errors.cover) && (
          <p role="alert" className="px-6 pb-5 text-meta text-dgr-text">
            {errors.cover ?? errors.avatar}
          </p>
        )}
      </SectionCard>

      <SectionCard title="الاسم والموقع" description="كما يظهران أعلى صفحتك.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor={`${id}-name`} required>
              {draft.kind === 'designer' ? 'اسمك' : 'اسم المسبك'}
            </FieldLabel>
            <Input
              id={`${id}-name`}
              value={draft.name}
              maxLength={60}
              onChange={(e) => set({ name: e.target.value })}
              aria-invalid={!!errors.name}
            />
            <FieldError>{errors.name}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-en`}>الاسم باللاتينية</FieldLabel>
            <Input
              id={`${id}-en`}
              dir="ltr"
              value={draft.nameEn}
              maxLength={60}
              placeholder={draft.kind === 'designer' ? 'Your Name' : 'Foundry Name'}
              onChange={(e) => set({ nameEn: e.target.value })}
              aria-invalid={!!errors.nameEn}
            />
            <FieldError>{errors.nameEn}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-loc`}>المدينة والدولة</FieldLabel>
            <Input
              id={`${id}-loc`}
              value={draft.location}
              maxLength={60}
              placeholder="بغداد، العراق"
              onChange={(e) => set({ location: e.target.value })}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard
        title="النبذة"
        description={draft.kind === 'designer' ? 'عنك — ما تصمّمه ولمن.' : 'عن المسبك — ما يصمّمه ولمن.'}
      >
        <Field>
          <FieldLabel htmlFor={`${id}-bio`} className="sr-only">
            النبذة
          </FieldLabel>
          <Textarea
            id={`${id}-bio`}
            value={draft.bio}
            maxLength={BIO_MAX}
            onChange={(e) => set({ bio: e.target.value })}
            className="min-h-28"
            aria-invalid={!!errors.bio}
            aria-describedby={`${id}-bio-hint`}
          />
          <FieldHint id={`${id}-bio-hint`} className="flex justify-between">
            <span>{BIO_MIN} حرفاً على الأقل</span>
            <span dir="ltr" className="tabular-nums">
              {draft.bio.length} / {BIO_MAX}
            </span>
          </FieldHint>
          <FieldError>{errors.bio}</FieldError>
        </Field>
      </SectionCard>

      <SectionCard title="روابط التواصل" description="تظهر أيقونات في صفحتك. اسم المستخدم فقط.">
        <ul className="flex flex-col divide-y">
          <li className="pb-4">
            <Field>
              <FieldLabel htmlFor={`${id}-web`} className="flex items-center gap-2">
                <GlobeIcon className="size-4" />
                الموقع الإلكتروني
              </FieldLabel>
              <Input
                id={`${id}-web`}
                dir="ltr"
                type="url"
                placeholder="https://"
                maxLength={200}
                value={draft.website}
                onChange={(e) => set({ website: e.target.value })}
                aria-invalid={!!errors.website}
              />
              <FieldError>{errors.website}</FieldError>
            </Field>
          </li>
          {(Object.keys(SOCIALS) as SocialKey[]).map((k) => (
            <li key={k} className="py-4 last:pb-0">
              <Field>
                <FieldLabel htmlFor={`${id}-${k}`}>{SOCIALS[k].label}</FieldLabel>
                <div
                  dir="ltr"
                  className="flex items-stretch overflow-hidden rounded-sm border bg-card focus-within:ring-2 focus-within:ring-ring"
                >
                  <span className="flex items-center bg-sunken px-3 text-meta text-muted-foreground">
                    {SOCIALS[k].prefix}
                  </span>
                  <input
                    id={`${id}-${k}`}
                    value={draft.social[k] ?? ''}
                    maxLength={41}
                    spellCheck={false}
                    autoComplete="off"
                    placeholder="username"
                    onChange={(e) => set({ social: { ...draft.social, [k]: e.target.value } })}
                    aria-invalid={!!errors[k]}
                    className="h-10 min-w-0 flex-1 bg-transparent px-3 text-control outline-none"
                  />
                </div>
                <FieldError>{errors[k]}</FieldError>
              </Field>
            </li>
          ))}
        </ul>
      </SectionCard>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={paths.foundry.getHref(foundry.id)}
          className="inline-flex items-center gap-1 text-meta font-medium text-muted-foreground hover:text-primary"
        >
          معاينة صفحتك العامة
          <ArrowLeftIcon className="size-3.5" />
        </Link>
        <Button type="submit" loading={saving}>
          حفظ الملف العام
        </Button>
      </div>
    </form>
  );
}
