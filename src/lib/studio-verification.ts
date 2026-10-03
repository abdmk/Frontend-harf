import { useSyncExternalStore } from 'react';
import { z } from 'zod';

import { getCurrentUser, subscribeSession } from './auth';
import { asObject, createJsonStore } from './json-store';
import { isDocId } from './media-store';
import { maskedPayoutSchema, payoutMethodsFor } from './payout';

/**
 * توثيق الاستوديو واعتماده: قبل أوّل نشر يوقّع الناشر الاتفاقية، يرفع وثائق هويته، ويضيف وسيلة
 * استلام الأرباح؛ ثم تراجع الإدارة. لا خطوط مدفوعة ولا مبيعات قبل الاعتماد.
 *
 * ⚠️ عرض: كل ما هنا يُحفظ في المتصفّح للتجربة. في المنتج:
 * - الطلب والوثائق تُرسل إلى الخادم، والوثائق في تخزين خاصّ مشفّر لا يصل إليه إلا المشرف.
 * - الخادم وحده يقرّر الحالة؛ فحص «يستطيع البيع» يُعاد على الخادم عند كل نشر وكل عملية شراء.
 * - رقم الحساب الكامل لا يمرّ بهذا الملف — المقنّع فقط.
 */

/** حصّة حرف من كل عملية بيع (تشمل رسوم معالجة الدفع) — مصدر واحد للاتفاقية والحسابات */
export const PLATFORM_SHARE_PCT = 35;
/** إصدار الاتفاقية الموقّعة — يُحفظ مع التوقيع؛ تغيير الشروط يتطلّب توقيعاً جديداً */
export const AGREEMENT_VERSION = '2026.10';

export const ENTITIES = ['individual', 'company'] as const;
export const DOC_TYPES = ['national_id', 'passport', 'residency'] as const;
export const ENTITY_LABEL = { individual: 'فرد (مصمّم مستقلّ)', company: 'شركة أو مسبك مسجّل' } as const;
export const DOC_TYPE_LABEL = {
  national_id: 'البطاقة الوطنية',
  passport: 'جواز السفر',
  residency: 'بطاقة الإقامة',
} as const;
export type DocType = (typeof DOC_TYPES)[number];
/** الجواز صفحة واحدة؛ البطاقات وجهان */
export const needsBack = (t: DocType) => t !== 'passport';

export type VerificationStatus = 'draft' | 'pending' | 'approved' | 'rejected';

const docId = z.string().refine(isDocId);

export const studioInfoSchema = z.object({
  legalName: z.string().trim().min(5, 'الاسم الكامل كما في الوثيقة الرسمية (رباعي أو ثلاثي).').max(80),
  studioName: z.string().trim().min(2, 'اسم الاستوديو مطلوب.').max(60),
  entity: z.enum(ENTITIES),
  companyName: z.string().trim().max(80),
  country: z.string().regex(/^[A-Z]{2}$/, 'اختر الدولة.'),
  city: z.string().trim().min(2, 'المدينة مطلوبة.').max(40),
});

const recordSchema = z.object({
  userId: z.string().regex(/^u[-a-z0-9]{1,40}$/),
  status: z.enum(['draft', 'pending', 'approved', 'rejected']),
  info: studioInfoSchema.partial().default({}),
  docType: z.enum(DOC_TYPES).default('national_id'),
  docs: z.object({ front: docId.optional(), back: docId.optional(), company: docId.optional() }).default({}),
  payout: maskedPayoutSchema.extend({ verifiedAt: z.string().max(40) }).optional(),
  agreement: z
    .object({
      version: z.string().max(20),
      signedAt: z.string().max(40),
      signer: z.string().max(80),
      signature: docId,
    })
    .optional(),
  submittedAt: z.string().max(40).optional(),
  decidedAt: z.string().max(40).optional(),
  reason: z.string().max(400).optional(),
  updatedAt: z.string().max(40),
});
export type VerificationRecord = z.infer<typeof recordSchema>;

/** ما ينقص قبل الإرسال — قائمة واحدة تعتمدها شاشة المراجعة وتحقّق الإرسال */
export type Missing = 'info' | 'docs' | 'payout' | 'agreement';
export const MISSING_LABEL: Record<Missing, string> = {
  info: 'بيانات الاستوديو',
  docs: 'وثائق الهوية',
  payout: 'وسيلة استلام الأرباح',
  agreement: 'توقيع الاتفاقية',
};
export function missingOf(r: VerificationRecord): Missing[] {
  const out: Missing[] = [];
  const info = studioInfoSchema.safeParse(r.info);
  if (!info.success || (info.data.entity === 'company' && info.data.companyName.length < 2)) out.push('info');
  const companyDoc = r.info.entity === 'company' ? !!r.docs.company : true;
  if (!r.docs.front || (needsBack(r.docType) && !r.docs.back) || !companyDoc) out.push('docs');
  // كي كارد للعراق فقط — من غيّر دولته بعد إضافتها يُطلب منه حساب بنكي (يُعاد الفحص على الخادم)
  if (!r.payout || !payoutMethodsFor(r.info.country).includes(r.payout.method)) out.push('payout');
  if (!r.agreement || r.agreement.version !== AGREEMENT_VERSION) out.push('agreement');
  return out;
}

