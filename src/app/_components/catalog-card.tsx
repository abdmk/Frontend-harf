import { FontCard } from '@/components/shared/font-card';
import { FavoriteButton } from '@/features/favorites/components/favorite-button';
import { CardPurchase } from '@/features/licensing/components/card-purchase';
import type { Font } from '@/types/domain/font';

/** بطاقة الخط كما تُعرض في كل القوائم: تركيب المفضّلة والشراء من الـfeatures في مكان واحد */
export function CatalogCard({ font }: { font: Font }) {
  return (
    <FontCard
      font={font}
      favorite={<FavoriteButton fontId={font.id} fontName={font.name} />}
      action={font.type === 'free' ? undefined : <CardPurchase font={font} />}
    />
  );
}
