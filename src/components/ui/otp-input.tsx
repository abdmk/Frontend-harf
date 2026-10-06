import { useId, useRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * رمز التأكيد بخانات منفصلة: الكتابة تنتقل للخانة التالية، الحذف يعود، واللصق يوزّع الأرقام.
 * الخانة الأولى تحمل autoComplete="one-time-code" فيقترح الهاتف الرمز من الرسالة.
 * الأرقام العربية-الهندية (٠-٩) تُحوَّل إلى لاتينية.
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  label,
  invalid,
  disabled,
  autoFocus,
  describedBy,
}: {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  label: string;
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  describedBy?: string;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const id = useId();
  // الخانة الفارغة وسط الرمز تُحفظ مسافة — فلا يمرّ رمز ناقص على تحقّق /^\d{6}$/
  const digits = Array.from({ length }, (_, i) => (value[i] ?? '').trim());
  const clean = (s: string) => s.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/\D/g, '');
  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  function setAt(i: number, chars: string) {
    const next = digits.map((x) => x || ' ');
    for (let k = 0; k < chars.length && i + k < length; k++) next[i + k] = chars[k]!;
    onChange(next.join('').slice(0, length).trimEnd());
    focus(i + chars.length);
  }

  function clearAt(i: number) {
    const next = digits.map((x) => x || ' ');
    next[i] = ' ';
    onChange(next.join('').trimEnd());
  }

  return (
    <div
      role="group"
      aria-label={label}
      aria-describedby={describedBy}
      dir="ltr"
      className="grid gap-2 sm:gap-3"
      style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          id={i === 0 ? id : undefined}
          value={d}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          aria-label={`الرقم ${i + 1} من ${length}`}
          aria-invalid={invalid || undefined}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            const v = clean(e.target.value);
            if (!v) return clearAt(i);
            // لصق أو اقتراح الهاتف يضع الرمز كله في خانة واحدة ← نوزّعه
            setAt(v.length >= length ? 0 : i, v.length >= length ? v.slice(0, length) : v.slice(-1));
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !d) {
              e.preventDefault();
              if (i > 0) clearAt(i - 1);
              focus(i - 1);
            } else if (e.key === 'ArrowLeft') focus(i - 1);
            else if (e.key === 'ArrowRight') focus(i + 1);
          }}
          onPaste={(e) => {
            const v = clean(e.clipboardData.getData('text'));
            if (!v) return;
            e.preventDefault();
            setAt(0, v.slice(0, length));
          }}
          className={cn(
            'aspect-[4/5] w-full rounded-lg border bg-card text-center text-2xl font-semibold tabular-nums transition-[border-color,box-shadow,background-color] duration-(--dur-fast) outline-none focus:border-foreground focus:ring-4 focus:ring-foreground/10 disabled:opacity-50',
            !d && 'border-transparent bg-sunken',
            invalid && 'border-dgr-500 bg-tint-dgr',
          )}
        />
      ))}
    </div>
  );
}