/* ── التخزين ──────────────────────────────────────────────────────────────── */

const now = () => new Date().toISOString();

/** طلبات تجريبية للإدارة + الاستوديو التجريبي القائم (معتمد سلفاً — لديه مبيعات) */
const SEED: Record<string, VerificationRecord> = {
  'u-abdmk': {
    userId: 'u-abdmk',
    status: 'approved',
    info: {
      legalName: 'عبدالملك جاسم محمد',
      studioName: 'مسبك تجاريب',
      entity: 'company',
      companyName: 'مسبك تجاريب للتصميم',
      country: 'IQ',
      city: 'بغداد',
    },
    docType: 'national_id',
    docs: {},
    payout: { method: 'bank', holder: 'مسبك تجاريب', last4: '4471', country: 'IQ', verifiedAt: '2025-08-02T10:00:00Z' },
    agreement: {
      version: AGREEMENT_VERSION,
      signedAt: '2025-08-02T10:04:00Z',
      signer: 'عبدالملك جاسم محمد',
      signature: 'd-seedsign1',
    },
    submittedAt: '2025-08-02T10:05:00Z',
    decidedAt: '2025-08-03T09:12:00Z',
    updatedAt: '2025-08-03T09:12:00Z',
  },
  'u-seed-noor': {
    userId: 'u-seed-noor',
    status: 'pending',
    info: {
      legalName: 'نور الهدى سالم كاظم',
      studioName: 'استوديو نون',
      entity: 'individual',
      companyName: '',
      country: 'IQ',
      city: 'البصرة',
    },
    docType: 'national_id',
    docs: { front: 'd-seednoorf', back: 'd-seednoorb' },
    payout: {
      method: 'qicard',
      holder: 'نور الهدى سالم',
      last4: '4410',
      country: 'IQ',
      verifiedAt: '2026-09-29T08:20:00Z',
    },
    agreement: {
      version: AGREEMENT_VERSION,
      signedAt: '2026-09-29T08:24:00Z',
      signer: 'نور الهدى سالم كاظم',
      signature: 'd-seednoors',
    },
    submittedAt: '2026-09-29T08:25:00Z',
    updatedAt: '2026-09-29T08:25:00Z',
  },
  'u-seed-rana': {
    userId: 'u-seed-rana',
    status: 'pending',
    info: {
      legalName: 'رنا طارق عبدالله',
      studioName: 'Raqam Type',
      entity: 'company',
      companyName: 'رقم للتصميم المحدودة',
      country: 'JO',
      city: 'عمّان',
    },
    docType: 'passport',
    docs: { front: 'd-seedranaf', company: 'd-seedranac' },
    payout: {
      method: 'bank',
      holder: 'Raqam Design LLC',
      last4: '0193',
      country: 'JO',
      verifiedAt: '2026-09-30T13:02:00Z',
    },
    agreement: {
      version: AGREEMENT_VERSION,
      signedAt: '2026-09-30T13:06:00Z',
      signer: 'رنا طارق عبدالله',
      signature: 'd-seedranas',
    },
    submittedAt: '2026-09-30T13:07:00Z',
    updatedAt: '2026-09-30T13:07:00Z',
  },
};

type Stored = Record<string, VerificationRecord>;
const store = createJsonStore<Stored>(
  'harf_studio_verification',
  (x) => {
    const out: Stored = { ...SEED };
    for (const [id, r] of Object.entries(asObject(x)).slice(0, 500)) {
      const p = recordSchema.safeParse(r);
      if (p.success && p.data.userId === id) out[id] = p.data;
    }
    return out;
  },
  SEED,
);

const blank = (userId: string): VerificationRecord => ({
  userId,
  status: 'draft',
  info: {},
  docType: 'national_id',
  docs: {},
  updatedAt: now(),
});

function write(r: VerificationRecord): boolean {
  const all = { ...store.get() };
  // البذور لا تُكتب إلا إن تغيّرت — يبقى المخزَّن صغيراً
  all[r.userId] = r;
  const persisted = Object.fromEntries(Object.entries(all).filter(([id, v]) => SEED[id] !== v));
  return store.set(persisted as Stored);
}

