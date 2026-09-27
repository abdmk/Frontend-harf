'use client';

/** لا تُعرض تفاصيل الخطأ للمستخدم — تُسجَّل على الخادم فقط */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="grid min-h-[60dvh] place-items-center px-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold">حدث خطأ غير متوقّع</h1>
        <p className="max-w-sm text-sm text-muted-foreground">لم نستطع عرض هذه الصفحة الآن. حاول مجدداً بعد لحظات.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-2 h-11 rounded-sm bg-primary px-6 text-sm font-medium text-white hover:bg-harf-600"
        >
          أعد المحاولة
        </button>
      </div>
    </main>
  );
}
