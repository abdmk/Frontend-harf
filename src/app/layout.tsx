import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';

import { ThemeScript } from '@/components/shared/theme-script';
import { graphik } from '@/config/fonts';
import { siteConfig } from '@/config/site';
import { surface } from '@/design-system/tokens';

import { AppProviders } from './providers';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} — خطوط عربية مجانية ومدفوعة`, template: `%s — ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: { siteName: siteConfig.name, locale: 'ar', type: 'website' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: surface.light },
    { media: '(prefers-color-scheme: dark)', color: surface.dark },
  ],
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  // الـnonce يضعه src/proxy.ts لكل طلب، ويُمرَّر للسكربت المضمَّن الوحيد
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <html lang="ar" dir="rtl" className={graphik.variable} suppressHydrationWarning>
      <head>
        <ThemeScript nonce={nonce} />
      </head>
      <body className="min-h-dvh font-sans">
        <AppProviders nonce={nonce}>{children}</AppProviders>
      </body>
    </html>
  );
}
