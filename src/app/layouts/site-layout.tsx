import { Outlet } from 'react-router';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

import { HeaderActions } from '../header-actions';

export function SiteLayout() {
  return (
    <>
      <SiteHeader actions={<HeaderActions />} />
      <Outlet />
      <SiteFooter />
    </>
  );
}
