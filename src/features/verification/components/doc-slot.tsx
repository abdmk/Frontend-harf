import { useId, useRef, useState } from 'react';

import { CloudUploadIcon, PencilIcon, PictureIcon, TrashIcon } from '@/components/ui/icons';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/cn';
import { prepareImage } from '@/lib/image-upload';
import { storeDoc, useDocUrl } from '@/lib/media-store';

/** رسم البطاقة الفارغ: وجه بصورة وأسطر، أو ظهر بأسطر فقط */
function CardGlyph({ side }: { side: 'front' | 'back' | 'doc' }) {
  return (
    <span aria-hidden className="flex h-7 w-11 items-center gap-1 rounded-[3px] border border-strong bg-card p-1">
      {side === 'front' && <span className="h-full w-3 rounded-[2px] bg-strong" />}
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="h-0.5 w-full rounded-full bg-strong" />
        <span className="h-0.5 w-3/4 rounded-full bg-strong" />
        <span className="h-0.5 w-1/2 rounded-full bg-strong" />
      </span>
    </span>
  );
}

function SlotAction({
  onClick,
  Icon,
  children,
  ...rest
}: {
  onClick: () => void;
  Icon: (p: { className?: string }) => React.JSX.Element;
  children: React.ReactNode;
  'aria-label': string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rest['aria-label']}
      className="flex flex-col items-center gap-1.5 rounded-md px-2 py-1.5 text-caption text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon className="size-5" />
      {children}
    </button>
  );
}

/**
 * خانة وثيقة: فارغة بإطار متقطّع وعند المرور/التركيز «رفع» و«تصوير» (الكاميرا الخلفية على الجوال)؛
 * بعد الرفع تظهر الصورة مع «استبدال» و«حذف». الصورة تُفحص بايتاتها، يُرفض SVG، وتُعاد ترميزها
 * JPEG فتُزال بياناتها الوصفية (EXIF، موقع GPS) قبل أي حفظ.
 */
export function DocSlot({
  label,
  side,
  value,
  onChange,
  invalid,
}: {
  label: string;
  side: 'front' | 'back' | 'doc';
  value: string | undefined;
  onChange: (id: string | undefined) => void;
  invalid?: boolean;
}) {
  const upload = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const url = useDocUrl(value);
  const id = useId();

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError(undefined);
    const img = await prepareImage(file, { maxBytes: 10 * 1024 * 1024, maxSide: 2000, minSide: 600, quality: 0.86 });
    if (!img.ok) {
      setBusy(false);
      return setError(img.error);
    }
    const stored = await storeDoc(img.url);
    setBusy(false);
    if (!stored.ok) return setError(stored.error);
    onChange(stored.id);
  }

  const inputs = (
    <>
      <input
        ref={upload}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={onFile}
      />
      <input
        ref={camera}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={onFile}
      />
    </>
  );

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {inputs}
      {value ? (
        <figure className="group relative">
          <div className="aspect-[1.586] overflow-hidden rounded-xl border bg-sunken shadow-soft transition-transform duration-(--dur-slow) ease-pop group-focus-within:-rotate-2 group-hover:scale-[1.02] group-hover:-rotate-2">
            {url ? (
              <img src={url} alt={`${label} — مرفوعة`} className="size-full object-cover" />
            ) : (
              // سجلّ تجريبي بلا ملف في هذا المتصفّح
              <span className="grid size-full place-items-center text-tertiary">
                <PictureIcon className="size-6" />
              </span>
            )}
          </div>
          <figcaption className="mt-1.5 flex items-center justify-between gap-2">
            <span className="truncate text-caption text-muted-foreground">{label}</span>
            <span className="flex gap-1.5">
              <button
                type="button"
                aria-label={`استبدال ${label}`}
                onClick={() => upload.current?.click()}
                className="grid size-7 place-items-center rounded-full bg-sunken text-foreground transition-colors outline-none hover:bg-inset focus-visible:ring-2 focus-visible:ring-ring"
              >
                <PencilIcon className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label={`حذف ${label}`}
                onClick={() => onChange(undefined)}
                className="grid size-7 place-items-center rounded-full bg-dgr-600 text-white transition-opacity outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <TrashIcon className="size-3.5" />
              </button>
            </span>
          </figcaption>
        </figure>
      ) : (
        <div
          role="group"
          aria-labelledby={`${id}-l`}
          className={cn(
            'group relative grid aspect-[1.586] place-items-center rounded-xl border-2 border-dashed bg-card transition-colors focus-within:border-strong hover:border-strong',
            invalid && 'border-dgr-300 bg-tint-dgr/40',
          )}
        >
          {busy ? (
            <Spinner />
          ) : (
            <>
              {/* الحالة الهادئة: رسم البطاقة واسمها — تتبدّل بالإجراءات عند المرور أو التركيز */}
              <span className="flex flex-col items-center gap-2 transition-opacity group-focus-within:opacity-0 group-hover:opacity-0 [@media(hover:none)]:opacity-0">
                <CardGlyph side={side} />
                <span id={`${id}-l`} className="text-caption text-muted-foreground">
                  {label}
                </span>
              </span>
              <span className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
                <SlotAction onClick={() => upload.current?.click()} Icon={CloudUploadIcon} aria-label={`رفع ${label}`}>
                  رفع
                </SlotAction>
                <SlotAction onClick={() => camera.current?.click()} Icon={PictureIcon} aria-label={`تصوير ${label}`}>
                  تصوير
                </SlotAction>
              </span>
            </>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="text-caption text-dgr-text">
          {error}
        </p>
      )}
    </div>
  );
}
