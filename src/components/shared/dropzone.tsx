import { type ReactNode, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { CloudUploadIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

/**
 * منطقة الإفلات. مشتركة بين نافذة الرفع و«عين» و«مختبر الخط». التحقّق من الملفات مسؤولية المستدعي.
 * - العادية (مرجع «Group 953»): إطار متقطّع، سحابة، عنوان، سطر الصيغ، وزرّ «استعراض».
 * - feature: بطاقة بداية الأداة — سطح هادئ بحدّ متّصل يصير متقطّعاً بلون العلامة عند السحب فوقه،
 *   دائرة أيقونة فاتحة، زرّ أساسي، وشرائح الصيغ المقبولة.
 */
export function Dropzone({
  onFiles,
  accept,
  multiple = false,
  title = 'اختر ملفاً أو اسحبه وأفلته هنا.',
  hint,
  browseLabel = 'استعراض الملفات',
  actions,
  feature = false,
  formats,
  className,
}: {
  /** نسخة ثابتة من الملفات — لا FileList الحيّة التي تُفرَّغ مع تفريغ الحقل */
  onFiles: (files: File[]) => void;
  accept: string;
  multiple?: boolean;
  title?: string;
  hint: ReactNode;
  browseLabel?: string;
  /** أزرار إضافية بجانب «استعراض» (مثل «اختر مجلّداً») */
  actions?: ReactNode;
  /** بداية أداة (عين، مختبر الخط) — الرفع هو الفعل الأول في الصفحة */
  feature?: boolean;
  /** الصيغ المقبولة كشرائح تحت الأزرار (feature فقط) */
  formats?: readonly string[];
  className?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const browse = () => input.current?.click();

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={(e) => {
        // مغادرة إلى عنصر داخلي ليست مغادرة للمنطقة
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (e.dataTransfer.files.length) onFiles(Array.from(e.dataTransfer.files));
      }}
      className={cn(
        'flex flex-col items-center text-center transition-[border-color,background-color,transform] duration-(--dur-base)',
        feature
          ? 'gap-1.5 rounded-2xl border-[1.5px] bg-sunken/50 px-6 py-14 sm:py-20'
          : 'gap-2 rounded-md border-[1.5px] border-dashed border-strong px-6 py-12',
        over && 'scale-[1.01] border-dashed border-primary bg-tint-brand',
        className,
      )}
    >
      {feature ? (
        <span
          aria-hidden
          className={cn(
            'mb-4 grid size-16 place-items-center rounded-full bg-tint-brand text-primary transition-transform duration-(--dur-slow) ease-pop',
            over && '-translate-y-1 scale-110 bg-card',
          )}
        >
          <CloudUploadIcon className="size-7" />
        </span>
      ) : (
        <CloudUploadIcon
          className={cn(
            'mb-3 size-7 transition-transform duration-(--dur-slow) ease-pop',
            over && '-translate-y-1 scale-110 text-primary',
          )}
        />
      )}
      <p className={cn('font-semibold', feature ? 'text-xl sm:text-2xl' : 'text-base')}>{title}</p>
      <p className={cn('text-muted-foreground', feature ? 'text-lead' : 'text-sm')}>{hint}</p>
      <div className={cn('flex flex-wrap justify-center gap-2', feature ? 'mt-6 gap-3' : 'mt-5')}>
        {feature ? (
          <Button size="lg" shape="pill" onClick={browse}>
            <CloudUploadIcon />
            {browseLabel}
          </Button>
        ) : (
          <Button variant="outline" size="default" className="text-muted-foreground" onClick={browse}>
            {browseLabel}
          </Button>
        )}
        {actions}
      </div>
      {feature && formats && formats.length > 0 && (
        <ul aria-label="الصيغ المقبولة" className="mt-5 flex flex-wrap justify-center gap-2">
          {formats.map((f) => (
            <li
              key={f}
              dir="ltr"
              className="rounded-full bg-card px-3 py-1 text-caption font-medium text-muted-foreground ring-1 ring-border"
            >
              {f}
            </li>
          ))}
        </ul>
      )}
      <input
        ref={input}
        type="file"
        multiple={multiple}
        hidden
        accept={accept}
        onChange={(e) => {
          if (e.target.files?.length) onFiles(Array.from(e.target.files));
          e.target.value = '';
        }}
      />
    </div>
  );
}
