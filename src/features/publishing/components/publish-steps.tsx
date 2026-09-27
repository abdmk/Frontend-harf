'use client';

import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Chip, ChipGroup } from '@/components/ui/chip-group';
import { Field, FieldError, FieldHint, FieldLabel } from '@/components/ui/field';
import { ArrowDownIcon, ArrowUpIcon, CloudUploadIcon, PictureIcon, TrashIcon } from '@/components/ui/icons';
import { Input, Textarea } from '@/components/ui/input';
import { RadioGroup, RadioOption } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/cn';
import { formatBytesAr } from '@/lib/format';
import { CATEGORY_LABEL, LANG_LABEL } from '@/lib/labels';
import { CATEGORIES, LANGS } from '@/types/domain/font';

import { type Draft, IMAGE_TYPES, type WorkDraft, MAX_DESCRIPTION, MAX_IMAGE_BYTES } from '../types/draft';
import { inferFontMeta } from '../utils/infer-weight';

export type StepProps = {
  draft: WorkDraft;
  set: (patch: Partial<WorkDraft>) => void;
  errors: Record<string, string | undefined>;
};

function Drop({
  accept,
  label,
  hint,
  onFiles,
}: {
  accept: string;
  label: string;
  hint: string;
  onFiles: (f: FileList) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
      }}
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors',
        over ? 'border-primary bg-tint-brand/50' : 'border-strong',
      )}
    >
      <span className="mb-1 grid size-12 place-items-center rounded-full border bg-card text-muted-foreground">
        <CloudUploadIcon className="size-5" />
      </span>
      <p className="text-control font-medium">{label}</p>
      <p className="text-caption text-tertiary">{hint}</p>
      <Button variant="outline" size="sm" className="mt-2" onClick={() => input.current?.click()}>
        اختر ملفات
      </Button>
      <input
        ref={input}
        type="file"
        multiple
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}

