import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router';

import { PageMeta } from '@/components/shared/page-meta';
import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';

/** فشل تحميل حزمة صفحة — غالباً لأن نشراً جديداً حذف الحزمة القديمة والتبويب ما زال على النسخة السابقة */
const isChunkError = (e: unknown) =>
  e instanceof Error &&
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
    e.message,
  );

const RELOAD_KEY = 'harf_chunk_reload';

/** إعادة تحميل واحدة تجلب النسخة الجديدة — لا أكثر من مرّة كل دقيقة، فلا حلقة إعادة تحميل */
function reloadOnceForNewVersion(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - last < 60_000) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

/** واجهة الخطأ — بين ترويسة الموقع وتذييله، بإعادة محاولة وطريق للمكتبة */
export function ErrorView({ onRetry }: { onRetry?: () => void }) {
  return (
    <main id="main" className="grid min-h-[60dvh] place-items-center px-6 text-center">
      <PageMeta title="حدث خطأ غير متوقّع" noindex />
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold">حدث خطأ غير متوقّع</h1>
        <p className="max-w-sm text-sm text-muted-foreground">لم نستطع عرض هذه الصفحة الآن. حاول مجدداً بعد لحظات.</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={onRetry ?? (() => window.location.reload())}>
            أعد المحاولة
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link to={paths.home.getHref()}>العودة إلى المكتبة</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

/**
 * حاجز أخطاء العرض — التطبيق يستعمل <BrowserRouter> و<Routes>، وفيهما لا يعمل errorElement،
 * فبدون هذا الحاجز يصير أيّ خطأ في صفحة شاشةً بيضاء كاملة.
 * resetKey: يتغيّر بتغيّر الصفحة فيزول الخطأ عند الانتقال. فشل تحميل حزمة بعد نشر جديد يُعاد تحميله تلقائياً مرّة.
 */
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { error: unknown }> {
  state = { error: null as unknown };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    if (isChunkError(error) && reloadOnceForNewVersion()) return;
    // بلا تفاصيل للمستخدم؛ للمطوّر في الـConsole فقط
    console.error(error, info.componentStack);
  }

  componentDidUpdate(prev: { resetKey?: string }) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    return this.state.error ? <ErrorView onRetry={() => this.setState({ error: null })} /> : this.props.children;
  }
}
