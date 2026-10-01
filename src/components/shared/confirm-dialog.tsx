import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { ExclamationIcon } from '@/components/ui/icons';

/**
 * نافذة تأكيد للإجراءات الثقيلة (حذف، حظر): أيقونة تحذير في دائرة، عنوان ووصف في الوسط،
 * زرّ الإجراء بعرض كامل ثم «إلغاء» تحته. children لحقل إضافي (سبب، كتابة الاسم للتأكيد).
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  disabled,
  icon,
  children,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-dialog-sm">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!disabled) onConfirm();
          }}
          className="flex flex-col items-center gap-5 text-center"
        >
          <span className="grid size-14 animate-pop-in place-items-center rounded-full bg-tint-dgr text-dgr-text [&_svg]:size-6">
            {icon ?? <ExclamationIcon />}
          </span>
          <div className="flex flex-col gap-2">
            <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
            <DialogDescription className="text-control leading-relaxed text-muted-foreground">
              {description}
            </DialogDescription>
          </div>
          {children && <div className="w-full text-start">{children}</div>}
          <div className="flex w-full flex-col gap-2.5">
            <Button
              type="submit"
              size="lg"
              disabled={disabled}
              className="w-full bg-dgr-600 text-white hover:bg-dgr-700"
            >
              {confirmLabel}
            </Button>
            <Button type="button" size="lg" variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
