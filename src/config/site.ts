export const siteConfig = {
  name: 'مكتبة حرف',
  nameEn: 'Harf Library',
  description: 'مكتبة حرف: خطوط عربية ومتعددة اللغات، مجانية ومدفوعة، بتراخيص واضحة.',
  url: import.meta.env.VITE_SITE_URL ?? 'http://localhost:3000',
} as const;

/** روابط الترويسة: مجموعتان يفصل بينهما خطّ، كما في التصميم */
export const mainNav = [
  { label: 'خطوط مجانية', href: '/' },
  { label: 'خطوط مدفوعة', href: '/?license=paid' },
  { label: 'مخطوطات', href: '/manuscripts' },
  { label: 'مطابقة الخطوط', href: '/tools/font-matching' },
  { label: 'نسق', href: '/tools/nasaq' },
  { label: 'مختبر الخط', href: '/tools/font-lab' },
  { label: 'عكس النص', href: '/tools/reverse-text' },
] as const;

export const footerNav = [
  { label: 'حرف', href: '/about' },
  { label: 'الخدمات', href: '/services' },
  { label: 'المدونة', href: '/blog' },
  { label: 'الشروط والأحكام', href: '/terms' },
  { label: 'سياسة الخصوصية', href: '/privacy' },
  { label: 'المساعدة', href: '/help' },
] as const;
