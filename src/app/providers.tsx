'use client';

import { setNonce } from 'get-nonce';
import { Direction } from 'radix-ui';
import type { ReactNode } from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';

/** مزوّدات الواجهة: اتجاه عربي لكل مكوّنات Radix، وتلميحات مشتركة */
export function AppProviders({ nonce, children }: { nonce?: string; children: ReactNode }) {
  // مكتبة قفل التمرير في Radix تُنشئ عنصر <style>؛ نعطيها nonce الطلب لتقبله سياسة CSP
  if (nonce) setNonce(nonce);
  return (
    <Direction.Provider dir="rtl">
      <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
    </Direction.Provider>
  );
}
