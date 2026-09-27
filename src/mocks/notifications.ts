/* بيانات تجريبية — تأتي لاحقاً من الخادم */
import type { Notification } from '@/types/domain/notification';

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    kind: 'ok',
    text: 'تمّت الموافقة على خطّك «تجاريب» ونُشر في المكتبة',
    when: 'قبل 20 دقيقة',
    unread: true,
  },
  { id: 'n2', kind: 'download', text: '34 تحميلاً جديداً على خطوطك اليوم', when: 'قبل ساعتين', unread: true },
  { id: 'n3', kind: 'receipt', text: 'إيصال طلبك HRF-24918 وملف الترخيص جاهزان', when: 'أمس', unread: false },
];
