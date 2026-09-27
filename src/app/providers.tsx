'use client';

import { setNonce } from 'get-nonce';
import { Direction } from 'radix-ui';
import type { ReactNode } from 'react';

import { Toaster } from '@/components/ui/toast';
import { TooltipProvider } from '@/components/ui/tooltip';

/** مزوّدات الواجهة: اتجاه عربي لكل مكوّنات Radix، وتلميحات مشتركة، ومنطقة الإشعارات العابرة */
export function AppProviders({ nonce, children }: { nonce?: string; children: ReactNode }) {
  // مكتبة قفل التمرير في Radix تُنشئ عنصر <style>؛ نعطيها nonce الطلب لتقبله سياسة CSP
  if (nonce) setNonce(nonce);
  return (
    <Direction.Provider dir="rtl">
      <TooltipProvider delayDuration={300}>
        {children}
        <Toaster />
      </TooltipProvider>
    </Direction.Provider>
  );
}
