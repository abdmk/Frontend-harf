import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import { useRef, useState } from 'react';

import { FileIcon } from '@/components/shared/file-icon';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Chip, ChipGroup } from '@/components/ui/chip-group';
import { Field, FieldError, FieldHint, FieldLabel } from '@/components/ui/field';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  CloudUploadIcon,
  DollarIcon,
  GiftIcon,
  PictureIcon,
  TrashIcon,
} from '@/components/ui/icons';
import { Input, Textarea } from '@/components/ui/input';
import { RadioGroup, RadioOption } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/cn';
import { formatBytesAr } from '@/lib/format';
import { CATEGORY_LABEL, LANG_LABEL } from '@/lib/labels';
import { CATEGORIES, LANGS } from '@/types/domain/font';

import { type Draft, IMAGE_TYPES, type WorkDraft, MAX_DESCRIPTION, MAX_IMAGE_BYTES } from '../types/draft';
import { inferFontMeta } from '../utils/infer-weight';

/** صندوق شرح رمادي تحت الحقل (نمط مراجع Wayl): يشرح لماذا نطلب المعلومة وأين تظهر */
export function Hint({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('rounded-md bg-sunken px-4 py-3 text-meta leading-relaxed text-muted-foreground', className)}>
      {children}
    </p>
  );
}

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
      {draft.files.length > 0 ? (
        <section aria-labelledby="files-title">
          <h2 id="files-title" className="mb-2.5 flex items-baseline justify-between text-control font-semibold">
            الأوزان المقروءة
            <span className="text-caption font-normal text-tertiary">{weightsCount(draft.files.length)}</span>
          </h2>
          <ul className="divide-y rounded-lg border bg-card">
            {draft.files
              .map((f, i) => ({ f, i }))
              .sort((x, y) => x.f.weight - y.f.weight)
              .map(({ f, i }) => (
                <li key={`${f.name}-${i}`} className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
                  <FileIcon kind={f.format} className="h-9 w-7.5" />
                  <div className="min-w-0 flex-1">
                    <p dir="ltr" className="truncate text-right text-control font-medium">
                      {f.weight} {f.style}
                    </p>
                    <p dir="ltr" className="truncate text-right font-mono text-caption text-tertiary">
                      {f.name} · {formatBytesAr(f.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`احذف ${f.name}`}
                    onClick={() => set({ files: draft.files.filter((_, j) => j !== i) })}
                    className="grid size-9 shrink-0 place-items-center rounded-full text-tertiary transition-colors hover:bg-sunken hover:text-foreground"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </li>
              ))}
          </ul>
        </section>
      ) : null}
      <Hint>
        نقرأ من كل ملف وزنه ونمطه وصيغته، فلا تكتبها بيدك. ارفع العائلة كاملة مرّة واحدة — يمكنك إضافة أوزان لاحقاً قبل
        الإرسال.
      </Hint>
    </div>
  );
}

