export type { Plan, User } from '@/types/domain/user';

export const ACCOUNT_SECTIONS = [
  'profile',
  'library',
  'favorites',
  'purchases',
  'usage',
  'subscription',
  'foundry',
  'preferences',
  'security',
  'help',
] as const;
export type AccountSection = (typeof ACCOUNT_SECTIONS)[number];
