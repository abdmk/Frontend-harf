import { Outlet } from 'react-router';

import { SiteHeader } from '@/components/layout/site-header';

import { HeaderActions } from '../header-actions';

export function WideLayout() {
  return (
    <>
      <SiteHeader actions={<HeaderActions />} />
      <Outlet />
    </>
  );
}
