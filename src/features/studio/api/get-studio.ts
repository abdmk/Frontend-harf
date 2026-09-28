import { MOCK_DESIGNERS } from '@/mocks/designers';
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

/** ملف مصمّم عام — ومسبكه إن كان ينشر مع مسبك */
export function getDesigner(id: string) {
  const designer = MOCK_DESIGNERS.find((d) => d.id === id);
  if (!designer) return null;
  const foundry = designer.foundryId === MOCK_FOUNDRY.id ? MOCK_FOUNDRY : null;
  return { designer, foundry };
}

/** مصمّمو المسبك — من يعملون معه */
export function getFoundryDesigners(foundryId: string) {
  return MOCK_DESIGNERS.filter((d) => d.foundryId === foundryId);
}
