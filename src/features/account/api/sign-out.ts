import { setDemoSession } from '@/lib/auth';

/**
 * تسجيل الخروج.
 * اليوم يضع الجلسة التجريبية على «خارج»؛ لاحقاً يُبطل الجلسة الحقيقية عبر الـAPI.
 * المكوّن الذي يستدعيها يتولّى التوجيه عبر navigate('/').
 */
export function signOut() {
  setDemoSession('out');
}
