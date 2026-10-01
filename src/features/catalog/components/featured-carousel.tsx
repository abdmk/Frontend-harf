import { Link } from 'react-router';

import { Carousel } from '@/components/shared/carousel';
import { isExternalLink, safeContentLink, useSiteContent } from '@/lib/site-content';

const FRAME = 'aspect-video rounded-lg sm:aspect-[1120/290]';

/** الشريحة المميّزة أعلى المكتبة — بنراتها من لوحة الإدارة («المحتوى»)، وبلا بنرات مفعّلة أرضيّات هادئة */
export function FeaturedCarousel({
  count = 4,
  overlay,
}: {
  count?: number;
  /** عناصر فوق الشريحة (زرّ الإدارة) */ overlay?: React.ReactNode;
}) {
  const banners = useSiteContent().banners.filter((b) => b.active);
  const slides = banners.length
    ? banners.map((b) => {
        const img = <img src={b.image} alt={b.alt} className="size-full object-cover" draggable={false} />;
        const href = safeContentLink(b.href);
        if (!href)
          return (
            <div key={b.id} className="size-full">
              {img}
            </div>
          );
        return isExternalLink(href) ? (
          <a key={b.id} href={href} target="_blank" rel="noopener noreferrer" className="block size-full">
            {img}
          </a>
        ) : (
          <Link key={b.id} to={href} className="block size-full">
            {img}
          </Link>
        );
      })
    : Array.from({ length: count }, (_, i) => <div key={i} className="size-full bg-sunken" />);
  return <Carousel label="المميّز" autoPlay={6000} slides={slides} className={FRAME} overlay={overlay} />;
}
