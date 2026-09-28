import { useEffect, useMemo, useState } from 'react';

import { SegmentedControl } from '@/components/ui/segmented-control';
import { Slider } from '@/components/ui/slider';

import type { Match } from '../hooks/use-matcher';
import { maskToUrl, tokenColor } from '../utils/browser';
import { type Mask, resample } from '../utils/image';

type Mode = 'side' | 'overlay' | 'diff';
const MODES = [
  { value: 'side', label: 'جنباً إلى جنب' },
  { value: 'overlay', label: 'تراكب' },
  { value: 'diff', label: 'الفرق' },
] as const;

const H = 160;

/** قناعان بالحجم نفسه — شرط التراكب والفرق */
function align(a: Mask, b: Mask): [Mask, Mask] {
  const w = Math.max(1, Math.round((a.width / a.height) * H));
  return [resample(a, w, H), resample(b, w, H)];
}

function split(a: Mask, b: Mask) {
  const both = new Float32Array(a.data.length);
  const onlyA = new Float32Array(a.data.length);
  const onlyB = new Float32Array(a.data.length);
  for (let i = 0; i < a.data.length; i++) {
    const x = a.data[i]! >= 0.5;
    const y = b.data[i]! >= 0.5;
    both[i] = x && y ? 1 : 0;
    onlyA[i] = x && !y ? 1 : 0;
    onlyB[i] = !x && y ? 1 : 0;
  }
  const m = (data: Float32Array) => ({ width: a.width, height: a.height, data });
  return { both: m(both), onlyA: m(onlyA), onlyB: m(onlyB) };
}

/**
 * مقارنة بصرية لنتيجة واحدة: الكتابة الأصلية مقابل النص نفسه بالخط المقترح — جنباً إلى جنب،
 * أو متراكبين بشفافية قابلة للتعديل، أو خريطة فرق تُظهر أين يختلفان.
 */
export function CompareView({ source, match }: { source: Mask; match: Match }) {
  const [mode, setMode] = useState<Mode>('side');
  const [mix, setMix] = useState(55);
  // الألوان من رموز التصميم — تُقرأ بعد التركيب وتتحدّث مع الوضع الليلي
  const [colors, setColors] = useState({ ink: 'currentColor', brand: 'currentColor', warn: 'currentColor' });
  useEffect(() => {
    const read = () =>
      setColors({ ink: tokenColor('--foreground'), brand: tokenColor('--primary'), warn: tokenColor('--info-strong') });
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    return () => obs.disconnect();
  }, []);

  const images = useMemo(() => {
    const [a, b] = align(source, match.mask);
    const d = split(a, b);
    return {
      width: a.width,
      source: maskToUrl(a, colors.ink),
      candidate: maskToUrl(b, colors.brand),
      both: maskToUrl(d.both, colors.ink),
      onlySource: maskToUrl(d.onlyA, colors.warn),
      onlyCandidate: maskToUrl(d.onlyB, colors.brand),
    };
  }, [source, match.mask, colors]);

  const frame = 'relative w-full overflow-hidden rounded-md bg-sunken p-6';
  const img = 'mx-auto block h-auto max-h-40 w-full object-contain';

  return (
    <section aria-labelledby="cmp-title" className="rounded-xl border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="cmp-title" className="text-lead font-semibold">
            مقارنة مع {match.font.face.nameAr}
          </h2>
          <p className="mt-0.5 text-caption text-muted-foreground">
            صورتك مقابل النص نفسه بالخط المقترح بوزن{' '}
            <span dir="ltr" className="tabular-nums">
              {match.weight}
            </span>
          </p>
        </div>
        <SegmentedControl label="طريقة المقارنة" value={mode} onChange={setMode} options={MODES} />
      </div>

      <div className="mt-5">
        {mode === 'side' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <figure className={frame}>
              <img src={images.source} alt="الكتابة الأصلية" className={img} />
              <figcaption className="mt-3 text-center text-caption text-muted-foreground">صورتك</figcaption>
            </figure>
            <figure className={frame}>
              <img src={images.candidate} alt={`النص بخط ${match.font.face.nameAr}`} className={img} />
              <figcaption className="mt-3 text-center text-caption text-muted-foreground">
                {match.font.face.nameAr}
              </figcaption>
            </figure>
          </div>
        )}

        {mode === 'overlay' && (
          <>
            <div className={frame}>
              <div className="relative mx-auto" style={{ maxWidth: `${images.width}px` }}>
                <img src={images.source} alt="الكتابة الأصلية" className={img} />
                <img
                  src={images.candidate}
                  alt={`النص بخط ${match.font.face.nameAr} فوق الأصل`}
                  className={`${img} absolute inset-0`}
                  style={{ opacity: mix / 100 }}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <span className="text-caption text-muted-foreground">صورتك</span>
              <Slider
                aria-label="شفافية الخط المقترح"
                value={[mix]}
                onValueChange={([v]) => setMix(v ?? 55)}
                className="flex-1"
              />
              <span className="text-caption text-muted-foreground">{match.font.face.nameAr}</span>
            </div>
          </>
        )}

        {mode === 'diff' && (
          <>
            <div className={frame}>
              <div className="relative mx-auto" style={{ maxWidth: `${images.width}px` }}>
                <img src={images.both} alt="الأجزاء المتطابقة" className={img} />
                <img src={images.onlySource} alt="" className={`${img} absolute inset-0`} />
                <img src={images.onlyCandidate} alt="" className={`${img} absolute inset-0`} />
              </div>
            </div>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-caption text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <span aria-hidden className="size-2.5 rounded-full bg-foreground" /> متطابق
              </li>
              <li className="flex items-center gap-1.5">
                <span aria-hidden className="size-2.5 rounded-full bg-info-strong" /> في صورتك فقط
              </li>
              <li className="flex items-center gap-1.5">
                <span aria-hidden className="size-2.5 rounded-full bg-primary-fill" /> في الخط المقترح فقط
              </li>
            </ul>
          </>
        )}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-4">
        {(
          [
            ['الشكل العام', match.breakdown.shape],
            ['توزيع الحروف', match.breakdown.layout],
            ['سماكة الضربة', match.breakdown.stroke],
            ['النسب', match.breakdown.proportion],
          ] as const
        ).map(([k, v]) => (
          <div key={k}>
            <dt className="text-caption text-tertiary">{k}</dt>
            <dd dir="ltr" className="text-right text-control font-semibold tabular-nums">
              {Math.round(v * 100)}٪
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
