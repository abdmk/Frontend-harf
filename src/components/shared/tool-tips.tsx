import type { ComponentType } from 'react';

/**
 * نصائح أدوات الرفع (عين، مختبر الخط) — بطاقات بأيقونة في دائرة بلون العلامة الفاتح.
 * على الجوال صفوف مختصرة (الأيقونة بجانب النص) كي لا تطول الصفحة؛ ومن sm بطاقات وسطية.
 */
export function ToolTips({
  id,
  title,
  tips,
}: {
  id: string;
  /** عنوان للقارئ الآلي — مخفي بصرياً */
  title: string;
  tips: readonly { icon: ComponentType<{ className?: string }>; title: string; text: string }[];
}) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="sr-only">
        {title}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {tips.map(({ icon: Icon, title: t, text }) => (
          <li
            key={t}
            className="group flex items-start gap-3.5 rounded-xl border bg-card p-4 transition-[border-color,transform] duration-(--dur-base) ease-out-quint hover:-translate-y-0.5 hover:border-strong sm:flex-col sm:items-center sm:gap-0 sm:p-5 sm:text-center"
          >
            <span
              aria-hidden
              className="grid size-10 shrink-0 place-items-center rounded-full bg-tint-brand text-primary transition-transform duration-(--dur-slow) ease-pop group-hover:scale-110 sm:size-12"
            >
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-control font-semibold sm:mt-4">{t}</h3>
              <p className="mt-1 text-caption leading-relaxed text-muted-foreground sm:mt-1.5">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
