import type { MetadataRoute } from 'next';

import { siteConfig } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account', '/design-system', '/cart', '/checkout', '/login', '/register', '/studio', '/admin'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
