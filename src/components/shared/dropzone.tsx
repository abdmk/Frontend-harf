import { type ReactNode, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { CloudUploadIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

/**
 * منطقة الإفلات (مرجع «Group 953»): إطار متقطّع، سحابة، عنوان، سطر الصيغ، وزرّ «استعراض».
 * مشتركة بين نافذة الرفع و«عين» و«مختبر الخط». التحقّق من الملفات مسؤولية المستدعي.
 */
export function Dropzone({
  onFiles,
  accept,
  multiple = false,
  title = 'اختر ملفاً أو اسحبه وأفلته هنا.',
  hint,
  browseLabel = 'استعراض الملفات',
  actions,
  className,
}: {
  onFiles: (files: FileList) => void;
  accept: string;
  multiple?: boolean;
  title?: string;
  hint: ReactNode;
  browseLabel?: string;
  /** أزرار إضافية بجانب «استعراض» (مثل «اختر مجلّداً») */
  actions?: ReactNode;
  className?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
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
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
      }}
      className={cn(
        'flex flex-col items-center gap-2 rounded-md border-[1.5px] border-dashed border-strong px-6 py-12 text-center transition-[border-color,background-color,transform] duration-(--dur-base)',
        over && 'scale-[1.01] border-primary bg-tint-brand',
        className,
      )}
    >
      <CloudUploadIcon
        className={cn(
          'mb-3 size-7 transition-transform duration-(--dur-slow) ease-pop',
          over && '-translate-y-1 scale-110 text-primary',
        )}
      />
      <p className="text-base font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground">{hint}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button variant="outline" size="md" className="text-muted-foreground" onClick={() => input.current?.click()}>
          {browseLabel}
        </Button>
        {actions}
      </div>
      <input
        ref={input}
        type="file"
        multiple={multiple}
        hidden
        accept={accept}
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
