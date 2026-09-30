/** أقسام مساحة الاستوديو — قائمة مغلقة (لا مسارات حرّة) */
export type StudioSection =
  'fonts' | 'analytics' | 'finance' | 'finance/sales' | 'finance/earnings' | 'finance/payouts' | 'profile' | 'publish';

/** كل روابط التطبيق في مكان واحد — لا روابط نصّية متفرّقة في المكوّنات */
export const paths = {
  home: { getHref: () => '/' },
  font: {
    getHref: (id: string, opts?: { license?: boolean }) =>
      `/fonts/${encodeURIComponent(id)}${opts?.license ? '?license=1' : ''}`,
  },
  cart: { getHref: () => '/cart' },
  checkout: { getHref: () => '/checkout' },
  login: {
    getHref: (redirectTo?: string) => `/login${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ''}`,
  },
  register: { getHref: () => '/register' },
  account: {
    getHref: (section: string = 'profile') => (section ? `/account/${encodeURIComponent(section)}` : '/account'),
  },
  notifications: { getHref: () => '/notifications' },
  studio: {
    getHref: (section?: StudioSection) => (section ? `/studio/${section}` : '/studio'),
  },
  foundry: { getHref: (id: string) => `/foundries/${encodeURIComponent(id)}` },
  designer: { getHref: (id: string) => `/designers/${encodeURIComponent(id)}` },
  admin: { analytics: { getHref: () => '/admin/analytics' } },
  tools: { reverseText: { getHref: () => '/tools/reverse-text' } },
  designSystem: { getHref: () => '/design-system' },
} as const;