export function FilesStep({ draft, set, errors }: StepProps) {
  const [rejected, setRejected] = useState<string[]>([]);
  return (
    <div className="flex flex-col gap-5">
      <Drop
        accept=".otf,.ttf,.woff2"
        label="اسحب ملفات الخط هنا أو اختر من جهازك"
        hint="OTF · TTF · WOFF2 — حتى 50 ميجابايت للملف"
        onFiles={(list) => {
          const ok = [];
          const bad: string[] = [];
          for (const f of Array.from(list)) {
            const m = f.size > 50 * 1024 * 1024 ? { error: 'أكبر من 50 ميجابايت' } : inferFontMeta(f);
            if ('error' in m) bad.push(`${f.name.slice(0, 60)}: ${m.error}`);
            else ok.push(m);
          }
          setRejected(bad);
          if (ok.length) set({ files: [...draft.files, ...ok].slice(0, 40) });
        }}
      />
      {rejected.length > 0 && (
        <ul role="alert" className="flex flex-col gap-1 text-caption text-dgr-text">
          {rejected.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
      <FieldError>{errors.files}</FieldError>
      {draft.files.length > 0 && (
        <section className="rounded-lg border bg-card p-2 sm:p-4">
          <h3 className="flex items-center justify-between px-2 pb-2 text-control font-semibold">
            الأوزان المقروءة{' '}
            <span className="text-caption font-normal text-tertiary">({draft.files.length} ملفات)</span>
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الملف</TableHead>
                <TableHead>الوزن</TableHead>
                <TableHead>الصيغة</TableHead>
                <TableHead>الحجم</TableHead>
                <TableHead>
                  <span className="sr-only">إجراء</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {draft.files.map((f, i) => (
                <TableRow key={`${f.name}-${i}`}>
                  <TableCell dir="ltr" className="text-right font-mono text-caption">
                    {f.name}
                  </TableCell>
                  <TableCell dir="ltr" className="text-right font-medium">
                    {f.weight} {f.style}
                  </TableCell>
                  <TableCell className="uppercase">{f.format}</TableCell>
                  <TableCell className="text-muted-foreground">{formatBytesAr(f.size)}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      aria-label={`احذف ${f.name}`}
                      onClick={() => set({ files: draft.files.filter((_, j) => j !== i) })}
                      className="grid size-8 place-items-center rounded-xs text-tertiary hover:bg-sunken hover:text-foreground"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="px-2 pt-2 text-caption text-tertiary">
            في العرض يُستنتج الوزن من اسم الملف؛ في المنتج يقرأه الخادم من جداول الخط نفسها.
          </p>
        </section>
      )}
    </div>
  );
}

export function ImagesStep({
  images,
  setImages,
  errors,
}: {
  images: { url: string; name: string }[];
  setImages: (v: { url: string; name: string }[]) => void;
  errors: Record<string, string | undefined>;
}) {
  const [rejected, setRejected] = useState<string[]>([]);
  const move = (i: number, d: -1 | 1) => {
    const next = [...images];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x!);
    setImages(next);
  };
  return (
    <div className="flex flex-col gap-5">
      <Drop
        accept={IMAGE_TYPES.join(',')}
        label="أضف صور الخط"
        hint="PNG · JPG · WEBP — نسبة 4:3 · ‎1600×1200 موصى به · حتى 5 ميجابايت"
        onFiles={(list) => {
          const bad: string[] = [];
          const ok: { url: string; name: string }[] = [];
          for (const f of Array.from(list)) {
            if (!(IMAGE_TYPES as readonly string[]).includes(f.type))
              bad.push(`${f.name.slice(0, 60)}: صيغة صورة غير مدعومة`);
            else if (f.size > MAX_IMAGE_BYTES) bad.push(`${f.name.slice(0, 60)}: أكبر من 5 ميجابايت`);
            else ok.push({ url: URL.createObjectURL(f), name: f.name.slice(0, 120) });
          }
          setRejected(bad);
          setImages([...images, ...ok].slice(0, 12));
        }}
      />
      {rejected.length > 0 && (
        <ul role="alert" className="flex flex-col gap-1 text-caption text-dgr-text">
          {rejected.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
      <FieldError>{errors.images}</FieldError>
      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img, i) => (
            <li key={img.url} className="overflow-hidden rounded-md border bg-card">
              <div className="relative aspect-[4/3] bg-sunken">
                {/* eslint-disable-next-line @next/next/no-img-element -- معاينة محلية من blob: قبل الرفع */}
                <img src={img.url} alt={img.name} className="size-full object-cover" />
                {i === 0 && (
                  <span className="absolute start-2 top-2 rounded-full bg-ink px-2 py-0.5 text-micro text-ink-foreground">
                    الغلاف
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 p-1.5">
                <div className="flex">
                  <button
                    type="button"
                    aria-label="قدّم الصورة"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    className="grid size-8 place-items-center rounded-xs text-muted-foreground hover:bg-sunken disabled:opacity-30"
                  >
                    <ArrowUpIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="أخّر الصورة"
                    disabled={i === images.length - 1}
                    onClick={() => move(i, 1)}
                    className="grid size-8 place-items-center rounded-xs text-muted-foreground hover:bg-sunken disabled:opacity-30"
                  >
                    <ArrowDownIcon className="size-4" />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label={`احذف ${img.name}`}
                  onClick={() => {
                    URL.revokeObjectURL(img.url);
                    setImages(images.filter((_, j) => j !== i));
                  }}
                  className="grid size-8 place-items-center rounded-xs text-tertiary hover:bg-sunken hover:text-foreground"
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {!images.length && (
        <p className="flex items-center gap-2 text-caption text-tertiary">
          <PictureIcon className="size-4" />
          الصورة الأولى غلاف البطاقة في المكتبة. رتّبها بالسهمين.
        </p>
      )}
    </div>
  );
}

export function InfoStep({ draft, set, errors }: StepProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field>
        <FieldLabel htmlFor="d-ar" required>
          الاسم بالعربية
        </FieldLabel>
        <Input
          id="d-ar"
          value={draft.nameAr}
          maxLength={60}
          onChange={(e) => set({ nameAr: e.target.value })}
          aria-invalid={!!errors.nameAr}
        />
        <FieldError>{errors.nameAr}</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="d-la">الاسم اللاتيني</FieldLabel>
        <Input
          id="d-la"
          dir="ltr"
          value={draft.nameLatin}
          maxLength={60}
          onChange={(e) => set({ nameLatin: e.target.value })}
          aria-invalid={!!errors.nameLatin}
        />
        <FieldError>{errors.nameLatin}</FieldError>
      </Field>
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="d-des" required>
          المصمّمون
        </FieldLabel>
        <Input
          id="d-des"
          value={draft.designers}
          maxLength={120}
          placeholder="افصل بين الأسماء بفاصلة"
          onChange={(e) => set({ designers: e.target.value })}
          aria-invalid={!!errors.designers}
        />
        <FieldError>{errors.designers}</FieldError>
      </Field>
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="d-desc">الوصف</FieldLabel>
        <Textarea
          id="d-desc"
          value={draft.description}
          maxLength={MAX_DESCRIPTION}
          onChange={(e) => set({ description: e.target.value })}
        />
        <FieldHint className="flex justify-between">
          <span>يظهر في صفحة الخط</span>
          <span dir="ltr">
            {draft.description.length} / {MAX_DESCRIPTION}
          </span>
        </FieldHint>
      </Field>
      <fieldset className="flex flex-col gap-2 sm:col-span-2">
        <legend className="mb-2 text-meta font-medium text-muted-foreground">التصنيف — واحد أو أكثر</legend>
        <ChipGroup
          type="multiple"
          value={draft.categories}
          onValueChange={(v) => set({ categories: v as Draft['categories'] })}
          aria-label="التصنيف"
        >
          {CATEGORIES.map((c) => (
            <Chip key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </Chip>
          ))}
        </ChipGroup>
        <FieldError>{errors.categories}</FieldError>
      </fieldset>
      <fieldset className="flex flex-col gap-2 sm:col-span-2">
        <legend className="mb-2 text-meta font-medium text-muted-foreground">اللغات المدعومة</legend>
        <ChipGroup
          type="multiple"
          value={draft.langs}
          onValueChange={(v) => set({ langs: v as Draft['langs'] })}
          aria-label="اللغات"
        >
          {LANGS.map((l) => (
            <Chip key={l} value={l}>
              {LANG_LABEL[l]}
            </Chip>
          ))}
        </ChipGroup>
        <FieldError>{errors.langs}</FieldError>
      </fieldset>
    </div>
  );
}

export function PricingStep({ draft, set, errors }: StepProps) {
  if (draft.mode === 'admin')
    return (
      <div className="grid gap-5">
        <RadioGroup
          aria-label="مصدر الخط"
          value={draft.source.kind}
          onValueChange={(v) => set({ source: { ...draft.source, kind: v as Draft['source']['kind'] } })}
          className="flex flex-wrap gap-6"
        >
          <RadioOption value="purchased" label="مشترى من موقع" />
          <RadioOption value="free" label="مجاني من موقع" />
          <RadioOption value="trial" label="تجريبي فقط" />
        </RadioGroup>
        <Field>
          <FieldLabel htmlFor="s-url" required>
            رابط صفحة الخط في المصدر
          </FieldLabel>
          <Input
            id="s-url"
            dir="ltr"
            type="url"
            placeholder="https://"
            value={draft.source.url}
            maxLength={300}
            onChange={(e) => set({ source: { ...draft.source, url: e.target.value } })}
            aria-invalid={!!errors.source}
          />
          <FieldError>{errors.source}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="s-site">اسم الموقع</FieldLabel>
          <Input
            id="s-site"
            value={draft.source.site}
            maxLength={80}
            onChange={(e) => set({ source: { ...draft.source, site: e.target.value } })}
          />
        </Field>
        <fieldset>
          <legend className="mb-3 text-meta font-medium text-muted-foreground">الرخصة كما وردت</legend>
          <RadioGroup
            aria-label="الرخصة كما وردت"
            value={draft.source.license}
            onValueChange={(v) => set({ source: { ...draft.source, license: v as Draft['source']['license'] } })}
            className="flex flex-wrap gap-6"
          >
            <RadioOption value="personal" label="شخصي فقط" />
            <RadioOption value="commercial" label="شخصي وتجاري" />
            <RadioOption value="ofl" label="SIL OFL" />
          </RadioGroup>
        </fieldset>
        <p className="rounded-md bg-sunken p-4 text-meta text-muted-foreground">
          الخط الخارجي لا يُباع في حرف — نعرضه ونرسل المشتري إلى المصدر.
        </p>
      </div>
    );

  return (
    <div className="grid gap-6">
      <fieldset>
        <legend className="mb-3 text-meta font-medium text-muted-foreground">الإتاحة</legend>
        <RadioGroup
          aria-label="الإتاحة"
          value={draft.availability}
          onValueChange={(v) => set({ availability: v as Draft['availability'] })}
          className="flex gap-6"
        >
          <RadioOption value="free" label="مجاني" />
          <RadioOption value="paid" label="مدفوع" />
        </RadioGroup>
      </fieldset>
      {draft.availability === 'paid' && (
        <>
          <label className="flex items-center justify-between gap-4 rounded-md border p-4 text-control">
            أوفّر نسخة تجريبية مجانية للمعاينة (وزن واحد يكفي)
            <Switch checked={draft.trial} onCheckedChange={(v) => set({ trial: v })} />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="p-fam">سعر العائلة (دولار)</FieldLabel>
              <Input
                id="p-fam"
                type="number"
                dir="ltr"
                min={0}
                max={10000}
                value={draft.familyPrice}
                onChange={(e) => set({ familyPrice: Number(e.target.value) || 0 })}
                aria-invalid={!!errors.familyPrice}
              />
              <FieldError>{errors.familyPrice}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="p-single">سعر الوزن الواحد — نسبة من سعر العائلة (%)</FieldLabel>
              <Input
                id="p-single"
                type="number"
                dir="ltr"
                min={5}
                max={100}
                value={draft.singlePct}
                onChange={(e) => set({ singlePct: Number(e.target.value) || 0 })}
              />
              <FieldHint>
                الوزن الواحد ≈ <span dir="ltr">${Math.round((draft.familyPrice * draft.singlePct) / 100)}</span>
              </FieldHint>
            </Field>
          </div>
          <p className="text-caption text-tertiary">
            نطاقات الاستخدام (سطح المكتب، الموقع، التطبيق) وعمولة المنصّة تحدّدها سياسة حرف — القيم الحالية تجريبية.
          </p>
        </>
      )}
    </div>
  );
}

export function ConsentField({ draft, set, errors }: StepProps) {
  return (
    <div>
      <label className="flex items-start gap-3 rounded-md border p-4 text-control">
        <Checkbox
          checked={!!draft.consent}
          onCheckedChange={(v) => set({ consent: v === true })}
          className="mt-0.5"
          aria-invalid={!!errors.consent}
        />
        أقرّ بأنّي أملك حقوق هذا الخط أو تفويضاً بنشره، وأنّ ملفاته خالية من حقوق طرف ثالث.
      </label>
      <FieldError className="mt-2">{errors.consent}</FieldError>
    </div>
  );
}
