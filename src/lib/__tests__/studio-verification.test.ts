import { beforeEach, describe, expect, it } from 'vitest';

import { setDemoSession } from '../auth';
import { maskPayout, normalizeIraqiMobile, payoutInputSchema, verifyOtp } from '../payout';
import {
  AGREEMENT_VERSION,
  canSell,
  decideVerification,
  getVerification,
  missingOf,
  saveVerificationDraft,
  statusOf,
  submitVerification,
} from '../studio-verification';

const ME = 'u-heba'; // الحساب المجاني بعد ترقيته («newstudio»)

describe('وسيلة استلام الأرباح', () => {
  it('رقم المحفظة العراقي يُوحَّد ويُرفض غيره', () => {
    expect(normalizeIraqiMobile('+964 770 123 4567')).toBe('07701234567');
    expect(normalizeIraqiMobile('07701234567')).toBe('07701234567');
    expect(normalizeIraqiMobile('0770123')).toBeNull();
    expect(normalizeIraqiMobile('07101234567')).toBeNull();
  });

  it('لا يبقى من الرقم إلا آخر 4 أرقام', () => {
    const p = payoutInputSchema.parse({ method: 'bank', holder: 'هبة', iban: 'IQ98 NBIQ 8501 2345 6789 012' });
    expect(maskPayout(p)).toEqual({ method: 'bank', holder: 'هبة', last4: '9012', country: 'IQ' });
    expect(JSON.stringify(maskPayout(p))).not.toContain('NBIQ');
  });

  it('رمز التأكيد: الخطأ مرفوض، والمحاولات محدودة', () => {
    expect(verifyOtp('111111', 't1').ok).toBe(false);
    expect(verifyOtp('246810', 't1').ok).toBe(true);
    for (let i = 0; i < 5; i++) verifyOtp('000000', 't2');
    const r = verifyOtp('246810', 't2');
    expect(r.ok).toBe(false);
  });
});

describe('توثيق الاستوديو', () => {
  beforeEach(() => {
    localStorage.clear();
    setDemoSession('newstudio');
  });

  it('الاستوديو القائم معتمد، والجديد لم يبدأ — ولا بيع قبل الاعتماد', () => {
    expect(canSell('u-abdmk')).toBe(true);
    expect(statusOf(ME)).toBe('none');
    expect(canSell(ME)).toBe(false);
  });

  it('لا إرسال قبل اكتمال الخطوات، والإرسال يجعل الطلب قيد المراجعة', () => {
    expect(submitVerification().ok).toBe(false);
    expect(
      saveVerificationDraft({
        info: {
          legalName: 'هبة عبدالحميد علي',
          studioName: 'استوديو هبة',
          entity: 'individual',
          companyName: '',
          country: 'IQ',
          city: 'بغداد',
        },
        docType: 'passport',
        docs: { front: 'd-abc123' },
        payout: { method: 'wallet', holder: 'هبة', last4: '4567', verifiedAt: '2026-10-01T00:00:00Z' },
      }).ok,
    ).toBe(true);
    expect(missingOf(getVerification(ME))).toEqual(['agreement']);
    saveVerificationDraft({
      agreement: { version: AGREEMENT_VERSION, signedAt: '2026-10-01T00:00:00Z', signer: 'هبة', signature: 'd-sig123' },
    });
    expect(submitVerification().ok).toBe(true);
    expect(statusOf(ME)).toBe('pending');
    // قيد المراجعة: لا تعديل
    expect(saveVerificationDraft({ docType: 'national_id' }).ok).toBe(false);
    expect(canSell(ME)).toBe(false);
  });

  it('مُعرّف وثيقة مختلَق أو حقل غير معروف لا يُحفظ', () => {
    expect(saveVerificationDraft({ docs: { front: 'javascript:alert(1)' } }).ok).toBe(false);
    expect(
      saveVerificationDraft({ payout: { method: 'bank', holder: 'x', last4: 'IQ98NBIQ850123456789012' } }).ok,
    ).toBe(false);
  });

  it('الرفض يتطلّب سبباً، والاعتماد يفتح البيع', () => {
    expect(decideVerification('u-seed-noor', 'rejected', 'قصير').ok).toBe(false);
    expect(decideVerification('u-seed-noor', 'approved').ok).toBe(true);
    expect(canSell('u-seed-noor')).toBe(true);
    // لا قرار ثانٍ على طلب محسوم
    expect(decideVerification('u-seed-noor', 'rejected', 'سبب طويل بما يكفي هنا').ok).toBe(false);
  });
});
