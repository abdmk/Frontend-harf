import { Link } from 'react-router';

import { BANNER_FRAME, BannerSlide } from '@/components/shared/banner-slide';
import { Carousel } from '@/components/shared/carousel';
import { type Banner, isExternalLink, safeContentLink, useSiteContent } from '@/lib/site-content';

/**
 * بلا بنرات مفعّلة من لوحة الإدارة: شرائح تعريفية بمحتوى حقيقي (المكتبة وأدواتها) بدل أرضيّات فارغة —
 * أعلى الصفحة الرئيسية لا يبقى مساحة بلا معنى. تختفي تلقائياً حين يضيف المشرف بنراته.
 */
const DEFAULT_BANNERS: Banner[] = [
  {
    id: 'default-library',
    image: '',
    alt: '',
    title: 'خطوط عربية بتراخيص واضحة',
    text: 'خطوط مجانية ومدفوعة من مصمّمين عرب — جرّب كل خط بنصّك قبل أن تحمّله أو تشتريه.',
    tone: 'dawn',
    href: '',
    active: true,
  },
  {
    id: 'default-nasaq',
    image: '',
    alt: '',
    title: 'نسق: خطوط تنسجم معاً',
    text: 'اكتب نصّك واختر خطاً، ونقترح ما يناسبه للعناوين والنصوص من مكتبة حرف.',
    tone: 'brand',
    href: '/tools/nasaq',
    active: true,
  },
  {
    id: 'default-lab',
    image: '',
    alt: '',
    title: 'مختبر الخط: اكتشف خطّك قبل أن تستخدمه',
    text: 'ارفع ملف الخط واختبر أوزانه وحروفه وتشكيله وميزات OpenType — في متصفّحك.',
    tone: 'trial',
    href: '/tools/font-lab',
    active: true,
  },
  {
    id: 'default-ain',
    image: '',
    alt: '',
    title: 'عين: ما اسم هذا الخط؟',
    text: 'ارفع صورة فيها كتابة عربية، ونقارن حروفها بخطوط المكتبة.',
    tone: 'gold',
    href: '/tools/font-matching',
    active: true,
  },
];

/** الشريحة المميّزة أعلى المكتبة — بنراتها من لوحة الإدارة («المحتوى»)، وبلا بنرات مفعّلة أرضيّات هادئة */
export function FeaturedCarousel({
  count = 4,
  overlay,
}: {
  count?: number;
  /** عناصر فوق الشريحة (زرّ الإدارة) */ overlay?: React.ReactNode;
}) {
  const active = useSiteContent().banners.filter((b) => b.active);
  const banners = active.length ? active : DEFAULT_BANNERS.slice(0, count);
  const slides = banners.map((b) => {
    const href = safeContentLink(b.href);
    const img = <BannerSlide banner={b} linked={!!href} />;
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
  });
  return <Carousel label="المميّز" autoPlay={6000} slides={slides} className={BANNER_FRAME} overlay={overlay} />;
}
