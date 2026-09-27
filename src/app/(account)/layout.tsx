import { SiteHeader } from '@/components/layout/site-header';

import { HeaderActions } from '@/app/header-actions';

export default function AccountLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <SiteHeader wide actions={<HeaderActions />} />
      {children}
    </>
  );
}