const weightsCount = (n: number) => (n === 1 ? 'وزن واحد' : n === 2 ? 'وزنان' : n <= 10 ? `${n} أوزان` : `${n} وزناً`);

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
      <Hint className="flex items-start gap-2.5">
        <PictureIcon className="mt-0.5 size-4 shrink-0" />
        <span>
          الصورة الأولى غلاف بطاقة الخط في المكتبة، والبقيّة تظهر في معرض صفحته. رتّبها بالسهمين؛ الصور الواضحة لحروف
          الخط وأوزانه تبيع أكثر من الصور الزخرفية.
        </span>
      </Hint>
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
          placeholder="مثال: عبدالملك جاسم، مي علي"
          onChange={(e) => set({ designers: e.target.value })}
          aria-invalid={!!errors.designers}
        />
        <FieldError>{errors.designers}</FieldError>
        <Hint className="mt-1">افصل بين الأسماء بفاصلة. تظهر بالترتيب الذي تكتبه تحت اسم الخط في البطاقة والصفحة.</Hint>
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
        <Hint>الخط الخارجي لا يُباع في حرف — نعرضه ونرسل المشتري إلى المصدر.</Hint>
      </div>
    );

  const single = Math.round((draft.familyPrice * draft.singlePct) / 100);
  return (
    <div className="grid gap-6">
      <RadioGroupPrimitive.Root
        aria-label="الإتاحة"
        value={draft.availability}
        onValueChange={(v) => set({ availability: v as Draft['availability'] })}
        className="grid gap-3 sm:grid-cols-2"
      >
        {(
          [
            ['free', 'مجاني', 'يحمّله الجميع بلا مقابل ضمن حدود خطّتهم.', <GiftIcon key="i" />],
            ['paid', 'مدفوع', 'يُباع بتراخيص، وتصلك أرباحه في لوحة المسبك.', <DollarIcon key="i" />],
          ] as const
        ).map(([value, label, desc, icon]) => (
          <RadioGroupPrimitive.Item
            key={value}
            value={value}
            className="group/opt flex items-start gap-3 rounded-lg border bg-card p-4 text-start transition-[border-color,box-shadow] duration-(--dur-base) hover:border-strong data-[state=checked]:border-primary data-[state=checked]:shadow-[0_0_0_1px_var(--color-primary)]"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sunken text-muted-foreground transition-colors group-data-[state=checked]/opt:bg-tint-brand group-data-[state=checked]/opt:text-primary [&_svg]:size-4.5">
              {icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-control font-semibold">{label}</span>
              <span className="mt-0.5 block text-caption leading-relaxed text-muted-foreground">{desc}</span>
            </span>
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-[1.5px] border-strong transition-colors group-data-[state=checked]/opt:border-primary group-data-[state=checked]/opt:bg-primary">
              <CheckIcon className="size-3 text-primary-foreground opacity-0 transition-opacity group-data-[state=checked]/opt:opacity-100" />
            </span>
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroupPrimitive.Root>

      {draft.availability === 'paid' && (
        <div className="grid animate-fade-up gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="p-fam">سعر العائلة كاملة</FieldLabel>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-4 grid place-items-center text-muted-foreground">
                  $
                </span>
                <Input
                  id="p-fam"
                  type="number"
                  dir="ltr"
                  min={0}
                  max={10000}
                  className="pl-8"
                  value={draft.familyPrice}
                  onChange={(e) => set({ familyPrice: Number(e.target.value) || 0 })}
                  aria-invalid={!!errors.familyPrice}
                />
              </div>
              <FieldError>{errors.familyPrice}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="p-single">سعر الوزن الواحد (% من العائلة)</FieldLabel>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-4 grid place-items-center text-muted-foreground">
                  %
                </span>
                <Input
                  id="p-single"
                  type="number"
                  dir="ltr"
                  min={5}
                  max={100}
                  className="pl-8"
                  value={draft.singlePct}
                  onChange={(e) => set({ singlePct: Number(e.target.value) || 0 })}
                />
              </div>
            </Field>
          </div>
          <dl className="grid grid-cols-2 divide-x rounded-lg bg-sunken py-4 text-center">
            <div>
              <dt className="text-caption text-muted-foreground">العائلة كاملة</dt>
              <dd dir="ltr" className="mt-0.5 text-lg font-semibold tabular-nums">
                ${draft.familyPrice}
              </dd>
            </div>
            <div>
              <dt className="text-caption text-muted-foreground">الوزن الواحد</dt>
              <dd dir="ltr" className="mt-0.5 text-lg font-semibold tabular-nums">
                ${single}
              </dd>
            </div>
          </dl>
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border bg-card p-4">
            <span>
              <span className="block text-control font-medium">نسخة تجريبية مجانية</span>
              <span className="mt-0.5 block text-caption text-muted-foreground">
                وزن واحد للمعاينة الشخصية — يزيد احتمال الشراء.
              </span>
            </span>
            <Switch checked={draft.trial} onCheckedChange={(v) => set({ trial: v })} />
          </label>
          <Hint>
            هذا سعر الترخيص الأساسي. نطاقات الاستخدام (سطح المكتب، الموقع، التطبيق) وعمولة المنصّة تحدّدها سياسة حرف —
            القيم الحالية تجريبية.
          </Hint>
        </div>
      )}
    </div>
  );
}

export function ConsentField({ draft, set, errors }: StepProps) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-4 text-control leading-relaxed">
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
