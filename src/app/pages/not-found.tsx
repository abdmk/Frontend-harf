import { Link } from 'react-router';

import { HarfMark } from '@/components/shared/harf-logo';
import { PageMeta } from '@/components/shared/page-meta';
import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';

/**
 * «غير موجودة» — صفحة كاملة للمسارات المجهولة، وداخل التخطيط (inLayout) لخط أو مصمّم أو مؤسسة غير موجودة:
 * أوضح من تحويل صامت إلى الرئيسية يترك الزائر لا يعرف ماذا حدث.
 */
export function NotFoundPage({ inLayout = false }: { inLayout?: boolean }) {
  return (
    <main
      id="main"
      className={cn('grid place-items-center px-6 text-center', inLayout ? 'min-h-[60dvh]' : 'min-h-dvh')}
    >
      <PageMeta title="الصفحة غير موجودة" noindex />
      <div className="flex animate-fade-up flex-col items-center gap-4">
        <HarfMark className="size-12 text-primary" />
        <h1 className="text-2xl font-semibold">الصفحة غير موجودة</h1>
        <p className="max-w-sm text-sm text-muted-foreground">ربما نُقل الخط أو تغيّر الرابط. جرّب البحث في المكتبة.</p>
        <Button asChild size="lg" className="mt-2">
          <Link to={paths.home.getHref()}>العودة إلى المكتبة</Link>
        </Button>
      </div>
    </main>
  );
}
