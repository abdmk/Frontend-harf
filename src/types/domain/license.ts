/**
 * الترخيص: ماذا يشتري المستخدم (الحزمة) وأين سيستعمل الخط (الاستخدامات).
 * القيم والأسعار الفعلية تأتي من الخادم — هذه أنواع فقط.
 */
export const LICENSE_PACKAGES = ['family', 'single'] as const;
export type LicensePackage = (typeof LICENSE_PACKAGES)[number];

export const LICENSE_USES = ['desktop', 'web', 'app'] as const;
export type LicenseUse = (typeof LICENSE_USES)[number];

/** مستوى ضمن استخدام (مثل «حتى 5 أجهزة») */
export type UsageTier = {
  id: string;
  label: string;
  /** سنتات تُضاف للسعر الأساسي */
  addCents: number;
};

/** جدول تسعير خط — يرسله الخادم للعرض، ويعيد الحساب منه عند الإضافة والدفع */
export type LicensePricing = {
  fontId: string;
  currency: 'USD';
  familyCents: number;
  singleCents: number;
  /** سعر العائلة قبل الخصم (للعرض فقط) */
  compareAtFamilyCents?: number;
  weights: { id: string; nameAr: string; nameEn: string; value: number }[];
  uses: Record<LicenseUse, UsageTier[]>;
};

/** ما يختاره المستخدم — هذا وحده يُخزَّن في السلة، لا السعر */
export type LicenseSelection = {
  fontId: string;
  package: LicensePackage;
  /** للوزن الواحد فقط */
  weightId?: string;
  /** لكل استخدام مختار: معرّف المستوى */
  uses: Partial<Record<LicenseUse, string>>;
};

/** حالة الخط بالنسبة للمستخدم الحالي في صندوق السعر */
export type OwnershipState = 'none' | 'owned' | 'included';
