export const siteConfig = {
  name: 'مكتبة حرف',
  nameEn: 'Harf Library',
  description: 'مكتبة حرف: خطوط عربية ومتعددة اللغات، مجانية ومدفوعة، بتراخيص واضحة.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
} as const;

/** روابط الترويسة: مجموعتان يفصل بينهما خطّ، كما في التصميم */
export const mainNav = [
  [
    { label: 'خطوط مجانية', href: '/' },
    { label: 'خطوط مدفوعة', href: '#' },
    { label: 'مخطوطات', href: '#' },
  ],
  [
    { label: 'مطابقة الخطوط', href: '#' },
    { label: 'مختبر الخط', href: '#' },
    { label: 'استوديو الخط', href: '#' },
    { label: 'عكس النص', href: '#' },
  ],
] as const;

export const footerNav = [
  { label: 'حرف', href: '#' },
  { label: 'الخدمات', href: '#' },
  { label: 'المدونة', href: '#' },
  { label: 'الشروط والأحكام', href: '#' },
  { label: 'سياسة الخصوصية', href: '#' },
  { label: 'المساعدة', href: '#' },
] as const;
