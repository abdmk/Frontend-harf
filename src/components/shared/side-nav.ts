import { cn } from '@/lib/cn';

/**
 * صفّ القائمة الجانبية — مشترك بين الحساب والاستوديو حتى تبدوا نظاماً واحداً:
 * الحالي بخلفية العلامة الفاتحة وشريط رأسي على بدايته.
 */
export function sideNavRow(active: boolean, size: 'lg' | 'sm' | 'sub' = 'lg') {
  return cn(
    'group/it relative flex items-center rounded-sm transition-colors duration-(--dur-fast)',
    size === 'lg' && 'h-11 gap-4 px-4 text-lead',
    size === 'sm' && 'h-9 gap-3 px-3 text-control',
    size === 'sub' && 'h-9 gap-3 ps-13 pe-4 text-control',
    active
      ? 'bg-tint-brand text-primary before:absolute before:inset-y-1.5 before:start-0 before:w-0.75 before:animate-in before:rounded-full before:bg-primary-fill before:zoom-in-50'
      : 'text-foreground hover:bg-sunken',
  );
}

export function sideNavIcon(active: boolean, size: 'lg' | 'sm' = 'lg') {
  return cn(
    'shrink-0 transition-transform duration-(--dur-base) ease-pop group-hover/it:scale-110',
    size === 'lg' ? 'size-5' : 'size-4.5',
    active ? 'text-primary' : 'text-foreground/80',
  );
}
