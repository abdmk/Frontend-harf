import { Slider as SliderPrimitive } from 'radix-ui';

/** مدى بمقبضين على مسار رفيع، والقيمتان نصّاً هادئاً تحته — القيمة undefined تعني «بلا فلتر» */
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
        className="relative flex h-6 w-full touch-none items-center select-none"
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full overflow-hidden rounded-full bg-inset">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary-fill" />
        </SliderPrimitive.Track>
        {idx.map((v, i) => (
          <SliderPrimitive.Thumb
            key={i}
            aria-label={labels[i]}
            aria-valuetext={format(stops[v]!)}
            className="block size-6 cursor-grab rounded-full border bg-card shadow-soft transition-transform duration-(--dur-base) ease-pop outline-none hover:scale-110 focus-visible:ring-4 focus-visible:ring-ring/25 active:scale-110 active:cursor-grabbing"
          />
        ))}
      </SliderPrimitive.Root>
      <div className="mt-3 flex justify-between gap-3 text-meta text-muted-foreground tabular-nums">
        {/* المسار من اليسار (الأدنى) — والقيمتان تحت مقبضيهما */}
        <span>{format(stops[idx[0]]!)}</span>
        <span>{format(stops[idx[1]]!)}</span>
      </div>
    </div>
  );
}
