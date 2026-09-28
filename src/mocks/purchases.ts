/* مشتريات تجريبية — تُستبدل بالطلبات المخزّنة بعد webhook الدفع */
import { cents, type Purchase } from '@/types/domain/commerce';

export const MOCK_PURCHASES: Purchase[] = [
  {
    licenseId: 'HRF-24918',
    orderId: 'ORD-24918',
    fontId: 'rawi',
    fontName: 'Rawi Text',
    summary: 'العائلة الكاملة · سطح المكتب حتى جهازين',
    date: '2026-09-12',
    amount: cents(42000),
  },
  {
    licenseId: 'HRF-23107',
    orderId: 'ORD-23107',
    fontId: 'thuluth',
    fontName: 'Thuluth Modern',
    summary: 'وزن عادي · موقع إلكتروني حتى 10 آلاف زيارة/شهر',
    date: '2026-08-03',
    amount: cents(6400),
  },
];

/** الخطوط في «مكتبتي»: ما حمّله المستخدم أو اشتراه */
export const MOCK_LIBRARY = ['zaetoon', 'tajarib', 'kufa', 'rawi', 'thuluth', 'nuqta'];
