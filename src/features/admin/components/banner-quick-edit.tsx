import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { PencilIcon } from '@/components/ui/icons';
import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';
import { useIsAdmin } from '@/lib/auth';
import { useSiteContent } from '@/lib/site-content';

// المحرّر يُحمَّل عند الفتح فقط — لا يثقل الصفحة الرئيسية على الزوّار
const BannersEditor = lazy(() => import('./content-manager').then((m) => ({ default: m.BannersEditor })));

/**
 * زرّ «إدارة البنرات» فوق الشريحة في الصفحة الرئيسية — للمشرف وحده، يفتح المحرّر نفسه دون مغادرة
 * الصفحة. الإخفاء هنا للواجهة؛ الحفظ يتحقّق من الدور (features/admin/api/content).
 */
export function BannerQuickEdit() {
  const isAdmin = useIsAdmin();
  const [open, setOpen] = useState(false);
  const { banners } = useSiteContent();
  if (!isAdmin) return null;
  return (
    <>
      <Button
        size="sm"
        variant="ink"
        onClick={() => setOpen(true)}
        className="absolute end-5 bottom-5 z-10 shadow-float"
      >
        <PencilIcon />
        إدارة البنرات
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-dialog-lg">
          <div>
            <DialogTitle>بنرات الصفحة الرئيسية</DialogTitle>
            <DialogDescription className="mt-1 text-meta text-muted-foreground">
              التغييرات تظهر هنا فور الحفظ.{' '}
              <Link
                to={paths.admin.getHref('content')}
                className="font-medium text-foreground underline underline-offset-4"
              >
                كل المحتوى
              </Link>
            </DialogDescription>
          </div>
          <Suspense fallback={<Spinner className="mx-auto my-10" />}>
            <BannersEditor key={banners.map((b) => b.id).join()} saved={banners} />
          </Suspense>
        </DialogContent>
      </Dialog>
    </>
  );
}
