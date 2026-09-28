/**
 * صفحات قيد الإعداد — كل صفحة تشرح ما ستقدّمه بسطر أو سطرين وثلاث نقاط، بلا وعود بتفاصيل
 * لم تُقرَّر بعد. حين تُبنى الأداة يُحذف مدخلها هنا وتُضاف صفحتها الحقيقية.
 */
export const COMING_SOON = {
  blog: {
    path: '/blog',
    title: 'المدونة',
    lead: 'مقالات عن الخط العربي وتصميم الحروف وقصص المصمّمين والمسابك.',
    points: [],
  },
} as const;

export type ComingSoonKey = keyof typeof COMING_SOON;
