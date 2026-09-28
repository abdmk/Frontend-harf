import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router';

/**
 * صفحة جديدة تبدأ من أعلاها. لا يتدخّل عند تغيّر معاملات الرابط فقط (فلاتر المكتبة)،
 * ولا عند الرجوع/التقدّم بالمتصفّح (POP) حتى يعيد المتصفّح موضع التمرير السابق.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  const type = useNavigationType();
  useLayoutEffect(() => {
    if (type !== 'POP') window.scrollTo(0, 0);
  }, [pathname, type]);
  return null;
}
