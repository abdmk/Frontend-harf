import { Outlet } from 'react-router';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

import { HeaderActions } from '../header-actions';
import { PageTransition } from './page-transition';

export function SiteLayout() {
  return (
    <>
      <SiteHeader actions={<HeaderActions />} />
      <PageTransition>
        <Outlet />
      </PageTransition>
      <SiteFooter />
    </>
  );
}
