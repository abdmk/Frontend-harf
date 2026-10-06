import { MOCK_FONTS } from '@/mocks/fonts';
import { publicFonts } from '@/stores/catalog-overrides';
import type { Font, LiveFace } from '@/types/domain/font';

/** ما يراه الزوّار فقط — المخفي والمحذوف من «مخزن الخطوط» خارج الأدوات أيضاً */
const visible = () => publicFonts(MOCK_FONTS);

export type Candidate = Font & { face: LiveFace };

/**
 * الخطوط التي يمكن مقارنتها: خطوط المكتبة ذات الملفات الحقيقية (face). اليوم من البيانات
 * التجريبية؛ محرّك خادم لاحقاً يستبدل هذه الطبقة و`useMatcher` دون تغيير الواجهة.
 */
export function getCandidates({ includePaid }: { includePaid: boolean }): Candidate[] {
  return visible().filter((f): f is Candidate => !!f.face && (includePaid || f.type === 'free'));
}

export function countCandidates() {
  return visible().filter((f) => f.face).length;
}
