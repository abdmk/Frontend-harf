import { MOCK_DESIGNERS } from '@/mocks/designers';
import { MOCK_FOUNDRY, MOCK_STUDIO_ANALYTICS, MOCK_STUDIO_FONTS } from '@/mocks/studio';
import type { StudioFont } from '@/types/domain/foundry';
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

/** أرقام الاستوديو الإجمالية — تُحسب من خطوطه (لا أرقام منفصلة قد تتناقض) */
export function studioTotals(fonts: StudioFont[]) {
  const published = fonts.filter((f) => f.status === 'published');
  const rated = published.filter((f) => f.rating);
  const ratingCount = rated.reduce((n, f) => n + f.rating!.count, 0);
  return {
    published: published.length,
    free: published.filter((f) => f.type === 'free').length,
    paid: published.filter((f) => f.type === 'paid').length,
    downloads: published.reduce((n, f) => n + f.downloads, 0),
    visits: published.reduce((n, f) => n + f.visits, 0),
    favorites: published.reduce((n, f) => n + f.favorites, 0),
    rating: ratingCount
      ? { value: rated.reduce((n, f) => n + f.rating!.value * f.rating!.count, 0) / ratingCount, count: ratingCount }
      : null,
    /** خطوط تحتاج انتباهك: مرفوض أو مسودّة */
    attention: fonts.filter((f) => f.status === 'rejected' || f.status === 'draft'),
    hasPaid: fonts.some((f) => f.type === 'paid'),
  };
}
