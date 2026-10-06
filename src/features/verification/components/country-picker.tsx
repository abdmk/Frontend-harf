import { useId, useMemo, useRef, useState } from 'react';

import { CheckIcon, ChevronDownIcon, SearchIcon } from '@/components/ui/icons';
import { fieldBox } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { COUNTRIES, countryName } from '../config/countries';

/** يطابق بلا تشكيل ولا همزات: «الاردن» تجد «الأردن»، و«عمان» تجد «عُمان» */
const fold = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[ً-ٰٟ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase()
    .trim();

/**
 * اختيار الدولة: قائمة قصيرة تنفتح تحت الحقل (لا تغطّي الصفحة)، بحث في أعلاها، وتمرير داخلها.
 * لوحة المفاتيح: الأسهم بين الدول، Enter للاختيار، Esc للإغلاق — والكتابة تبحث مباشرة.
 */
export function CountryPicker({
  id,
  value,
  onChange,
  invalid,
  describedBy,
}: {
  id: string;
  value: string;
  onChange: (code: string) => void;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();

  const results = useMemo(() => {
    const q = fold(query);
    return q ? COUNTRIES.filter((c) => fold(c.name).includes(q) || c.code.toLowerCase() === q) : COUNTRIES;
  }, [query]);

  const choose = (code: string) => {
    onChange(code);
    setOpen(false);
  };
  const move = (to: number) => {
    const next = Math.max(0, Math.min(results.length - 1, to));
    setActive(next);
    list.current?.children[next]?.scrollIntoView({ block: 'nearest' });
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          setQuery('');
          setActive(
            Math.max(
              0,
              COUNTRIES.findIndex((c) => c.code === value),
            ),
          );
        }
      }}
    >
      <PopoverTrigger
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={cn(
          fieldBox,
          'group/input cursor-pointer text-start outline-none focus-visible:border-primary focus-visible:shadow-focus aria-invalid:border-dgr-500',
          !value && 'text-tertiary',
        )}
      >
        <span className="flex-1 truncate">{value ? countryName(value) : 'اختر الدولة'}</span>
        <ChevronDownIcon
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-(--dur-base)',
            open && 'rotate-180',
          )}
        />
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        className="w-(--radix-popover-trigger-width) min-w-60 p-1.5"
        onOpenAutoFocus={(e) => {
          // التركيز على البحث مباشرة — يكتب المستخدم اسم دولته فوراً
          e.preventDefault();
          (e.currentTarget as HTMLElement).querySelector('input')?.focus();
        }}
      >
        <label className="flex h-10 items-center gap-2 rounded-sm bg-sunken px-3">
          <SearchIcon className="size-4 shrink-0 text-tertiary" />
          <span className="sr-only">ابحث عن دولة</span>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') move(active + 1);
              else if (e.key === 'ArrowUp') move(active - 1);
              else if (e.key === 'Enter' && results[active]) choose(results[active].code);
              else return;
              e.preventDefault();
            }}
            placeholder="ابحث عن دولتك…"
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${listId}-${results[active].code}` : undefined}
            className="min-w-0 flex-1 bg-transparent text-control outline-none placeholder:text-tertiary"
          />
        </label>
        <ul
          ref={list}
          id={listId}
          role="listbox"
          aria-label="الدول"
          className="mt-1.5 scroll-none max-h-64 overflow-y-auto overscroll-contain"
        >
          {results.map((c, i) => (
            <li
              key={c.code}
              id={`${listId}-${c.code}`}
              role="option"
              aria-selected={c.code === value}
              onPointerMove={() => setActive(i)}
              onClick={() => choose(c.code)}
              className={cn(
                'flex h-10 cursor-pointer items-center justify-between gap-3 rounded-xs px-3 text-control transition-colors duration-(--dur-fast)',
                i === active && 'bg-sunken',
                c.code === value && 'font-medium text-primary',
              )}
            >
              {c.name}
              {c.code === value && <CheckIcon className="size-4 shrink-0" />}
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-3 py-6 text-center text-meta text-muted-foreground">لا توجد دولة بهذا الاسم.</li>
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
