import { Navigate, Outlet, useLocation } from 'react-router';

import { paths } from '@/config/paths';
import { AdminShell } from '@/features/admin/components/admin-shell';
import { getCurrentUser } from '@/lib/auth';

import { HeaderActions } from '../header-actions';
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
    <AdminShell actions={<HeaderActions />}>
      <PageTransition>
        <Outlet />
      </PageTransition>
    </AdminShell>
  );
}