/** سجلّ المستخدم (أو مسودّة فارغة لم تُحفظ بعد) */
export function getVerification(userId: string): VerificationRecord {
  return store.get()[userId] ?? blank(userId);
}

/** الحالة كما تراها الواجهة: «none» لمن لم يبدأ بعد */
export type PublicStatus = VerificationStatus | 'none';
export function statusOf(userId: string): PublicStatus {
  return store.get()[userId]?.status ?? 'none';
}

/** يستطيع نشر خطوط مدفوعة واستقبال المبيعات — بعد اعتماد الإدارة فقط */
export function canSell(userId: string | undefined): boolean {
  return !!userId && statusOf(userId) === 'approved';
}

const subscribe = (fn: () => void) => {
  const a = store.subscribe(fn);
  const b = subscribeSession(fn);
  return () => {
    a();
    b();
  };
};

/** سجلّ المستخدم الحالي — يتحدّث مع أي حفظ أو قرار للإدارة */
let mine: { key: string; value: VerificationRecord | null } = { key: '', value: null };
function getMine(): VerificationRecord | null {
  const user = getCurrentUser();
  if (!user) return null;
  const rec = store.get()[user.id];
  const key = `${user.id}|${rec?.updatedAt ?? 'none'}|${rec?.status ?? ''}`;
  if (key !== mine.key) mine = { key, value: rec ?? null };
  return mine.value;
}
export function useMyVerification(): VerificationRecord | null {
  return useSyncExternalStore(subscribe, getMine, () => null);
}

export function useAllVerifications(): Stored {
  return useSyncExternalStore(store.subscribe, store.get, () => SEED);
}

/* ── إجراءات الناشر ───────────────────────────────────────────────────────── */

export type Result = { ok: true } | { ok: false; error: string };
const FULL = { ok: false, error: 'تعذّر الحفظ — مساحة التخزين ممتلئة.' } as const;

function editable(): VerificationRecord | { error: string } {
  const user = getCurrentUser();
  if (!user || user.plan !== 'studio') return { error: 'التوثيق لحسابات الاستوديو.' };
  const r = getVerification(user.id);
  if (r.status === 'pending') return { error: 'طلبك قيد المراجعة — لا يمكن تعديله الآن.' };
  if (r.status === 'approved') return { error: 'استوديوك موثّق. لتغيير البيانات تواصل مع الدعم.' };
  return r;
}

/** حفظ جزء من المسودّة بعد التحقّق منه — يُستدعى عند الانتقال بين الخطوات */
export function saveVerificationDraft(patch: {
  info?: unknown;
  docType?: unknown;
  docs?: unknown;
  payout?: unknown;
  agreement?: unknown;
}): Result {
  const r = editable();
  if ('error' in r) return { ok: false, error: r.error };
  const next = recordSchema.safeParse({
    ...r,
    ...patch,
    // تعديل طلب مرفوض يعيده مسودّة؛ سبب الرفض يبقى ظاهراً حتى الإرسال التالي
    status: 'draft',
    updatedAt: now(),
  });
  if (!next.success) return { ok: false, error: 'بيانات غير صالحة.' };
  return write(next.data) ? { ok: true } : FULL;
}

export function submitVerification(): Result {
  const r = editable();
  if ('error' in r) return { ok: false, error: r.error };
  const missing = missingOf(r);
  if (missing.length) return { ok: false, error: `أكمل أولاً: ${missing.map((m) => MISSING_LABEL[m]).join('، ')}.` };
  return write({
    ...r,
    status: 'pending',
    submittedAt: now(),
    decidedAt: undefined,
    reason: undefined,
    updatedAt: now(),
  })
    ? { ok: true }
    : FULL;
}

/* ── قرار الإدارة — يُستدعى من features/admin بعد التحقّق من الدور ─────────── */

export function decideVerification(userId: string, decision: 'approved' | 'rejected', reason?: string): Result {
  const r = store.get()[userId];
  if (!r || r.status !== 'pending') return { ok: false, error: 'الطلب ليس بانتظار المراجعة.' };
  const why = reason?.trim() ?? '';
  if (decision === 'rejected' && why.length < 10)
    return { ok: false, error: 'اكتب سبباً واضحاً (10 أحرف على الأقل) ليعرف الناشر ما يصلحه.' };
  return write({
    ...r,
    status: decision,
    decidedAt: now(),
    reason: decision === 'rejected' ? why.slice(0, 400) : undefined,
    updatedAt: now(),
  })
    ? { ok: true }
    : FULL;
}
