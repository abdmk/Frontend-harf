import { useMemo } from 'react';
import { z } from 'zod';

import { asObject, createJsonStore } from '@/lib/json-store';
import { isManuscriptFileId } from '@/lib/media-store';
import { MANUSCRIPT_CATEGORIES } from '@/types/domain/manuscript';

/**
 * طلبات المخطوطات: يرسلها الاستوديو من «رفع مخطوطة» وتقرّر فيها الإدارة من «الطلبات».
 * مشترك بين الجهتين (كتوثيق الاستوديوهات) — لا تستورد ميزة من أخرى.
 *
 * ⚠️ عرض: الطلبات والملفات في هذا المتصفّح فقط، فالمشرف يرى ما أُرسل منه. في المنتج تُحفظ على الخادم،
 * والخادم وحده يقرّر الحالة ويرسل الإشعار، والملف في تخزين خاصّ حتى القبول.
 */
export const SUBMISSION_STATUSES = ['pending', 'approved', 'changes', 'rejected'] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];
export type SubmissionDecision = Exclude<SubmissionStatus, 'pending'>;

export const SUBMISSION_STATUS_LABEL: Record<SubmissionStatus, string> = {
  pending: 'بانتظار المراجعة',
  approved: 'مقبولة ومنشورة',
  changes: 'طُلبت تعديلات',
  rejected: 'مرفوضة',
};

export const REFERENCE = /^MS-\d{4,6}$/;
/** حدّ الطلبات المعلّقة لكل استوديو — يمنع إغراق الطابور (يُفرض على الخادم في المنتج) */
export const MAX_PENDING_PER_USER = 20;
const MAX_STORED = 200;

const short = (n: number) => z.string().trim().max(n);

const submissionSchema = z.object({
  reference: z.string().regex(REFERENCE),
  userId: short(60),
  studioName: short(60),
  title: short(60).min(1),
  category: z.enum(MANUSCRIPT_CATEGORIES),
  fonts: z.array(z.object({ id: short(64), name: short(80) })).max(4),
  license: z.enum(['personal', 'commercial']),
  note: short(240),
  file: z.object({
    name: short(120),
    bytes: z.number().int().nonnegative(),
    width: z.number().positive(),
    height: z.number().positive(),
    /** ملفّ IndexedDB — يغيب عن الطلبات القديمة قبل حفظ الملفات */
    id: z.string().refine(isManuscriptFileId).optional(),
  }),
  status: z.enum(SUBMISSION_STATUSES),
  createdAt: short(40),
  decidedAt: short(40).optional(),
  reason: short(500).optional(),
  by: short(60).optional(),
});
export type ManuscriptSubmission = z.infer<typeof submissionSchema>;

const store = createJsonStore<ManuscriptSubmission[]>(
  'harf_manuscript_submissions',
  (raw) =>
    (Array.isArray(raw) ? raw : [])
      .slice(0, MAX_STORED)
      .map((x) => submissionSchema.safeParse(asObject(x)))
      .flatMap((r) => (r.success ? [r.data] : [])),
  [],
);

export const getSubmissions = store.get;
export const useSubmissions = store.use;
export const getSubmission = (reference: string) => store.get().find((s) => s.reference === reference);

/** يضيف طلباً جديداً في أول القائمة — false إن تعذّر الحفظ */
export function addSubmission(s: ManuscriptSubmission): boolean {
  return store.set([s, ...store.get()].slice(0, MAX_STORED));
}

/** يحدّث طلباً واحداً — للإدارة (القرار والتراجع) */
export function updateSubmission(
  reference: string,
  patch: Partial<Pick<ManuscriptSubmission, 'status' | 'decidedAt' | 'reason' | 'by'>>,
): boolean {
  const all = store.get();
  if (!all.some((s) => s.reference === reference)) return false;
  return store.set(all.map((s) => (s.reference === reference ? { ...s, ...patch } : s)));
}

export function newReference(): string {
  const taken = new Set(store.get().map((s) => s.reference));
  let ref = '';
  do ref = `MS-${Math.floor(1000 + Math.random() * 9000)}`;
  while (taken.has(ref));
  return ref;
}

/** طلبات صاحب الحساب، الأحدث أولاً */
export function useMySubmissions(userId: string | undefined): ManuscriptSubmission[] {
  const all = store.use();
  return useMemo(() => (userId ? all.filter((s) => s.userId === userId) : []), [all, userId]);
}

/** المقبولة — تُنشر في مكتبة المخطوطات */
export function useApprovedSubmissions(): ManuscriptSubmission[] {
  const all = store.use();
  return useMemo(() => all.filter((s) => s.status === 'approved' && s.file.id), [all]);
}
