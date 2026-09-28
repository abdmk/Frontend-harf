import { type CSSProperties, useLayoutEffect, useRef } from 'react';

import { cn } from '@/lib/cn';

/**
 * نص يُحرَّر مباشرة على البطاقة. غير متحكَّم به أثناء الكتابة (لا يقفز المؤشّر)،
 * ويتزامن مع القيمة المشتركة حين لا يكون مركّزاً — فالكتابة في بطاقة تظهر في كل البطاقات.
 */
export function EditableText({
  value,
  onChange,
  label,
  className,
  style,
  dir,
  max = 280,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  className?: string;
  style?: CSSProperties;
  dir?: 'rtl' | 'ltr';
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.textContent !== value) el.textContent = value;
  }, [value]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={label}
      spellCheck={false}
      dir={dir}
      onInput={(e) => onChange((e.currentTarget.textContent ?? '').slice(0, max))}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      onPaste={(e) => {
        // نصّ عادي فقط وبطول محدود — لا HTML
        e.preventDefault();
        document.execCommand('insertText', false, e.clipboardData.getData('text/plain').slice(0, max));
      }}
      className={cn(
        'rounded-xs [overflow-wrap:anywhere] outline-none focus-visible:bg-sunken/60 focus-visible:shadow-[0_0_0_4px_var(--sunken)]',
        className,
      )}
      style={style}
    />
  );
}
