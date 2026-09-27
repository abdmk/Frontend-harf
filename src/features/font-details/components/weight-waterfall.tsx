import { Reveal } from '@/components/shared/reveal';
import { weightStyle } from '@/lib/font-weight';

const WEIGHTS = [
  [100, 'Thin'],
  [200, 'ExtraLight'],
  [300, 'Light'],
  [400, 'Regular'],
  [500, 'Medium'],
  [600, 'SemiBold'],
  [700, 'Bold'],
  [800, 'Black'],
  [1000, 'Super'],
] as const;
const SAMPLE = 'نص حكيم له سر قاطع وشأن عظيم، بثوب أخضر وجلد أزرق';

/** شلال الأوزان: الرقم، العيّنة بالوزن نفسه، الاسم اللاتيني */
export function WeightWaterfall() {
  return (
    <section aria-label="الأوزان" className="mt-12">
      <ol className="flex flex-col">
        {WEIGHTS.map(([w, name], i) => (
          <Reveal
            as="li"
            key={w}
            index={i}
            className="grid grid-cols-[32px_minmax(0,1fr)_72px] items-baseline gap-4 py-2 sm:grid-cols-[40px_minmax(0,1fr)_110px]"
          >
            <span dir="ltr" className="text-right text-caption text-tertiary">
              {w}
            </span>
            <span
              className={i === 0 ? 'truncate text-specimen text-tertiary' : 'truncate text-specimen'}
              style={weightStyle(w)}
            >
              {SAMPLE}
            </span>
            <span
              dir="ltr"
              className={i === 0 ? 'text-sm text-tertiary' : 'text-sm'}
              style={weightStyle(Math.max(w, 400))}
            >
              {name}
            </span>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
