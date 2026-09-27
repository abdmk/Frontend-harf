'use client';

import { Button } from '@/components/ui/button';

/** لا تُعرض تفاصيل الخطأ للمستخدم — تُسجَّل على الخادم فقط */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="grid min-h-[60dvh] place-items-center px-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold">حدث خطأ غير متوقّع</h1>
        <p className="max-w-sm text-sm text-muted-foreground">لم نستطع عرض هذه الصفحة الآن. حاول مجدداً بعد لحظات.</p>
        <Button size="lg" className="mt-2" onClick={reset}>
          أعد المحاولة
        </Button>
      </div>
    </main>
  );
}
