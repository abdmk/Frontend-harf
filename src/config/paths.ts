/** كل روابط التطبيق في مكان واحد — لا روابط نصّية متفرّقة في المكوّنات */
export const paths = {
  home: { getHref: () => '/' },
  font: { getHref: (id: string) => `/fonts/${encodeURIComponent(id)}` },
  account: {
    getHref: (section: string = 'profile') => `/account/${encodeURIComponent(section)}`,
  },
} as const;
