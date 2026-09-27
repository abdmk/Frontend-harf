import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { BellIcon, HeartFilledIcon, RefreshIcon } from '@/components/ui/icons';

import { DsPanel } from './ds-section';

const DEMOS = [
  ['fade-up', 'animate-fade-up', 'دخول البطاقات والنوافذ · 320ms · out-quint'],
  ['pop-in', 'animate-pop-in', 'ظهور الشارات والعدّادات · 320ms · pop'],
  ['heart', 'animate-heart', 'تفعيل المفضّلة · 560ms · pop'],
  ['ring', 'animate-ring', 'جرس إشعار جديد · 800ms'],
] as const;

export function MotionDemo() {
  const [run, setRun] = useState(0);
  return (
    <DsPanel>
      <Button variant="outline" size="sm" onClick={() => setRun((r) => r + 1)} className="mb-6">
        <RefreshIcon />
        أعد تشغيل الحركة
      </Button>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {DEMOS.map(([name, cls, use]) => (
          <div key={name} className="flex flex-col items-center gap-3 rounded-md bg-sunken p-5 text-center">
            <span
              key={`${name}-${run}`}
              className={`${cls} grid size-12 place-items-center rounded-sm bg-card text-primary shadow-soft`}
            >
              {name === 'ring' ? <BellIcon className="size-5" /> : <HeartFilledIcon className="size-5" />}
            </span>
            <span dir="ltr" className="font-mono text-caption">
              {name}
            </span>
            <span className="text-caption text-tertiary">{use}</span>
          </div>
        ))}
      </div>
    </DsPanel>
  );
}
