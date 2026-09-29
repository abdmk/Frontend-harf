import type { ReactNode } from 'react';

/** قسم مسطّح في لوحات التصفية: عنوان، تلميح اختياري، و«إعادة» تظهر فقط حين يختلف القسم عن الافتراضي */
export function FilterSection({
  title,
  hint,
  onReset,
  children,
}: {
  title: string;
  hint?: string;
  onReset?: () => void;
  children: ReactNode;
}) {
  return (
    <section className="py-5">
      <div className="mb-3.5 flex min-h-7 items-center justify-between gap-3">
        <div>
          <h3 className="text-control font-semibold">{title}</h3>
          {hint && <p className="mt-0.5 text-caption text-tertiary">{hint}</p>}
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            aria-label={`إعادة ${title}`}
            className="animate-pop-in rounded-full px-2.5 py-1 text-caption text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground"
          >
            إعادة
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
