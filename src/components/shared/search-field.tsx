import { useEffect, useRef, useState } from 'react';

import { SearchIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

/**
 * حقل البحث (دليل التصميم 4.4): حبّة بأيقونة، يرسل القيمة بعد توقّف الكتابة (debounce)
 * ويتبع القيمة الخارجية إن تغيّرت (مثل «مسح الكل»). الطول محدود حمايةً للرابط والخادم.
 */
export function SearchField({
  value,
  onChange,
  label,
  placeholder,
  delay = 300,
  maxLength = 80,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  placeholder?: string;
  delay?: number;
  maxLength?: number;
  className?: string;
}) {
  const [text, setText] = useState(value);
  const last = useRef(value);
  useEffect(() => {
    if (value !== last.current) {
      last.current = value;
      setText(value);
    }
  }, [value]);
  useEffect(() => {
    const v = text.trim().slice(0, maxLength);
    if (v === last.current) return;
    const t = window.setTimeout(() => {
      last.current = v;
      onChange(v);
    }, delay);
    return () => window.clearTimeout(t);
  }, [text, onChange, delay, maxLength]);

  return (
    <label
      className={cn(
        'relative flex h-11 items-center rounded-full border bg-card transition-[box-shadow,border-color] focus-within:border-primary focus-within:shadow-focus dark:border-transparent dark:bg-sunken',
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      <SearchIcon className="pointer-events-none absolute start-4 size-4 text-muted-foreground" />
      <input
        type="search"
        value={text}
        maxLength={maxLength}
        autoComplete="off"
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="size-full rounded-full bg-transparent ps-11 pe-4 text-control outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:appearance-none"
      />
    </label>
  );
}
