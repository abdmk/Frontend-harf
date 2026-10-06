import { PriceDisplay } from '@/components/shared/price-display';
import { cn } from '@/lib/utils';
import type { CartItem } from '@/types/domain/commerce';

/** بلاطة الخط الصغيرة: أوّل حرفين على أرضية داكنة (بديل صورة المعاينة) */
export function FontTile({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      dir="ltr"
      className={cn(
        'grid shrink-0 place-items-center rounded-sm bg-ink font-semibold text-ink-foreground',
        className ?? 'size-11 text-control',
      )}
    >
      {name.slice(0, 2)}
    </span>
  );
}

/** سطر عنصر في السلة المصغّرة */
export function CartLine({ item, action }: { item: CartItem; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <FontTile name={item.fontName} />
      <div className="min-w-0 flex-1">
        <p dir="ltr" className="truncate text-right text-control font-medium">
          {item.fontName}
        </p>
        <p className="truncate text-caption text-muted-foreground">{item.summary.join(' · ')}</p>
      </div>
      <PriceDisplay price={item.price} size="sm" />
      {action}
    </div>
  );
}
