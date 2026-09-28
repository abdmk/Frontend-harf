import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { PlusIcon } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { cn } from '@/lib/cn';

import { libraryStarters } from '../../api/library';
import { useLab } from '../../hooks/lab-context';
import { Panel, RangeControl } from '../bits';

const MAX = 6;

/** الخطوط المحمّلة جنباً إلى جنب بالنص والحجم نفسيهما — مع إضافة خط من المكتبة للمقارنة */
export function Compare() {
  const { fonts, active, settings, set, specimen, addFromLibrary, busy } = useLab();
  const [picked, setPicked] = useState<string[] | null>(null);
  const [size, setSize] = useState(40);
  const [layout, setLayout] = useState<'rows' | 'grid'>('rows');
  if (!active) return null;
  const chosen = (picked ?? fonts.slice(0, MAX).map((f) => f.id)).filter((id) => fonts.some((f) => f.id === id));
  const toggle = (id: string) =>
    setPicked((p) => {
      const cur = p ?? chosen;
      return cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id].slice(-MAX);
    });
  const loadedFamilies = new Set(fonts.map((f) => f.family));
  const extra = libraryStarters(6).filter((f) => !loadedFamilies.has(f.name));

  return (
    <div className="flex flex-col gap-5">
      <Panel label="اختيار الخطوط" className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap gap-1.5">
          {fonts.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={chosen.includes(f.id)}
              onClick={() => toggle(f.id)}
              className="inline-flex h-9 items-center rounded-full border bg-card px-3.5 text-caption text-muted-foreground transition-colors aria-pressed:border-primary aria-pressed:text-primary"
            >
              <span dir="ltr">{f.fullName}</span>
            </button>
          ))}
        </div>
        {extra.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
            <span className="text-caption text-muted-foreground">أضف من مكتبة حرف:</span>
            {extra.map((f) => (
              <Button
                key={f.id}
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => void addFromLibrary(f.id, f.download!.url, f.name)}
              >
                <PlusIcon />
                <span dir="ltr">{f.name}</span>
              </Button>
            ))}
          </div>
        )}
        <div className="grid items-end gap-4 border-t pt-4 sm:grid-cols-[minmax(0,1fr)_14rem_auto]">
          <Input
            aria-label="نص المقارنة"
            value={settings.text}
            onChange={(e) => set({ text: e.target.value.slice(0, 200) })}
            className="h-11 rounded-full px-5"
          />
          <RangeControl label="الحجم" value={size} min={16} max={96} onChange={setSize} />
          <SegmentedControl
            label="التخطيط"
            value={layout}
            onChange={setLayout}
            options={[
              { value: 'rows', label: 'صفوف' },
              { value: 'grid', label: 'شبكة' },
            ]}
          />
        </div>
      </Panel>

      {chosen.length < 2 && (
        <p className="rounded-lg bg-sunken p-4 text-meta text-muted-foreground">
          اختر خطّين على الأقل — أو أضف خطاً من المكتبة أو من ملفاتك.
        </p>
      )}

      <ul className={cn(layout === 'grid' ? 'grid gap-4 md:grid-cols-2' : 'flex flex-col gap-3')}>
        {chosen.map((id) => {
          const f = fonts.find((x) => x.id === id)!;
          return (
            <li key={id}>
              <Panel label={f.fullName} className="overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b px-5 py-2.5">
                  <span dir="ltr" className="truncate text-control font-semibold">
                    {f.fullName}
                  </span>
                  <span className="shrink-0 text-caption text-muted-foreground">
                    {f.glyphCount.toLocaleString('en-US')} محرفاً · {f.features.length} ميزة
                  </span>
                </div>
                <p className="px-5 py-6 leading-[1.7] break-words" style={specimen(f, { fontSize: size })}>
                  {settings.text}
                </p>
              </Panel>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
