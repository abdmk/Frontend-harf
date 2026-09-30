/* بيانات تجريبية — تأتي لاحقاً من الخادم */
import type { Notification } from '@/types/domain/notification';

const MIN = 60_000;

/** الأوقات نسبية إلى لحظة الطلب كي تبقى «قبل 20 دقيقة» صحيحة في العرض التجريبي */
export function mockNotifications(now: number): Notification[] {
  const ago = (minutes: number) => new Date(now - minutes * MIN).toISOString();
  return [
    {
      id: 'n1',
      kind: 'approved',
      text: 'تمّت الموافقة على خط طفولة ونُشر في المكتبة',
      strong: 'خط طفولة',
      at: ago(20),
      unread: true,
      href: '/studio',
    },
    {
      id: 'n2',
      kind: 'download',
      text: '34 تحميلاً جديداً على خطوطك هذا اليوم',
      strong: '34 تحميلاً',
      at: ago(120),
      unread: true,
      href: '/studio',
    },
    {
      id: 'n3',
      kind: 'follow',
      text: 'سارة نبيل بدأت متابعتك',
      strong: 'سارة نبيل',
      at: ago(26 * 60),
      unread: false,
      href: '/designers/sn',
    },
    {
      id: 'n4',
      kind: 'ai',
      text: 'اقتراح ذكي: خطّك تجاريب يناسب تصنيف «واجهات» أيضاً',
      strong: 'تجاريب',
      at: ago(3 * 24 * 60),
      unread: false,
      href: '/fonts/tajarib',
    },
    {
      id: 'n5',
      kind: 'receipt',
      text: 'إيصال طلبك HRF-24918 وملف الترخيص جاهزان',
      strong: 'HRF-24918',
      at: ago(12 * 24 * 60),
      unread: false,
      href: '/account/purchases',
    },
  ];
}
