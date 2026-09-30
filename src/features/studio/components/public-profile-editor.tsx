import { useId, useRef, useState } from 'react';
import { Link } from 'react-router';

import { SectionCard } from '@/components/shared/section-card';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldHint, FieldLabel } from '@/components/ui/field';
import { ArrowLeftIcon, CheckIcon, GlobeIcon, PictureIcon, TrashIcon, UploadIcon } from '@/components/ui/icons';
import { Input, Textarea } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';
import { prepareImage } from '@/lib/image-upload';
import {
  BIO_MAX,
  BIO_MIN,
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
  const [draft, setDraft] = useState<PublicProfile>(
    () => getPublicProfile() ?? { bio: foundry.bio, website: foundry.links.website ?? '', social: {} },
  );
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
    const ok = savePublicProfile({ ...draft, bio: v.bio!, website: v.website!, social });
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

      <SectionCard title="الهوية" description="الغلاف والشعار كما يظهران في صفحتك." bodyClassName="p-0">
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
            <img src={draft.avatar} alt="شعار الاستوديو" className="size-20 rounded-lg object-cover" />
          ) : (
            <span className="grid size-20 place-items-center rounded-lg bg-sunken text-3xl font-semibold text-muted-foreground">
              {foundry.mark}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{foundry.name}</p>
            <p className="text-meta text-muted-foreground">PNG أو JPG أو WebP · مربّع 512 بكسل على الأقل مناسب</p>
          </div>
          <div className="flex gap-2">
            {draft.avatar && (
              <Button type="button" size="sm" variant="ghost" onClick={() => set({ avatar: undefined })}>
                إزالة
              </Button>
            )}
            <ImagePicker kind="avatar" label={draft.avatar ? 'تغيير الشعار' : 'رفع شعار'} onPicked={picked('avatar')} />
          </div>
        </div>
        {(errors.avatar || errors.cover) && (
          <p role="alert" className="px-6 pb-5 text-meta text-dgr-text">
            {errors.cover ?? errors.avatar}
          </p>
        )}
      </SectionCard>

      <SectionCard title="النبذة" description="عن الاستوديو أو المصمّم — ما تصمّمه ولمن.">
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
