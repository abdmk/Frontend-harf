'use client';

import { CartIcon } from '@/components/ui/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/** السلة المصغّرة — فارغة حتى يُربط الشراء (تصميم السلة الكامل في الدليل) */
export function CartMenu() {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="السلة"
        className="grid size-9 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground data-[state=open]:bg-sunken data-[state=open]:text-foreground"
      >
        <CartIcon className="size-4.5" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[min(340px,calc(100vw-24px))] rounded-lg p-2 shadow-float"
      >
        <p className="px-3 py-2 text-sm font-semibold">السلة</p>
        <p className="p-6 text-center text-sm text-tertiary">
          سلتك فارغة.
          <br />
          أضف خطاً من صفحته.
        </p>
      </PopoverContent>
    </Popover>
  );
}
