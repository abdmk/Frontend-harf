import type { MetadataRoute } from 'next';

import { siteConfig } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/account', '/design-system'] },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
