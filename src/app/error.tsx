import { isRouteErrorResponse, Link, useNavigate, useRouteError } from 'react-router';

import { PageMeta } from '@/components/shared/page-meta';
import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';

export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main id="main" className="grid min-h-[60dvh] place-items-center px-6 text-center">
      <PageMeta title={is404 ? 'الصفحة غير موجودة' : 'حدث خطأ غير متوقّع'} noindex />
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold">{is404 ? 'الصفحة غير موجودة' : 'حدث خطأ غير متوقّع'}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {is404
            ? 'المسار الذي طلبته غير موجود. تحقّق من الرابط، أو عد إلى المكتبة وابحث عمّا تريد.'
            : 'لم نستطع عرض هذه الصفحة الآن. حاول مجدداً بعد لحظات.'}
        </p>
        {/* 404: إعادة التحميل لا تُصلح رابطاً مفقوداً — الطريق للمكتبة. غيرها: إعادة المحاولة، والمكتبة بديلاً */}
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {!is404 && (
            <Button size="lg" onClick={() => navigate(0)}>
              أعد المحاولة
            </Button>
          )}
          <Button asChild size="lg" variant={is404 ? 'primary' : 'secondary'}>
            <Link to={paths.home.getHref()}>العودة إلى المكتبة</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
