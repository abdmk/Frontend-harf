import type { ComponentProps } from 'react';

import { SheetContent } from '@/components/ui/sheet';
import { below } from '@/design-system/tokens';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

/**
 * هيكل اللوحات (الترخيص، التصفية، خيارات «نسق»): نافذة وسطى بعرض واحد وارتفاع محدود على الكمبيوتر،
 * ولوحة من الأسفل بمقبض على الجوال. المحتوى: رأس ثابت، جسم يتمرّر، وتذييل ثابت.
 */
export function PanelSheetContent({ className, children, ...props }: ComponentProps<typeof SheetContent>) {
  const mobile = useMediaQuery(below('sm'));
  return (
    <SheetContent
      side={mobile ? 'bottom' : 'center'}
      showCloseButton={false}
      className={cn(
        'gap-0 border bg-sheet p-0 shadow-overlay',
        mobile
          ? 'max-h-[88dvh] rounded-t-xl'
          : 'max-h-[min(680px,calc(100dvh-4rem))] w-[min(var(--container-dialog-md),calc(100vw-2rem))]',
        className,
      )}
      {...props}
    >
      {mobile && <span aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-strong" />}
      {children}
    </SheetContent>
  );
}
