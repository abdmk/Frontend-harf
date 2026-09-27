import { SiteFooter } from '@/components/layout/site-footer';

import { HeaderActions } from '@/app/header-actions';
import { SiteHeader } from '@/components/layout/site-header';

export default function SiteLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <SiteHeader actions={<HeaderActions />} />
      {children}
      <SiteFooter />
    </>
  );
}
