import { cn } from '@/lib/cn';

/** علامة «موثّق» الزرقاء بجانب اسم مصمّم أو مسبك */
export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn('grid size-4 shrink-0 place-items-center rounded-full bg-trial-500 text-white', className)}
      title="موثّق"
    >
      <svg viewBox="0 0 12 12" aria-hidden className="size-[62%]">
        <path
          d="M2.5 6.2 5 8.5l4.5-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sr-only">موثّق</span>
    </span>
  );
}
