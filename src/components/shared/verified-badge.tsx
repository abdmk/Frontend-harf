import { cn } from '@/lib/cn';
import { useIsVerified, useMyVerification } from '@/lib/studio-verification';

/** علامة «موثّق» الزرقاء بجانب اسم مصمّم أو مسبك */
export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn('grid size-4 shrink-0 place-items-center rounded-full bg-trial-600 text-white', className)}
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
      <span className="sr-only"> موثّق</span>
    </span>
  );
}

/** علامة التوثيق لحساب بعينه — تظهر فقط إن اعتمدت الإدارة توثيقه */
export function UserVerifiedBadge({ userId, className }: { userId: string | undefined; className?: string }) {
  return useIsVerified(userId) ? <VerifiedBadge className={className} /> : null;
}

/** علامة التوثيق للحساب الحالي */
export function MyVerifiedBadge({ className }: { className?: string }) {
  return useMyVerification()?.status === 'approved' ? <VerifiedBadge className={className} /> : null;
}
