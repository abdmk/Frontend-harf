import { cn } from '@/lib/cn';

/**
 * الصورة الرمزية (دليل التصميم 2.5): حرفان لاتينيان، واللون مشتقّ من تجزئة المعرّف —
 * الشخص نفسه يحصل على اللون نفسه دائماً، دون تخزين لون في البيانات.
 */
const TONES = [
  // درجات 600/700 — تباين الحرفين الأبيضين ≥ 4.5 (WCAG AA)
  'bg-harf-600',
  'bg-trial-600',
  'bg-ok-700',
  'bg-ai-500',
  'bg-trial-700',
  'bg-warn-700',
  'bg-n-600',
] as const;

export function avatarTone(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return TONES[Math.abs(h) % TONES.length]!;
}

const SIZE = {
  xs: 'size-5 text-3xs',
  sm: 'size-6 text-3xs',
  md: 'size-9 text-caption',
  lg: 'size-12 text-control',
  xl: 'size-15 text-lead',
} as const;

type AvatarProps = {
  initials: string;
  /** معرّف ثابت (id) يُشتقّ منه اللون */
  seed: string;
  size?: keyof typeof SIZE;
  className?: string;
};

export function Avatar({ initials, seed, size = 'md', className }: AvatarProps) {
  return (
    <span
      aria-hidden
      dir="ltr"
      className={cn(
        'grid shrink-0 place-items-center rounded-full leading-none font-semibold text-white not-italic',
        SIZE[size],
        avatarTone(seed),
        className,
      )}
    >
      {initials}
    </span>
  );
}
