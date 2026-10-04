import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

import { useLab } from '../../hooks/lab-context';
import { Panel, RangeControl, StatusPill } from '../bits';

const WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900];
const NAMES: Record<number, string> = {
  100: 'Thin',
  200: 'ExtraLight',
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'SemiBold',
  700: 'Bold',
  800: 'ExtraBold',
  900: 'Black',
};

export function Weights() {
  const { active, fonts, settings, set, specimen } = useLab();
  if (!active) return null;
  const axes = active.axes;
  const family = fonts.filter((f) => f.family === active.family && !f.italic);
  const real = new Set(family.map((f) => f.weight));
  // أوزان العائلة الحقيقية بقيمها الفعلية (Graphik: 250 و270 ليست درجات قياسية)، ثم ما يصطنعه المتصفّح:
  // مع العائلة، التسميك فقط فوق أثقل وزن حقيقي (الأخفّ يُعرض بأقرب وزن حقيقي، لا يُصطنع)؛
  // ومع ملف واحد، كل الدرجات الأخرى
  const maxReal = Math.max(...real);
  const styleOf = new Map(family.map((f) => [f.weight, f.style]));
  const rows = [
    ...real,
    ...WEIGHTS.filter((w) =>
      real.size < 2 ? ![...real].some((r) => Math.abs(r - w) < 50) : w > maxReal && w - maxReal >= 50,
    ),
  ].sort((a, b) => a - b);
  const wght = axes.find((a) => a.tag === 'wght');
  const text = settings.text.length > 60 ? settings.text.slice(0, 60) : settings.text;

  return (
    <div className="flex flex-col gap-5">
      {axes.length > 0 && (
        <Panel label="المحاور المتغيّرة" className="flex flex-col gap-5 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-control font-semibold">المحاور</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => set({ axes: Object.fromEntries(axes.map((a) => [a.tag, a.default])) })}
            >
              <RefreshIcon />
              القيم الافتراضية
            </Button>
          </div>
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {axes.map((a) => (
              <RangeControl
                key={a.tag}
                label={`${a.name} · ${a.tag}`}
                unit=""
                value={settings.axes[a.tag] ?? a.default}
                min={a.min}
                max={a.max}
                onChange={(v) => set({ axes: { ...settings.axes, [a.tag]: v } })}
              />
            ))}
          </div>
          <p className="rounded-lg bg-sunken px-6 py-8 text-4xl leading-snug" style={specimen(active)}>
            {text}
          </p>
        </Panel>
      )}

      {active.instances.length > 0 && (
        <Panel label="الأنماط المسمّاة" className="p-5">
          <h3 className="mb-4 text-control font-semibold">الأنماط المسمّاة</h3>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {active.instances.map((ins) => {
              const on = Object.entries(ins.coords).every(([k, v]) => (settings.axes[k] ?? NaN) === v);
              return (
                <li key={ins.name}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => set({ axes: { ...settings.axes, ...ins.coords } })}
                    className="flex w-full flex-col items-start gap-2 rounded-lg border p-4 text-start transition-colors hover:border-strong aria-pressed:border-primary aria-pressed:bg-tint-brand/40"
                  >
                    <span
                      className="text-2xl leading-snug"
                      style={{
                        fontFamily: `'${active.css}'`,
                        fontWeight: ins.coords.wght,
                        fontVariationSettings: Object.entries(ins.coords)
                          .filter(([k]) => k !== 'wght')
                          .map(([k, v]) => `"${k}" ${v}`)
                          .join(', ') || undefined,
                      }}
                    >
                      أبجد هوز
                    </span>
                    <span dir="ltr" className="text-caption text-muted-foreground">
                      {ins.name} ·{' '}
                      {Object.entries(ins.coords)
                        .map(([k, v]) => `${k} ${Math.round(v)}`)
                        .join(' · ')}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      {!wght && (
        <>
          {real.size < 2 && (
            <Alert
              tone="warning"
              title={`هذا الملف ثابت بوزن واحد (${active.weight})`}
              description="الأوزان الأخرى أدناه يصطنعها المتصفّح بتسميك أو تنحيف الرسم. حمّل ملفات العائلة كلها لترى أوزانها المصمّمة."
            />
          )}
          <Panel label="الأوزان" className="divide-y overflow-hidden">
            {rows.map((w) => {
              const isReal = real.has(w);
              return (
                <div key={w} className={cn('flex items-center gap-4 px-5 py-3.5', !isReal && 'opacity-60')}>
                  <span dir="ltr" className="w-24 shrink-0 text-caption text-muted-foreground tabular-nums">
                    {w} · {(isReal && styleOf.get(w)) || NAMES[w]}
                  </span>
                  <p
                    className="min-w-0 flex-1 truncate text-2xl leading-snug"
                    style={{ fontFamily: `'${active.familyCss}', '${active.css}'`, fontWeight: w }}
                  >
                    {text}
                  </p>
                  <StatusPill tone={isReal ? 'ok' : 'muted'}>{isReal ? 'حقيقي' : 'مصطنع'}</StatusPill>
                </div>
              );
            })}
          </Panel>
        </>
      )}
    </div>
  );
}
