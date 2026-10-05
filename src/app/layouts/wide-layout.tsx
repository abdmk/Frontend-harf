import { Outlet } from 'react-router';

import { SiteHeader } from '@/components/layout/site-header';

import { HeaderActions } from '../header-actions';
import { preloadPage } from '../preload';
import { PageTransition } from './page-transition';

export function WideLayout() {
  return (
    <>
      <SiteHeader actions={<HeaderActions />} onNavIntent={preloadPage} />
      <PageTransition>
        <Outlet />
      </PageTransition>
    </>
  );
}
