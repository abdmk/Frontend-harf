import { Link } from 'react-router';

import { DownloadButton } from '@/components/shared/download-button';
import { PriceDisplay } from '@/components/shared/price-display';
import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { usd } from '@/types/domain/commerce';
import type { Font } from '@/types/domain/font';

/**
 * أسفل بطاقة الخط للمدفوع والتجريبي (دليل التصميم 5.1):
 * السعر (مع المشطوب إن وُجد) + الشراء يفتح لوحة الترخيص في صفحة الخط.
 */
export function CardPurchase({ font }: { font: Font }) {
  return (
    <div className="mt-1 flex items-center justify-between gap-3">
      <PriceDisplay
        price={usd(font.price)}
        compareAt={font.compareAtPrice ? usd(font.compareAtPrice) : undefined}
        size="sm"
      />
      <div className="relative z-10 flex items-center gap-2">
        {font.type === 'trial' && <DownloadButton fontName={font.name} label="تجربة" variant="secondary" />}
        <Button asChild size="sm" className="h-8 rounded-xs px-3 text-meta">
          <Link to={paths.font.getHref(font.id, { license: true })} aria-label={`شراء ترخيص ${font.name}`}>
            {font.type === 'trial' ? 'شراء' : 'اختر الترخيص'}
          </Link>
        </Button>
      </div>
    </div>
  );
}
