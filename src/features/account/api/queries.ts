import 'server-only';

import { MOCK_LIBRARY, MOCK_PURCHASES } from '@/mocks/purchases';
import type { User } from '@/types/domain/user';

/** مشتريات المستخدم ومكتبته — تجريبية لكل الحسابات، لاحقاً من قاعدة البيانات حسب user.id */
export async function getPurchases(user: User) {
  void user;
  return MOCK_PURCHASES;
}

export async function getLibraryIds(user: User) {
  void user;
  return MOCK_LIBRARY;
}

export async function getOwnedLicense(user: User | null, fontId: string) {
  if (!user) return null;
  return MOCK_PURCHASES.find((p) => p.fontId === fontId) ?? null;
}
