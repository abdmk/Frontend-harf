import { type ReactNode, Suspense } from 'react';
import { useLocation } from 'react-router';

import { LoadingState } from '@/components/shared/loading-state';

import { ErrorBoundary } from '../error';

/**
 * منطقة الصفحة بين الترويسة والتذييل:
 * - ارتفاعها لا يقلّ عن الشاشة ناقص الترويسة، فلا يصعد التذييل إلى منتصف الشاشة ثم يهبط
 *   (صفحة قصيرة، أو صفحة ما زالت تُحمَّل) — ولا يتغيّر ارتفاع المستند فجأة.
 * - Suspense واحد هنا (لا حول كل صفحة): التنقّل داخل الموقع انتقال (transition)، فتبقى الصفحة
 *   الحالية ظاهرة حتى تصل حزمة الصفحة الجديدة ثم تُستبدل مرّة واحدة — بلا هيكل تحميل يقفز.
 *   الهيكل يظهر فقط عند فتح صفحة كسولة مباشرة من الرابط.
 * - حاجز أخطاء: خطأ في صفحة لا يُسقط الترويسة والتذييل، ويزول بالانتقال لصفحة أخرى.
 * - يعيد تركيب المحتوى عند تغيّر الصفحة ليتلاشى دخولها بنعومة؛ أقسام الحساب تبقى صفحة واحدة.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const key = pathname.startsWith('/account') ? '/account' : pathname;
  return (
    <div className="flow-root min-h-[calc(100dvh-7rem)] lg:min-h-[calc(100dvh-4.5rem)]">
      <ErrorBoundary resetKey={pathname}>
        <Suspense fallback={<LoadingState className="container-page py-14" />}>
          <div key={key} className="animate-page-in">
            {children}
          </div>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
