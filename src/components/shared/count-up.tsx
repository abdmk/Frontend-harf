import { useEffect, useRef, useState } from 'react';

const PATTERN = /^([^\d-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/;
const DURATION = 700;

/**
 * رقم يعدّ إلى قيمته مرّة واحدة عند الظهور («53,736»، «$1,169»، «4.8 / 5»): يحفظ البادئة واللاحقة
 * والفواصل والكسور كما هي. النص غير الرقمي يُعرض كما هو، و«تقليل الحركة» يُظهر القيمة فوراً.
 * القيمة النهائية متاحة لقارئ الشاشة من البداية، والعدّ نفسه مخفي عنه.
 */
export function CountUp({ value }: { value: string }) {
  const m = PATTERN.exec(value);
  const target = m ? Number(m[2]!.replace(/,/g, '')) : NaN;
  const decimals = m?.[2]!.split('.')[1]?.length ?? 0;
  const grouped = m?.[2]!.includes(',') ?? false;
  // يبدأ من الصفر مباشرة (لا وميض للقيمة النهائية قبل العدّ) — إلا مع «تقليل الحركة» أو قيمة غير رقمية
  const [shown, setShown] = useState<number | null>(() =>
    Number.isFinite(target) && target !== 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 0
      : null,
  );
  const done = useRef(false);

  useEffect(() => {
    if (done.current || shown === null) return;
    done.current = true;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = 1 - (1 - t) ** 4; // ease-out-quart: يبدأ سريعاً ويهدأ عند القيمة
      setShown(t < 1 ? target * eased : null);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- يعدّ مرّة واحدة عند الظهور
  }, []);

  if (!m || shown === null) return <>{value}</>;
  const num = shown.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouped,
  });
  return (
    <>
      <span className="sr-only">{value}</span>
      <span aria-hidden className="tabular-nums">
        {m[1]}
        {num}
        {m[3]}
      </span>
    </>
  );
}
