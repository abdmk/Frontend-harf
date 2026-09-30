import type { ConsentCategory } from '@/lib/consent';

/**
 * الأدوات غير الضرورية المفعّلة في الموقع (تحليلات، تسويق). اليوم لا شيء — لذلك لا يظهر شريط
 * الموافقة. عند إضافة أداة: سجّلها هنا، ولا تُحمَّل إلا بعد `hasConsent(category)`.
 */
export const NON_ESSENTIAL_TOOLS: readonly { name: string; category: ConsentCategory }[] = [];
