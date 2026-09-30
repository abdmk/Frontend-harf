import { Outlet } from 'react-router';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

import { HeaderActions } from '../header-actions';
import { preloadPage } from '../lazy-pages';
import { PageTransition } from './page-transition';

export function SiteLayout() {
  return (
    <>
      <SiteHeader actions={<HeaderActions />} onNavIntent={preloadPage} />
      <PageTransition>
        <Outlet />
      </PageTransition>
      <SiteFooter />
    </>
  );
}
