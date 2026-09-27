import { HeaderActions } from '@/app/header-actions';
import { SiteHeader } from '@/components/layout/site-header';

export default function StudioLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <SiteHeader wide actions={<HeaderActions />} />
      {children}
    </>
  );
}
