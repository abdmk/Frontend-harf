'use client';

import { type ReactNode, useTransition } from 'react';

import { PriceDisplay } from '@/components/shared/price-display';
import { Badge } from '@/components/ui/badge';
import type { CartItem } from '@/types/domain/commerce';

import { FontTile } from './cart-line';
import type { CartActionResult } from '../api/actions';

/** عناصر صفحة السلة: كل عنصر ترخيص كامل؛ «تعديل الترخيص» يفتح اللوحة نفسها بحالتها */
export function CartItems({
  items,
  onRemove,
  edits,
}: {
  items: CartItem[];
  onRemove: (id: string) => Promise<CartActionResult>;
  /** زرّ «تعديل الترخيص» لكل عنصر (بمعرّفه) — يركّبه التطبيق من لوحة الترخيص */
  edits: Record<string, ReactNode>;
}) {
  const [pending, start] = useTransition();
  return (
    <ul aria-busy={pending} className="flex flex-col gap-4 aria-busy:opacity-70">
      {items.map((item) => (
        <li key={item.id} className="flex animate-fade-up gap-4 rounded-lg border bg-card p-5">
          <FontTile name={item.fontName} className="size-18 text-lg" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p dir="ltr" className="truncate text-right text-base font-semibold">
                  {item.fontName}
                </p>
                <p className="text-caption text-muted-foreground">{item.foundry}</p>
              </div>
              <PriceDisplay price={item.price} size="sm" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {item.summary.map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
            <div className="mt-1 flex gap-4 text-meta">
              {edits[item.id]}
              <button
                type="button"
                onClick={() => start(async () => void (await onRemove(item.id)))}
                className="font-medium text-dgr-text hover:underline"
              >
                حذف<span className="sr-only"> {item.fontName}</span>
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
