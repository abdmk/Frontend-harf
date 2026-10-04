import { type ReactNode, useTransition } from 'react';

import { PriceDisplay } from '@/components/shared/price-display';
import { Button } from '@/components/ui/button';
import { TrashIcon } from '@/components/ui/icons';
import { toast } from '@/components/ui/toast';
import type { CartItem } from '@/types/domain/commerce';

import { FontTile } from './cart-line';
import type { CartActionResult } from '../api/actions';

/**
 * عناصر صفحة السلة — بطاقة مختصرة لكل خط، تتراصّ تحت بعضها مهما زاد العدد:
 * الاسم والسعر أولاً، ثم نوع الترخيص وتفاصيله بسطرين هادئين، ثم «تعديل الترخيص» و«حذف» كأفعال ثانوية
 * لا تنافس المنتج. الحذف يُتراجع عنه من الإشعار.
 */
export function CartItems({
  items,
  onRemove,
  onRestore,
  edits,
}: {
  items: CartItem[];
  onRemove: (id: string) => CartActionResult | Promise<CartActionResult>;
  /** يعيد العنصر المحذوف (زرّ «تراجع») */
  onRestore?: (item: CartItem) => void;
  /** زرّ «تعديل الترخيص» لكل عنصر (بمعرّفه) — يركّبه التطبيق من لوحة الترخيص */
  edits: Record<string, ReactNode>;
}) {
  const [pending, start] = useTransition();
  const remove = (item: CartItem) =>
    start(async () => {
      const r = await onRemove(item.id);
      if (!r.ok) return;
      toast({
        title: `حُذف ${item.fontName} من السلة`,
        action: onRestore && { label: 'تراجع', onClick: () => onRestore(item) },
      });
    });

  return (
    <ul aria-label="خطوط السلة" aria-busy={pending} className="flex flex-col gap-3 aria-busy:opacity-70">
      {items.map((item) => {
        const [license, ...uses] = item.summary;
        return (
          <li key={item.id} className="flex animate-fade-up gap-4 rounded-lg border bg-card p-4 sm:p-5">
            <FontTile name={item.fontName} className="size-14 bg-sunken text-base text-foreground max-sm:size-12" />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 dir="ltr" className="truncate text-right text-base font-semibold">
                    {item.fontName}
                  </h3>
                  <p className="truncate text-caption text-muted-foreground">{item.foundry}</p>
                </div>
                <PriceDisplay price={item.price} size="md" className="shrink-0" />
              </div>

              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                <div className="flex min-w-0 flex-col gap-0.5 text-meta">
                  <p className="font-medium">{license}</p>
                  {uses.length > 0 && <p className="text-muted-foreground">{uses.join('، ')}</p>}
                </div>
                {/* أفعال ثانوية بنصّ هادئ لا أحمر — الحذف يحمرّ عند المرور فقط */}
                <div className="-ms-2 flex shrink-0 items-center sm:ms-0 sm:-me-2">
                  {edits[item.id]}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(item)}
                    className="text-muted-foreground hover:bg-tint-dgr hover:text-dgr-text"
                  >
                    <TrashIcon />
                    حذف<span className="sr-only"> {item.fontName}</span>
                  </Button>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
