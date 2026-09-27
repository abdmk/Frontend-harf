import type { Metadata } from 'next';

import { HeaderActions } from '@/app/header-actions';
import { SiteHeader } from '@/components/layout/site-header';

export const metadata: Metadata = {
  title: 'دليل التصميم',
  description: 'رموز حرف ومكوّناتها الحيّة وحالاتها.',
  robots: { index: false, follow: false },
};

export default function DesignSystemLayout({ children }: LayoutProps<'/design-system'>) {
  return (
    <>
      <SiteHeader wide actions={<HeaderActions />} />
      {children}
    </>
  );
}
