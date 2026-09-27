import { Carousel } from '@/components/shared/carousel';

/** الشريحة المميّزة أعلى المكتبة — محتواها (صور/إعلانات) يأتي من لوحة الإدارة لاحقاً */
export function FeaturedCarousel({ count = 4 }: { count?: number }) {
  const slides = Array.from({ length: count }, (_, i) => <div key={i} className="size-full bg-sunken" />);
  return (
    <Carousel
      label="المميّز"
      autoPlay={6000}
      slides={slides}
      className="aspect-video rounded-lg sm:aspect-[1120/290]"
    />
  );
}
