import { useMemo } from 'react';

import {
  decideVerification,
  getVerification,
  useAllVerifications,
  type VerificationRecord,
} from '@/lib/studio-verification';

import { logAdmin } from './audit';
import { adminOrNull, type AdminResult, DENIED } from './guard';

/**
 * توثيق الاستوديوهات من جهة الإدارة. كل قرار يتحقّق من الدور ويُسجَّل باسم الاستوديو فقط —
 * لا اسم قانوني ولا أرقام في السجلّ.
 * ⚠️ عرض: في المنتج يُسجَّل أيضاً كل فتح لوثائق الهوية، وتُعرض عبر روابط موقّعة قصيرة العمر.
 */
export function approveStudio(userId: string): AdminResult {
  const admin = adminOrNull();
  if (!admin) return DENIED;
  const r = decideVerification(userId, 'approved');
  if (r.ok) logAdmin(admin.name, 'اعتماد استوديو', studioLabel(userId));
  return r;
}

export function rejectStudio(userId: string, reason: string): AdminResult {
  const admin = adminOrNull();
  if (!admin) return DENIED;
  const r = decideVerification(userId, 'rejected', reason);
  if (r.ok) logAdmin(admin.name, 'رفض توثيق استوديو', studioLabel(userId));
  return r;
}

/** فتح وثائق الهوية حدث حسّاس — يُسجَّل */
export function logDocsViewed(userId: string) {
  const admin = adminOrNull();
  if (admin) logAdmin(admin.name, 'اطّلاع على وثائق توثيق', studioLabel(userId));
}

const studioLabel = (id: string) => getVerification(id).info.studioName ?? id;

/** الطلبات المُرسلة (لا المسودّات): بانتظار المراجعة أولاً، الأقدم قبل الأحدث */
export function useStudioRequests(): VerificationRecord[] {
  const all = useAllVerifications();
  return useMemo(() => {
    return Object.values(all)
      .filter((r) => r.status !== 'draft' && r.submittedAt)
      .sort((a, b) =>
        a.status === 'pending' && b.status !== 'pending'
          ? -1
          : b.status === 'pending' && a.status !== 'pending'
            ? 1
            : a.status === 'pending'
              ? a.submittedAt!.localeCompare(b.submittedAt!)
              : (b.decidedAt ?? '').localeCompare(a.decidedAt ?? ''),
      );
  }, [all]);
}

export function usePendingStudios(): number {
  return useStudioRequests().filter((r) => r.status === 'pending').length;
}
