import { Slider as SliderPrimitive } from 'radix-ui';

import { cn } from '@/lib/cn';

/** مدى بمقبضين على مسار عريض بنقاط لكل خطوة — القيمة null تعني «بلا فلتر» */
export function RangeField({
  stops,
  value,
  onChange,
  format,
  labels,
}: {
  stops: readonly number[];
  value: [number, number] | undefined;
  onChange: (v: [number, number] | undefined) => void;
  format: (v: number) => string;
  labels: [string, string];
}) {
  const max = stops.length - 1;
  const idx: [number, number] = value ? [stops.indexOf(value[0]), stops.indexOf(value[1])] : [0, max];
  return (
    <div dir="ltr">
      <SliderPrimitive.Root
        dir="ltr"
        min={0}
        max={max}
        step={1}
        minStepsBetweenThumbs={0}
        value={idx}
        onValueChange={([a = 0, b = max]) => onChange(a === 0 && b === max ? undefined : [stops[a]!, stops[b]!])}
        className="relative flex h-5 w-full touch-none items-center select-none"
      >
        <SliderPrimitive.Track className="relative h-5 w-full overflow-hidden rounded-full bg-sunken">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary-fill" />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-between px-[7.5px]"
          >
            {stops.map((_, i) => (
              <i
                key={i}
                className={cn('size-1.25 rounded-full', i >= idx[0] && i <= idx[1] ? 'bg-white/55' : 'bg-strong')}
              />
            ))}
          </span>
        </SliderPrimitive.Track>
        {idx.map((v, i) => (
          <SliderPrimitive.Thumb
            key={i}
            aria-label={labels[i]}
            aria-valuetext={format(stops[v]!)}
            className="grid size-5 cursor-grab place-items-center rounded-full outline-none active:cursor-grabbing"
          >
            <span className="size-2 rounded-full bg-white transition-transform duration-(--dur-base) ease-pop in-focus-visible:scale-150 in-active:scale-150" />
          </SliderPrimitive.Thumb>
        ))}
      </SliderPrimitive.Root>
      <div className="mt-4 flex justify-between gap-3">
        {idx.map((v, i) => (
          <span
            key={i}
            className="inline-flex h-10 min-w-21 items-center justify-center rounded-full border px-5 text-sm text-muted-foreground"
            dir="rtl"
          >
            {format(stops[v]!)}
          </span>
        ))}
      </div>
    </div>
  );
}
