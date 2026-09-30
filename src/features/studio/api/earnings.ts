import { useSyncExternalStore } from 'react';
import { z } from 'zod';

import { requireStudio } from '@/lib/auth';
import { createLocalStoreSignal } from '@/lib/local-store-signal';
import { MOCK_PAYOUTS, MOCK_SALES, MOCK_STUDIO_ANALYTICS, type MockPayout, type MockSale } from '@/mocks/studio';

import { netOf, PUBLISHER_TERMS } from '../config/publisher-terms';

/*
 * أرباح الناشر وسحبها. ⚠️ عرض: في الإنتاج كل ما هنا طلبات للخادم — هو وحده يحسب الرصيد من
 * قيود المبيعات، ويتحقّق من الدور والمبلغ، ويرسل تأكيد البريد لتغيير الحساب، ويسجّل كل عملية.
 * لا يُخزَّن رقم الحساب البنكي كاملاً في المتصفّح أبداً — آخر 4 أرقام فقط للعرض.
 */

export type Sale = MockSale & { feeCents: number; netCents: number };
export type Payout = MockPayout & { last4: string };
export type PayoutAccount = { holder: string; last4: string; country: string; changedAt?: string };

export function getSales(): Sale[] {
  return MOCK_SALES.map((s) => {
    const { fee, net } = netOf(s.grossCents);
    return { ...s, feeCents: fee, netCents: net };
  });
}

/* ── ما يضيفه الناشر في هذه الجلسة (طلبات سحب، تغيير الحساب) ─────────────── */

type Local = { requests: MockPayout[]; account?: PayoutAccount };
const KEY = 'harf_payouts';
const signal = createLocalStoreSignal();
let cache: { raw: string | null; value: Local } = { raw: null, value: { requests: [] } };

function readLocal(): Local {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return cache.value;
  }
  if (raw === cache.raw) return cache.value;
  const value: Local = { requests: [] };
  try {
    const x = JSON.parse(raw ?? '{}') as { requests?: unknown; account?: unknown };
    if (Array.isArray(x.requests))
      value.requests = x.requests
        .filter(
          (r): r is MockPayout =>
            !!r &&
            typeof (r as MockPayout).id === 'string' &&
            typeof (r as MockPayout).date === 'string' &&
            Number.isSafeInteger((r as MockPayout).amountCents) &&
            (r as MockPayout).amountCents > 0 &&
            (r as MockPayout).status === 'processing',
        )
        .slice(0, 50);
    const a = x.account as PayoutAccount | undefined;
    if (a && typeof a.holder === 'string' && /^\d{4}$/.test(a.last4) && /^[A-Z]{2}$/.test(a.country))
      value.account = { holder: a.holder.slice(0, 80), last4: a.last4, country: a.country, changedAt: a.changedAt };
  } catch {
    /* تالف ← لا شيء محلّي */
  }
  cache = { raw, value };
  return value;
}

function writeLocal(next: Local) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    cache = { raw: cache.raw, value: next };
  }
  signal.notify();
}

const DEFAULT_ACCOUNT: PayoutAccount = {
  holder: 'مسبك تجاريب',
  last4: MOCK_STUDIO_ANALYTICS.earnings.bankLast4,
  country: 'IQ',
};

function snapshot(local: Local) {
  const e = MOCK_STUDIO_ANALYTICS.earnings;
  const requested = local.requests.reduce((n, r) => n + r.amountCents, 0);
  const account = local.account ?? DEFAULT_ACCOUNT;
  const holdUntil = account.changedAt
    ? Date.parse(account.changedAt) + PUBLISHER_TERMS.accountChangeHoldHours * 3_600_000
    : 0;
  const sales = getSales();
  return {
    available: Math.max(0, e.available.cents - requested),
    /** أرباح مبيعات لم تنقضِ مدّة استرجاعها بعد */
    onHold: sales.filter((s) => s.status === 'pending').reduce((n, s) => n + s.netCents, 0),
    processing: requested,
    total: e.total.cents,
    paid: e.paid.cents,
    nextPayout: e.nextPayout,
    account,
    /** تغيير حديث للحساب يعلّق التحويلات حتى هذا الوقت */
    holdUntil: holdUntil > Date.now() ? new Date(holdUntil).toISOString() : undefined,
    payouts: [
      ...local.requests.map((r) => ({ ...r, last4: account.last4 })),
      ...MOCK_PAYOUTS.map((p) => ({ ...p, last4: DEFAULT_ACCOUNT.last4 })),
    ] as Payout[],
  };
}

