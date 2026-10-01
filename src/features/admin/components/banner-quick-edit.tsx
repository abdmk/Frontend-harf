import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { PencilIcon, ShieldCheckIcon } from '@/components/ui/icons';
import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';
import { useIsAdmin } from '@/lib/auth';
import { useSiteContent } from '@/lib/site-content';

// المحرّر يُحمَّل عند الفتح فقط — لا يثقل الصفحة الرئيسية على الزوّار
const BannersEditor = lazy(() => import('./content-manager').then((m) => ({ default: m.BannersEditor })));

/**
 * شريط «إدارة البنرات» تحت الشريحة في الصفحة الرئيسية — للمشرف وحده، يفتح المحرّر نفسه دون مغادرة
 * الصفحة. الإخفاء هنا للواجهة؛ الحفظ يتحقّق من الدور (features/admin/api/content).
 */
export function BannerQuickEdit() {
  const isAdmin = useIsAdmin();
  const [open, setOpen] = useState(false);
  const { banners } = useSiteContent();
  if (!isAdmin) return null;
  return (
    <>
      {/* شريط مشرف هادئ تحت الشريحة: حالة البنرات وزرّ التحرير — لا يغطّي البنر نفسه */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed bg-sunken/50 py-2 ps-4 pe-2">
        <p className="flex items-center gap-2 text-meta text-muted-foreground">
          <ShieldCheckIcon className="size-4 text-primary" />
          {banners.length
            ? `${banners.filter((b) => b.active).length} من ${banners.length} بنرات مفعّلة`
            : 'لا بنرات بعد — تظهر أرضيات مؤقتة'}
          <span className="text-caption text-tertiary">· للمشرف فقط</span>
        </p>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="bg-card">
          <PencilIcon />
          إدارة البنرات
        </Button>
      </div>
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
