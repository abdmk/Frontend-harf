import { MOCK_FOUNDRY, MOCK_STUDIO_ANALYTICS, MOCK_STUDIO_FONTS } from '@/mocks/studio';
import type { User } from '@/types/domain/user';

/** بيانات الاستوديو — تجريبية اليوم، ومن قاعدة البيانات حسب مالك المسبك لاحقاً */
export function getStudio(user: User) {
  void user;
  return { foundry: MOCK_FOUNDRY, fonts: MOCK_STUDIO_FONTS, analytics: MOCK_STUDIO_ANALYTICS };
}

export function getFoundry(id: string) {
  return id === MOCK_FOUNDRY.id
    ? { foundry: MOCK_FOUNDRY, fonts: MOCK_STUDIO_FONTS.filter((f) => f.status === 'published') }
    : null;
}
