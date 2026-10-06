import { publicFonts } from '@/stores/catalog-overrides';
import { MOCK_FONTS } from '@/testing/mocks/fonts';

/** ما يراه الزوّار فقط — المخفي والمحذوف من «مخزن الخطوط» خارج الأدوات أيضاً */
const visible = () => publicFonts(MOCK_FONTS);

/** خطوط مجانية من مكتبة حرف بحزمها الكاملة (OFL) — لتجربة المختبر بلا ملفات */
export function libraryStarters(limit = 6) {
  const pick = ['cairo', 'amiri', 'readex', 'markazi', 'noto-naskh', 'alexandria'];
  return pick
    .map((id) => visible().find((f) => f.id === id))
    .filter((f): f is NonNullable<typeof f> => !!f?.download && !!f.face)
    .slice(0, limit);
}

export function libraryPackage(id: string) {
  const f = visible().find((x) => x.id === id && x.type === 'free' && x.download);
  return f ? { id: f.id, name: f.name, url: f.download!.url } : null;
}
