import { Direction } from 'radix-ui';
import type { ReactNode } from 'react';

import { CookieConsent } from '@/components/shared/cookie-consent';
import { Toaster } from '@/components/ui/toast';
import { TooltipProvider } from '@/components/ui/tooltip';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <Direction.Provider dir="rtl">
      <TooltipProvider delayDuration={300}>
        {children}
        <Toaster />
        <CookieConsent />
      </TooltipProvider>
    </Direction.Provider>
  );
}
