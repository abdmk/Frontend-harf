import { useState } from 'react';

import { HeartIcon } from '@/components/ui/icons';
import { useFavorite } from '@/features/favorites/hooks/use-favorites';
import { cn } from '@/lib/utils';

type Props = { fontId: string; fontName: string; variant?: 'card' | 'square'; className?: string };

/** زرّ المفضّلة — القلب «ينبض» عند الإضافة */
export function FavoriteButton({ fontId, fontName, variant = 'card', className }: Props) {
  const { isFav, toggle } = useFavorite(fontId);
  const [pop, setPop] = useState(0);
  return (
    <button
      type="button"
      aria-pressed={isFav}
      aria-label={`المفضّلة: ${fontName}`}
      title={isFav ? 'إزالة من المفضّلة' : 'أضف إلى المفضّلة'}
      onClick={(e) => {
        e.preventDefault();
        toggle();
        setPop((n) => n + 1);
      }}
      className={cn(
        'grid place-items-center transition-[transform,background-color,color] duration-(--dur-base) ease-pop hover:scale-105 active:scale-95',
        variant === 'card'
          ? 'size-8 rounded-full bg-heart text-white backdrop-blur-sm aria-pressed:bg-primary-fill'
          : 'size-12 rounded-sm border border-gold-500/50 bg-gold-500/10 text-gold-500 aria-pressed:border-primary aria-pressed:bg-primary-fill aria-pressed:text-white',
        className,
      )}
    >
      <HeartIcon
        key={pop}
        filled={isFav}
        className={cn(variant === 'card' ? 'size-3.75' : 'size-4.5', pop > 0 && 'animate-heart')}
      />
    </button>
  );
}
