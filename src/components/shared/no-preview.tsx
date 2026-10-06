import { TextIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

/**
 * خط بلا ملفات معاينة بعد: إشارة صريحة بدل مربّع فارغ يبدو عطلاً — ولا نعرضه بخط الموقع
 * كأنه هو، فذلك يضلّل من يختار خطاً بشكله.
 */
export function NoPreview({ size = 'sm', className }: { size?: 'sm' | 'lg'; className?: string }) {
  return (
    <span className={cn('flex flex-col items-center gap-2 text-center text-tertiary', className)}>
      <TextIcon className={size === 'lg' ? 'size-8' : 'size-6'} />
      <span className={size === 'lg' ? 'text-base font-medium text-muted-foreground' : 'text-caption'}>
        المعاينة غير متاحة بعد
      </span>
      {size === 'lg' && (
        <span className="max-w-[36ch] text-meta">تظهر عيّنات الخط هنا وتجربته بنصّك حين تُرفع ملفاته.</span>
      )}
    </span>
  );
}
