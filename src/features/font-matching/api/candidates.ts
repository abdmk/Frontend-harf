import { MOCK_FONTS } from '@/mocks/fonts';
import type { Font, LiveFace } from '@/types/domain/font';

export type Candidate = Font & { face: LiveFace };

/**
 * الخطوط التي يمكن مقارنتها: خطوط المكتبة ذات الملفات الحقيقية (face). اليوم من البيانات
 * التجريبية؛ محرّك خادم لاحقاً يستبدل هذه الطبقة و`useMatcher` دون تغيير الواجهة.
 */
export function getCandidates({ includePaid }: { includePaid: boolean }): Candidate[] {
  return MOCK_FONTS.filter((f): f is Candidate => !!f.face && (includePaid || f.type === 'free'));
}

export function countCandidates() {
  return MOCK_FONTS.filter((f) => f.face).length;
}
