import { Input } from '@/components/ui/input';

import { useLab } from '../../hooks/lab-context';
import { Panel } from '../bits';

const SIZES = [12, 14, 16, 20, 24, 32, 40, 48, 64, 80, 100, 128];

export function Waterfall() {
  const { active, settings, set, specimen } = useLab();
  if (!active) return null;
  return (
    <div className="flex flex-col gap-5">
      <Input
        aria-label="نص التدرّج"
        value={settings.text}
        onChange={(e) => set({ text: e.target.value.slice(0, 200) })}
        className="h-11 rounded-full px-5"
      />
      <Panel label="تدرّج الأحجام" className="divide-y overflow-hidden">
        {SIZES.map((size) => (
          <div key={size} className="flex items-baseline gap-5 px-5 py-3">
            <span dir="ltr" className="w-10 shrink-0 text-caption text-tertiary tabular-nums">
              {size}
            </span>
            <p className="min-w-0 flex-1 truncate leading-snug" style={specimen(active, { fontSize: size })}>
              {settings.text}
            </p>
          </div>
        ))}
      </Panel>
    </div>
  );
}
