import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router';

import { PageMeta } from '@/components/shared/page-meta';
import { Button } from '@/components/ui/button';

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
            ? 'المسار الذي طلبته غير موجود. تحقّق من الرابط أو عد للرئيسية.'
            : 'لم نستطع عرض هذه الصفحة الآن. حاول مجدداً بعد لحظات.'}
        </p>
        <Button size="lg" className="mt-2" onClick={() => navigate(0)}>
          أعد المحاولة
        </Button>
      </div>
    </main>
  );
}
