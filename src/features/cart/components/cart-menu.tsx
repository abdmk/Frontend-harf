import { useState, useTransition } from 'react';
import { Link } from 'react-router';

import { PriceDisplay } from '@/components/shared/price-display';
import { Button } from '@/components/ui/button';
import { CartIcon, CrossSmallIcon } from '@/components/ui/icons';
import { focusPanel, Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { paths } from '@/config/paths';
import type { Cart } from '@/types/domain/commerce';

import { CartLine } from './cart-line';
import type { CartActionResult } from '../api/actions';

/** السلة المصغّرة (دليل التصميم 5.6): تُفتح من أيقونة الترويسة، والعدّاد من الخادم */
export function CartMenu({
  cart,
  onRemove,
}: {
  cart: Cart;
  onRemove: (id: string) => CartActionResult | Promise<CartActionResult>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const count = cart.items.length;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={count ? (count === 1 ? 'السلة، عنصر واحد' : `السلة، ${count} عناصر`) : 'السلة'}
        className="relative grid size-9 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground data-[state=open]:bg-sunken data-[state=open]:text-foreground"
      >
        <CartIcon filled={open} className="size-4.5" />
        {count > 0 && (
          <span
            aria-hidden
            dir="ltr"
            className="absolute end-1 top-1 grid h-4 min-w-4 animate-pop-in place-items-center rounded-full bg-primary-fill px-1 text-2xs font-medium text-primary-foreground"
          >
            {count}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        tabIndex={-1}
        onOpenAutoFocus={focusPanel}
        sideOffset={10}
        className="w-[min(var(--container-menu),calc(100vw-24px))] rounded-xl p-0 shadow-overlay"
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <p className="text-sm font-semibold">السلة</p>
          {count > 0 && <span className="text-caption text-tertiary">{count === 1 ? 'خط واحد' : `${count} خطوط`}</span>}
        </div>
        {count === 0 ? (
          <div className="px-6 pt-4 pb-8 text-center">
            <p className="text-sm text-muted-foreground">سلتك فارغة.</p>
            <p className="mt-1 text-caption text-tertiary">اختر ترخيصاً من صفحة أي خط مدفوع.</p>
          </div>
        ) : (
          <>
            <div aria-busy={pending} className="max-h-72 overflow-y-auto px-2 aria-busy:opacity-60">
              {cart.items.map((item) => (
                <CartLine
                  key={item.id}
                  item={item}
                  action={
                    <button
                      type="button"
                      aria-label={`احذف ${item.fontName} من السلة`}
                      onClick={() => start(async () => void (await onRemove(item.id)))}
                      className="grid size-7 place-items-center rounded-xs text-tertiary transition-colors hover:bg-sunken hover:text-foreground"
                    >
                      <CrossSmallIcon className="size-4" />
                    </button>
                  }
                />
              ))}
            </div>
            <div className="mt-1 border-t px-5 pt-3 pb-4">
              <div className="mb-3 flex items-center justify-between text-control text-muted-foreground">
                المجموع
                <PriceDisplay price={cart.total} size="sm" className="text-foreground" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button asChild onClick={() => setOpen(false)}>
                  <Link to={paths.checkout.getHref()}>إتمام الشراء</Link>
                </Button>
                <Button asChild variant="secondary" onClick={() => setOpen(false)}>
                  <Link to={paths.cart.getHref()}>عرض السلة</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
