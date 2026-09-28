import type { DateRange, LicenseFilter } from '../types/catalog-query';

export const LICENSE_FILTER_LABEL: Record<LicenseFilter, string> = {
  all: 'الكل',
  personal: 'شخصي',
  commercial: 'تجاري',
  paid: 'مدفوع',
};
export const DATE_LABEL: Record<DateRange, string> = {
  all: 'الكل',
  '7': 'آخر 7 أيام',
  '30': 'آخر 30 يوماً',
  '180': 'آخر 6 أشهر',
  year: 'هذه السنة',
};
