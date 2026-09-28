import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { CheckIcon, PlusIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

/** متابعة مصمّم/مسبك — حالة محلية للعرض؛ تُحفظ على الخادم مع الحساب لاحقاً */
export function FollowButton({
  name,
  initial = false,
  className,
}: {
  name: string;
  initial?: boolean;
  className?: string;
}) {
  const [on, setOn] = useState(initial);
  return (
    <Button
      size="sm"
      variant={on ? 'primary' : 'outline'}
      aria-pressed={on}
      aria-label={`${on ? 'إلغاء متابعة' : 'متابعة'} ${name}`}
      onClick={() => setOn((v) => !v)}
      className={cn('min-w-24', className)}
    >
      {on ? <CheckIcon className="animate-pop-in" /> : <PlusIcon />}
      {on ? 'تتابعه' : 'متابعة'}
    </Button>
  );
}
