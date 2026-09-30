import { Navigate, Outlet, useLocation } from 'react-router';

import { SiteHeader } from '@/components/layout/site-header';
import { paths } from '@/config/paths';
import { AdminSidebar, AdminTabs } from '@/features/admin/components/admin-nav';
import { getCurrentUser } from '@/lib/auth';

import { HeaderActions } from '../header-actions';
import { preloadPage } from '../lazy-pages';
import { PageTransition } from './page-transition';
import { NotFoundPage } from '../pages/not-found';

/**
 * لوحة الإدارة: مساحة مستقلّة بعمود جانبي، وحارس واحد لكل صفحاتها.
 * غير المسجَّل يُحوَّل للدخول؛ والمسجَّل بغير دور المشرف يرى 404 — لا نكشف وجود اللوحة.
 * ⚠️ الحارس هنا للواجهة فقط؛ الخادم يتحقّق من الدور في كل طلب إداري.
 */
export function AdminLayout() {
  const { pathname, search } = useLocation();
  const user = getCurrentUser();
  if (!user) return <Navigate to={paths.login.getHref(pathname + search)} replace />;
  if (user.role !== 'admin') return <NotFoundPage />;
  return (
    <>
      <SiteHeader actions={<HeaderActions />} onNavIntent={preloadPage} />
      <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-6 py-6 sm:py-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10 lg:py-10">
        <aside className="hidden lg:sticky lg:top-26 lg:block lg:max-h-[calc(100dvh-8rem)] lg:self-start lg:overflow-y-auto">
          <AdminSidebar />
        </aside>
        <AdminTabs />
        <main id="main" className="min-w-0">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </>
  );
}
