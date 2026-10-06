import { cn } from '@/lib/utils';

/** مؤشّر تحميل دائري بلون النص الحالي — يُخفى عن قارئ الشاشة؛ أعلن الحالة في العنصر الأب (aria-busy) */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      data-slot="spinner"
      className={cn(
        'inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-e-transparent',
        className,
      )}
    />
  );
}
