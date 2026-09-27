import type { MetadataRoute } from 'next';

import { paths } from '@/config/paths';
import { siteConfig } from '@/config/site';
import { getAllFontIds } from '@/features/catalog/api/get-fonts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ids = await getAllFontIds();
  return [
    { url: siteConfig.url, changeFrequency: 'daily', priority: 1 },
    ...ids.map((id) => ({
      url: `${siteConfig.url}${paths.font.getHref(id)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
