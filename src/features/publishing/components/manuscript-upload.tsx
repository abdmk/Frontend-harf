import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router';

import { Dropzone } from '@/components/shared/dropzone';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldHint, FieldLabel } from '@/components/ui/field';
import { CheckIcon, RefreshIcon } from '@/components/ui/icons';
import { Input, Textarea } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/cn';
import { checkSvgFile } from '@/lib/svg-check';
import { MANUSCRIPT_CATEGORIES, MANUSCRIPT_CATEGORY_LABEL, type ManuscriptCategory } from '@/types/domain/manuscript';

import { TagPicker } from './tag-picker';
import { libraryFontById, searchLibraryFonts, submitManuscript } from '../api/manuscripts';

type Picked = { file: File; text: string; url: string; width: number; height: number };
type Errors = Record<string, string>;

const kb = (n: number) => `${(n / 1024).toLocaleString('en-US', { maximumFractionDigits: 0 })} KB`;

/**
 * رفع مخطوطة — المعاينة أولاً (كما ستظهر في المكتبة)، والبيانات بجانبها:
 * العنوان، التصنيف، الخطوط التي كُتبت بها، الترخيص، وتأكيد الحقوق. الملف يُفحص قبل قبوله (SVG آمن فقط).
 */
export function ManuscriptUpload() {
  const ids = useId();
  const [picked, setPicked] = useState<Picked | null>(null);
  const [fileError, setFileError] = useState('');
  const [bg, setBg] = useState<'paper' | 'grid'>('paper');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ManuscriptCategory | ''>('');
  const [fonts, setFonts] = useState<string[]>([]);
  const [license, setLicense] = useState<'personal' | 'commercial'>('personal');
  const [note, setNote] = useState('');
  const [rights, setRights] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // رابط المعاينة يُحرَّر عند الاستبدال أو المغادرة
  useEffect(
    () => () => {
      if (picked) URL.revokeObjectURL(picked.url);
    },
    [picked],
  );

  async function onFiles(files: File[]) {
    const file = files[0];
    if (!file) return;
    const check = await checkSvgFile(file);
    if (!check.ok || !check.text) {
      setFileError(check.ok ? 'تعذّر قراءة الملف.' : check.error);
      return;
    }
    setFileError('');
    setErrors((e) => ({ ...e, file: '' }));
    setPicked({ file, text: check.text, url: URL.createObjectURL(file), width: check.width, height: check.height });
    // العنوان من اسم الملف حين لم يُكتب بعد
    if (!title)
      setTitle(
        file.name
          .replace(/\.svg$/i, '')
          .replace(/[-_]+/g, ' ')
          .slice(0, 60),
      );
  }

  async function submit() {
    if (sending) return;
    if (!picked) {
      setErrors({ file: 'ارفع ملف المخطوطة أولاً.' });
      return;
    }
    setSending(true);
    const res = await submitManuscript(
      {
        title,
        category: category || undefined,
        fonts,
        license,
        note,
        rights,
        file: { name: picked.file.name, bytes: picked.file.size, width: picked.width, height: picked.height },
      },
      picked.text,
    );
    setSending(false);
    if (res.ok) {
      setDone(res.reference);
      return;
    }
    setErrors(Object.fromEntries(res.errors.map((e) => [e.path, e.message])));
  }

  function reset() {
    setPicked(null);
    setTitle('');
    setCategory('');
    setFonts([]);
    setLicense('personal');
    setNote('');
    setRights(false);
    setErrors({});
    setDone(null);
  }

  if (done)
    return (
      <section className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-12 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-tint-ok text-ok-text">
          <CheckIcon className="size-6" />
        </span>
        <h2 className="text-xl font-semibold">أُرسلت المخطوطة للمراجعة</h2>
        <p className="max-w-[44ch] text-meta text-muted-foreground">
          رقم الطلب <bdi className="font-medium text-foreground">{done}</bdi>. تُراجع خلال يومي عمل، وتظهر في المخطوطات
          حين تُعتمد — وسنخبرك بالنتيجة في الإشعارات.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Button onClick={reset}>ارفع مخطوطة أخرى</Button>
          <Button asChild variant="outline">
            <Link to="/manuscripts">تصفّح المخطوطات</Link>
          </Button>
        </div>
      </section>
    );

  const err = (k: string) => errors[k] || undefined;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
      {/* المعاينة — كما ستظهر في المكتبة */}
      <section aria-label="ملف المخطوطة" className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-24">
        {picked ? (
          <>
            <div
              className={cn(
                'grid min-h-80 place-items-center overflow-hidden rounded-2xl border p-8 sm:p-12',
                bg === 'paper'
                  ? 'bg-card'
                  : '[background-image:repeating-conic-gradient(var(--sunken)_0_25%,var(--card)_0_50%)] bg-[length:20px_20px]',
              )}
            >
              <img
                src={picked.url}
                alt={`معاينة ${title || picked.file.name}`}
                className="max-h-[28rem] w-auto max-w-full object-contain"
                style={{ aspectRatio: `${picked.width} / ${picked.height}` }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="min-w-0 text-caption text-muted-foreground">
                <bdi dir="ltr" className="font-medium text-foreground">
                  {picked.file.name}
                </bdi>
                <span className="mx-1.5 text-tertiary">·</span>
                <span dir="ltr">
                  {kb(picked.file.size)} · {picked.width}×{picked.height}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <SegmentedControl
                  label="خلفية المعاينة"
                  value={bg}
                  onChange={setBg}
                  className="h-9"
                  options={[
                    { value: 'paper', label: 'ورق' },
                    { value: 'grid', label: 'شفاف' },
                  ]}
                />
                <Button variant="ghost" size="sm" onClick={() => setPicked(null)}>
                  <RefreshIcon />
                  استبدال
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Dropzone
            feature
            onFiles={(f) => void onFiles(f)}
            accept=".svg,image/svg+xml"
            title="أفلت ملف المخطوطة هنا"
            hint="ملف SVG متجه واحد — حتى 5 ميغابايت"
            browseLabel="اختر ملفاً"
            formats={['SVG']}
          />
        )}
        {(fileError || err('file')) && <Alert tone="danger" title={fileError || err('file')!} />}
        <p className="text-caption text-muted-foreground">
          يُفحص الملف قبل قبوله: لا سكربتات ولا روابط أو ملفات خارجية — رسم متجه مستقل فقط.
        </p>
      </section>

      {/* البيانات */}
      <form
        aria-label="بيانات المخطوطة"
        className="flex flex-col gap-5 rounded-2xl border bg-card p-5 sm:p-6"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        noValidate
      >
        <Field>
          <FieldLabel htmlFor={`${ids}-title`}>عنوان العمل</FieldLabel>
          <Input
            id={`${ids}-title`}
            value={title}
            maxLength={60}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={!!err('title')}
            placeholder="مثال: رمضان كريم"
          />
          {err('title') && <FieldError>{err('title')}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor={`${ids}-cat`}>التصنيف</FieldLabel>
          <Select value={category} onValueChange={(v) => setCategory(v as ManuscriptCategory)}>
            <SelectTrigger id={`${ids}-cat`} aria-invalid={!!err('category')} className="w-full">
              <SelectValue placeholder="لأيّ مناسبة؟" />
            </SelectTrigger>
            <SelectContent>
              {MANUSCRIPT_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {MANUSCRIPT_CATEGORY_LABEL[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {err('category') && <FieldError>{err('category')}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor={`${ids}-fonts`}>الخطوط المستخدمة</FieldLabel>
          <TagPicker
            id={`${ids}-fonts`}
            label="الخطوط المستخدمة"
            value={fonts}
            onChange={setFonts}
            search={searchLibraryFonts}
            resolve={libraryFontById}
            placeholder="ابحث في خطوط حرف…"
            max={4}
            invalid={!!err('fonts')}
            describedBy={`${ids}-fonts-hint`}
          />
          <FieldHint id={`${ids}-fonts-hint`}>تظهر في صفحة العمل روابط لهذه الخطوط.</FieldHint>
          {err('fonts') && <FieldError>{err('fonts')}</FieldError>}
        </Field>

        <Field>
          <span className="text-control font-medium">الترخيص</span>
          <SegmentedControl
            label="الترخيص"
            value={license}
            onChange={setLicense}
            className="w-full [&>button]:flex-1 [&>button]:justify-center"
            options={[
              { value: 'personal', label: 'شخصي' },
              { value: 'commercial', label: 'تجاري وشخصي' },
            ]}
          />
          <FieldHint>
            {license === 'personal'
              ? 'للاستعمال الشخصي غير الربحي فقط.'
              : 'يُستعمل في أعمال تجارية أيضاً، مع ذكر اسمك.'}
          </FieldHint>
        </Field>

        <Field>
          <FieldLabel htmlFor={`${ids}-note`}>وصف قصير (اختياري)</FieldLabel>
          <Textarea
            id={`${ids}-note`}
            value={note}
            maxLength={240}
            rows={3}
            onChange={(e) => setNote(e.target.value)}
            placeholder="فكرة العمل أو مناسبته…"
          />
        </Field>

        <label className="flex cursor-pointer items-start gap-2.5 text-meta">
          <Checkbox checked={rights} onCheckedChange={(v) => setRights(v === true)} aria-invalid={!!err('rights')} />
          <span>أنا صاحب هذا العمل أو أملك حقّ نشره، وأوافق على عرضه في مكتبة حرف بالترخيص المختار.</span>
        </label>
        {err('rights') && <FieldError>{err('rights')}</FieldError>}
        {err('auth') && <Alert tone="danger" title={err('auth')!} />}

        <Button type="submit" size="lg" block disabled={sending}>
          {sending ? 'جارٍ الإرسال…' : 'إرسال للمراجعة'}
        </Button>
      </form>
    </div>
  );
}
