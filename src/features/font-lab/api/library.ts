import { MOCK_FONTS } from '@/mocks/fonts';

/** خطوط مجانية من مكتبة حرف بحزمها الكاملة (OFL) — لتجربة المختبر بلا ملفات */
export function libraryStarters(limit = 6) {
  const pick = ['cairo', 'amiri', 'readex', 'markazi', 'noto-naskh', 'alexandria'];
  return pick
    .map((id) => MOCK_FONTS.find((f) => f.id === id))
    .filter((f): f is NonNullable<typeof f> => !!f?.download && !!f.face)
    .slice(0, limit);
}

export function libraryPackage(id: string) {
  const f = MOCK_FONTS.find((x) => x.id === id && x.type === 'free' && x.download);
  return f ? { id: f.id, name: f.name, url: f.download!.url } : null;
}
