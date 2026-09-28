import type { Category, Lang, LicenseType, Usage } from '@/types/domain/font';

export const LANG_LABEL: Record<Lang, string> = {
  ar: 'العربية',
  ku: 'الكردية',
  fa: 'الفارسية',
  ur: 'الأردية',
  la: 'اللاتينية',
};
export const LANG_SHORT: Record<Lang, string> = { ar: 'عربي', ku: 'كردي', fa: 'فارسي', ur: 'أردي', la: 'لاتيني' };
export const CATEGORY_LABEL: Record<Category, string> = {
  classic: 'كلاسيكية',
  headline: 'عناوين',
  text: 'نصوص',
  decorative: 'زخرفية',
  modern: 'حديثة',
};
export const TYPE_LABEL: Record<LicenseType, string> = { free: 'مجاني', trial: 'تجريبي', paid: 'مدفوع' };
export const USAGE_LABEL: Record<Usage, string> = { personal: 'شخصي', commercial: 'تجاري & شخصي' };
