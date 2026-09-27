import Link from 'next/link';

import { HarfMark } from '@/components/shared/harf-logo';
import { paths } from '@/config/paths';

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="flex animate-fade-up flex-col items-center gap-4">
        <HarfMark className="size-12 text-harf-500" />
        <h1 className="text-2xl font-semibold">الصفحة غير موجودة</h1>
        <p className="max-w-sm text-sm text-muted-foreground">ربما نُقل الخط أو تغيّر الرابط. جرّب البحث في المكتبة.</p>
        <Link
          href={paths.home.getHref()}
          className="mt-2 inline-flex h-11 items-center rounded-sm bg-primary px-6 text-sm font-medium text-white hover:bg-harf-600"
        >
          العودة إلى المكتبة
        </Link>
      </div>
    </main>
  );
}
