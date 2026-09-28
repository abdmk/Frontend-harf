import type { ReactNode } from 'react';
import { useLocation } from 'react-router';

/** يعيد تركيب المحتوى عند تغيّر الصفحة ليتلاشى دخولها بنعومة؛ أقسام الحساب تبقى صفحة واحدة */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const key = pathname.startsWith('/account') ? '/account' : pathname;
  return (
    <div key={key} className="animate-page-in">
      {children}
    </div>
  );
}
