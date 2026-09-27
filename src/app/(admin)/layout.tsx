import { HeaderActions } from '@/app/header-actions';
import { SiteHeader } from '@/components/layout/site-header';

export default function AdminLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <SiteHeader wide actions={<HeaderActions />} />
      {children}
    </>
  );
}
