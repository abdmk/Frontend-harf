import { useId, useState } from 'react';

import { CrossSmallIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

import type { DirectoryEntry } from '../api/directory';

/**
 * اختيار حسابات بالإشارة: اكتب «@» أو جزءاً من الاسم فتظهر القائمة — الأسهم للتنقّل، Enter للاختيار،
 * Backspace في حقل فارغ يحذف الأخير. المختار شرائح بالترتيب، وكل شريحة تُزال بزرّها.
 * القيمة معرّفات فقط؛ الأسماء تُعرض من الدليل (والخادم يتحقّق أنها حسابات موجودة).
 */
export function TagPicker({
  id,
  label,
  value,
  onChange,
  search,
  resolve,
  placeholder,
  max,
  invalid,
  describedBy,
}: {
  id: string;
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  search: (q: string, exclude: readonly string[]) => DirectoryEntry[];
  resolve: (id: string) => DirectoryEntry | undefined;
  placeholder: string;
  max: number;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const results = open ? search(q, value) : [];
  const full = value.length >= max;

  const add = (e: DirectoryEntry) => {
    if (full) return;
    onChange([...value, e.id]);
    setQ('');
    setActive(0);
    // تُغلق القائمة بعد الاختيار — الكتابة أو السهم للأسفل يعيدان فتحها
    setOpen(false);
  };

  return (
    <div className="relative">
      <div
        className={cn(
          'flex min-h-11 flex-wrap items-center gap-1.5 rounded-sm border bg-card px-2 py-1.5 transition-[border-color,box-shadow] focus-within:border-strong focus-within:ring-2 focus-within:ring-ring',
          invalid && 'border-dgr-500',
        )}
      >
        <ul aria-label={`${label} المختارون`} className="contents">
          {value.map((v) => {
            const e = resolve(v);
            return (
              <li key={v} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-sunken ps-3 pe-1 text-meta">
                <span dir="ltr" className="text-muted-foreground">
                  @{e?.handle ?? v}
                </span>
                {e && <span className="font-medium">{e.name}</span>}
                <button
                  type="button"
                  aria-label={`إزالة ${e?.name ?? v}`}
                  onClick={() => onChange(value.filter((x) => x !== v))}
                  className="grid size-6 place-items-center rounded-full text-tertiary hover:bg-inset hover:text-foreground"
                >
                  <CrossSmallIcon className="size-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
        {!full && (
          <input
            id={id}
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={results[active] ? `${listId}-${results[active].id}` : undefined}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            autoComplete="off"
            value={q}
            maxLength={40}
            placeholder={value.length ? '' : placeholder}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
              setActive(0);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                setOpen(true);
                const n = results.length || 1;
                setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : -1) + n) % n);
              } else if (e.key === 'Enter' && results[active]) {
                e.preventDefault();
                add(results[active]);
              } else if (e.key === 'Escape') setOpen(false);
              else if (e.key === 'Backspace' && !q && value.length) onChange(value.slice(0, -1));
            }}
            className="h-8 min-w-32 flex-1 bg-transparent px-1 text-control outline-none placeholder:text-tertiary"
          />
        )}
      </div>
      {results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute inset-x-0 top-full z-20 mt-1.5 flex animate-menu-in flex-col gap-0.5 rounded-md border bg-popover p-1.5 shadow-overlay"
        >
          {results.map((r, i) => (
            <li
              key={r.id}
              id={`${listId}-${r.id}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                add(r);
              }}
              onMouseEnter={() => setActive(i)}
              className="flex cursor-pointer items-center gap-3 rounded-sm px-2.5 py-2 aria-selected:bg-sunken"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-tint-brand text-caption font-semibold text-primary">
                {r.name.slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-control font-medium">{r.name}</span>
                <span className="block truncate text-caption text-muted-foreground">
                  <span dir="ltr">@{r.handle}</span>
                  {r.sub ? ` · ${r.sub}` : ''}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
