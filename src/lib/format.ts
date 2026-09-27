/** عدد الأوزان بالعربية الصحيحة: وزن واحد، وزنان، 3–10 أوزان، 11+ وزناً */
export function weightsLabel(n: number): string {
  if (n === 1) return 'وزن واحد';
  if (n === 2) return 'وزنان';
  if (n <= 10) return `${n} أوزان`;
  return `${n} وزناً`;
}

const MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

/** تاريخ عربي ثابت لا يعتمد على لغة الخادم (يتجنّب اختلاف الترطيب) */
export function formatDateAr(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatBytesAr(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} م.ب`;
  return `${Math.max(1, Math.round(bytes / 1024))} ك.ب`;
}