let snapCache: { local: Local | null; value: ReturnType<typeof snapshot> | null } = { local: null, value: null };
function getSnapshot() {
  const local = readLocal();
  if (snapCache.local !== local || !snapCache.value) snapCache = { local, value: snapshot(local) };
  return snapCache.value!;
}

export function useEarnings() {
  return useSyncExternalStore(signal.subscribe, getSnapshot, getSnapshot);
}

/* ── طلب سحب ─────────────────────────────────────────────────────────────── */

export type FormState = {
  ok?: boolean;
  message?: string;
  fields?: Record<string, string | undefined>;
  /** ما كتبه المستخدم — يعود إلى الحقول بعد خطأ (React يفرّغ النموذج بعد كل إرسال) */
  values?: Record<string, string>;
} | null;

const amountSchema = z
  .string()
  .trim()
  .regex(/^\d{1,7}(\.\d{1,2})?$/, 'اكتب مبلغاً بالدولار، مثل 250 أو 99.50.')
  .transform((v) => Math.round(Number(v) * 100));

export function requestPayout(_prev: FormState, form: FormData): FormState {
  if (!requireStudio()) return { ok: false, message: 'السحب لحسابات الاستوديو وحدها.' };
  const snap = getSnapshot();
  if (snap.holdUntil) return { ok: false, message: 'التحويلات معلّقة مؤقتاً بعد تغيير حساب التحويل.' };
  const raw = String(form.get('amount') ?? '').slice(0, 20);
  const fail = (amount?: string) => ({ ok: false, fields: { amount }, values: { amount: raw } });
  const parsed = amountSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message);
  const amount = parsed.data;
  if (amount < PUBLISHER_TERMS.minPayout.cents)
    return fail(`الحدّ الأدنى للسحب $${PUBLISHER_TERMS.minPayout.cents / 100}.`);
  if (amount > snap.available) return fail('المبلغ أكبر من رصيدك المتاح.');
  const local = readLocal();
  writeLocal({
    ...local,
    requests: [
      {
        id: `P-${Date.now().toString(36).toUpperCase()}`,
        date: new Date().toISOString().slice(0, 10),
        amountCents: amount,
        status: 'processing',
      },
      ...local.requests,
    ],
  });
  return { ok: true };
}

/* ── تغيير حساب التحويل ──────────────────────────────────────────────────── */

/** IBAN صالح: الشكل + خوارزمية mod-97 (ISO 13616) — يُعاد التحقّق نفسه على الخادم */
export function isValidIban(input: string): boolean {
  const iban = input.replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
  const moved = iban.slice(4) + iban.slice(0, 4);
  let rem = 0;
  for (const ch of moved) {
    const d = ch >= 'A' ? String(ch.charCodeAt(0) - 55) : ch;
    for (const digit of d) rem = (rem * 10 + Number(digit)) % 97;
  }
  return rem === 1;
}

const accountSchema = z.object({
  holder: z.string().trim().min(2, 'اكتب اسم صاحب الحساب كما في البنك.').max(80, 'أقصر من 80 حرفاً.'),
  iban: z.string().refine(isValidIban, 'رقم IBAN غير صحيح — راجِع الأرقام.'),
  confirm: z.literal('on', { message: 'أكّد أن الحساب باسمك أو باسم مسبكك.' }),
});

export function changePayoutAccount(_prev: FormState, form: FormData): FormState {
  if (!requireStudio()) return { ok: false, message: 'هذه العملية لحسابات الاستوديو وحدها.' };
  const values = {
    holder: String(form.get('holder') ?? '').slice(0, 120),
    iban: String(form.get('iban') ?? '').slice(0, 64),
    confirm: form.get('confirm') === 'on' ? 'on' : '',
  };
  const parsed = accountSchema.safeParse({ ...values, confirm: values.confirm || undefined });
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return { ok: false, fields: Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v?.[0]])), values };
  }
  const iban = parsed.data.iban.replace(/\s+/g, '').toUpperCase();
  // الرقم الكامل لا يُحفظ هنا — يذهب إلى الخادم (ومنه إلى مزوّد الدفع) مشفّراً، ويبقى للعرض آخر 4 أرقام
  writeLocal({
    ...readLocal(),
    account: {
      holder: parsed.data.holder,
      last4: iban.slice(-4),
      country: iban.slice(0, 2),
      changedAt: new Date().toISOString(),
    },
  });
  return { ok: true };
}
