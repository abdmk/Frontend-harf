/** الدول المتاحة للناشرين — العربية أولاً ثم ما يكثر منه الناشرون. الرمز ISO 3166-1 alpha-2. */
export const COUNTRIES = [
  { code: 'IQ', name: 'العراق' },
  { code: 'SA', name: 'السعودية' },
  { code: 'AE', name: 'الإمارات' },
  { code: 'KW', name: 'الكويت' },
  { code: 'QA', name: 'قطر' },
  { code: 'BH', name: 'البحرين' },
  { code: 'OM', name: 'عُمان' },
  { code: 'JO', name: 'الأردن' },
  { code: 'LB', name: 'لبنان' },
  { code: 'SY', name: 'سوريا' },
  { code: 'PS', name: 'فلسطين' },
  { code: 'EG', name: 'مصر' },
  { code: 'LY', name: 'ليبيا' },
  { code: 'TN', name: 'تونس' },
  { code: 'DZ', name: 'الجزائر' },
  { code: 'MA', name: 'المغرب' },
  { code: 'SD', name: 'السودان' },
  { code: 'YE', name: 'اليمن' },
  { code: 'TR', name: 'تركيا' },
  { code: 'IR', name: 'إيران' },
  { code: 'GB', name: 'المملكة المتحدة' },
  { code: 'DE', name: 'ألمانيا' },
  { code: 'US', name: 'الولايات المتحدة' },
  { code: 'CA', name: 'كندا' },
] as const;

export const countryName = (code: string) => COUNTRIES.find((c) => c.code === code)?.name ?? code;
