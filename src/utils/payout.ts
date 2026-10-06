import { z } from 'zod';

import { hit } from './sliding-window';

/**
 * وسيلة استلام الأرباح: حساب بنكي (IBAN) في كل الدول، و«كي كارد» للناشرين في العراق فقط.
 * ⚠️ عرض: الرقم الكامل لا يُحفظ في المتصفّح أبداً — يُرسل إلى الخادم مشفّراً (TLS) ويُخزَّن هناك
 * مشفّراً، ويبقى في الواجهة آخر 4 أرقام للعرض فقط. التحقّق نفسه يُعاد على الخادم.
 */
export const PAYOUT_METHODS = ['bank', 'qicard'] as const;
export type PayoutMethod = (typeof PAYOUT_METHODS)[number];

export const PAYOUT_METHOD_LABEL: Record<PayoutMethod, string> = {
  bank: 'حساب بنكي',
  qicard: 'كي كارد',
};

/** الوسائل المتاحة لدولة الناشر: كي كارد بطاقة عراقية، فلا تُعرض إلا لمن دولته العراق */
export function payoutMethodsFor(country?: string): readonly PayoutMethod[] {
  return country === 'IQ' ? PAYOUT_METHODS : ['bank'];
}

/** ما يُعرض ويُحفظ محلياً: مقنّع دائماً */
export type MaskedPayout = { method: PayoutMethod; holder: string; last4: string; country?: string };

/** IBAN صالح: الشكل + خوارزمية mod-97 (ISO 13616) */
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

/** رقم بطاقة كي كارد: 16 رقماً تجتاز فحص Luhn — null إن لم يصحّ، وإلا الأرقام وحدها */
export function normalizeCardNumber(input: string): string | null {
  const d = input.replace(/[\s-]/g, '');
  if (!/^\d{16}$/.test(d)) return null;
  let sum = 0;
  for (let i = 0; i < 16; i++) {
    let n = Number(d[15 - i]);
    if (i % 2 === 1) n = n * 2 > 9 ? n * 2 - 9 : n * 2;
    sum += n;
  }
  return sum % 10 === 0 ? d : null;
}

const holder = z.string().trim().min(2, 'اكتب الاسم كما هو مسجّل لدى البنك أو على البطاقة.').max(80);

export const payoutInputSchema = z.discriminatedUnion('method', [
  z.object({
    method: z.literal('bank'),
    holder,
    iban: z.string().refine(isValidIban, 'رقم IBAN غير صحيح — راجِع الأرقام.'),
  }),
  z.object({
    method: z.literal('qicard'),
    holder,
    card: z
      .string()
      .refine((v) => normalizeCardNumber(v) !== null, 'رقم البطاقة 16 رقماً — راجِعه كما هو على البطاقة.'),
  }),
]);
export type PayoutInput = z.infer<typeof payoutInputSchema>;

/** يقنّع المُدخل بعد التحقّق — هذا كل ما يبقى في الواجهة */
export function maskPayout(p: PayoutInput): MaskedPayout {
  if (p.method === 'bank') {
    const iban = p.iban.replace(/\s+/g, '').toUpperCase();
    return { method: 'bank', holder: p.holder, last4: iban.slice(-4), country: iban.slice(0, 2) };
  }
  return { method: 'qicard', holder: p.holder, last4: normalizeCardNumber(p.card)!.slice(-4), country: 'IQ' };
}

export const maskedPayoutSchema = z.object({
  // «wallet» (زين كاش) قيمة قديمة محفوظة — تُقرأ ككي كارد حتى يحدّثها صاحبها
  method: z.preprocess((m) => (m === 'wallet' ? 'qicard' : m), z.enum(PAYOUT_METHODS)),
  holder: z.string().max(80),
  last4: z.string().regex(/^\d{4}$/),
  country: z
    .string()
    .regex(/^[A-Z]{2}$/)
    .optional(),
});

export function payoutLabel(p: MaskedPayout) {
  return p.method === 'bank' ? `IBAN •••• ${p.last4}` : `كي كارد •••• ${p.last4}`;
}

/* ── رمز التأكيد لمرّة واحدة (OTP) ─────────────────────────────────────────
 * ⚠️ عرض فقط: الرمز ثابت ومعروف كي تُجرَّب الواجهة. في المنتج يولّده الخادم عشوائياً،
 * يُرسله إلى البريد، يحفظ تجزئته لمدّة قصيرة (10 دقائق)، ويحدّ المحاولات وإعادة الإرسال.
 */
export const DEMO_OTP = '246810';
export const OTP_LENGTH = 6;
export const OTP_RESEND_SECONDS = 30;

export type OtpResult = { ok: true } | { ok: false; error: string };

export function verifyOtp(code: string, scope: string): OtpResult {
  if (!hit(`otp:${scope}`, 5, 10 * 60_000))
    return { ok: false, error: 'محاولات كثيرة. انتظر عشر دقائق ثم اطلب رمزاً جديداً.' };
  if (!new RegExp(`^\\d{${OTP_LENGTH}}$`).test(code)) return { ok: false, error: 'الرمز 6 أرقام.' };
  return code === DEMO_OTP ? { ok: true } : { ok: false, error: 'الرمز غير صحيح. تأكّد منه أو اطلب رمزاً جديداً.' };
}

/** يقنّع البريد للعرض: abdmk@gmail.com ← a••••@gmail.com */
export function maskEmail(email: string) {
  const [name = '', domain = ''] = email.split('@');
  return `${name.slice(0, 1)}••••@${domain}`;
}
