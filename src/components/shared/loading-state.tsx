import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

/** هيكل بطاقة خط أثناء التحميل — بنفس أبعاد FontCard كي لا تقفز الصفحة */
export function FontCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="flex flex-col gap-3 p-5">
        <div className="flex justify-between gap-4">
          <Skeleton className="h-5 w-2/5" />
          <Skeleton className="h-4 w-14" />
        </div>
        <Skeleton className="h-4 w-3/5" />
        <div className="mt-2 flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-21 rounded-xs" />
        </div>
      </div>
    </div>
  );
}

export function FontGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul aria-hidden className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <FontCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

/** تحميل عام لقسم: سطور بأطوال متفاوتة + إعلان لقارئ الشاشة */
export function LoadingState({
  label = 'جارٍ التحميل…',
  lines = 3,
  className,
}: {
  label?: string;
  lines?: number;
  className?: string;
}) {
  return (
    <div role="status" aria-live="polite" className={cn('flex flex-col gap-3', className)}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className="h-4" style={{ width: `${90 - i * 18}%` }} />
      ))}
    </div>
  );
}
