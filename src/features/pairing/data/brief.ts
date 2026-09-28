import type { LangSetKey, TierKey, UseCaseKey } from './catalog';

/** ما يطلبه المستخدم من «نسق» */
export type Brief = { useCase: UseCaseKey; lang: LangSetKey; tier: TierKey; fonts: 2 | 3 };
export type View = 'suggest' | 'saved';
export const DEFAULT_BRIEF: Brief = { useCase: 'identity', lang: 'ar', tier: 'all', fonts: 2 };

export const LANG_LABEL: Record<LangSetKey, string> = {
  ar: 'العربية',
  'ar-en': 'عربي + إنجليزي',
  'ar-ku': 'عربي + كردي',
};
export const TIER_LABEL: Record<TierKey, string> = { all: 'الكل', free: 'مجانية', paid: 'مدفوعة' };
export const FONTS_LABEL = { 2: 'خطّان', 3: 'ثلاثة خطوط' } as const;
