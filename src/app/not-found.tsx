import Link from 'next/link';

import { HarfMark } from '@/components/shared/harf-logo';
import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="flex animate-fade-up flex-col items-center gap-4">
        <HarfMark className="size-12 text-harf-500" />
        <h1 className="text-2xl font-semibold">الصفحة غير موجودة</h1>
        <p className="max-w-sm text-sm text-muted-foreground">ربما نُقل الخط أو تغيّر الرابط. جرّب البحث في المكتبة.</p>
        <Button asChild size="lg" className="mt-2">
          <Link href={paths.home.getHref()}>العودة إلى المكتبة</Link>
        </Button>
      </div>
    </main>
  );
}
