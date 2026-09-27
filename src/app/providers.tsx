import { Direction } from 'radix-ui';
import type { ReactNode } from 'react';

import { Toaster } from '@/components/ui/toast';
import { TooltipProvider } from '@/components/ui/tooltip';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Direction.Provider dir="rtl">
      <TooltipProvider delayDuration={300}>
        {children}
        <Toaster />
      </TooltipProvider>
    </Direction.Provider>
  );
}
