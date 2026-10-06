import { beforeEach, describe, expect, it, vi } from 'vitest';

import { decideManuscript, undoManuscriptDecision } from '@/features/admin/api/manuscripts';
import { searchLibraryFonts, submitManuscript } from '@/features/publishing/api/manuscripts';
import { getCurrentUser, setDemoSession } from '@/lib/auth';
import type * as MediaStore from '@/lib/media-store';
import { getSubmission, getSubmissions } from '@/stores/manuscript-submissions';

// IndexedDB غير موجود في jsdom — الحفظ نفسه يُختبر في المتصفّح (e2e)
vi.mock('@/lib/media-store', async (orig) => ({
  ...(await orig<typeof MediaStore>()),
  storeManuscriptSvg: vi.fn(async () => ({ ok: true, id: 'm-test0001' })),
}));

const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0h10v10z"/></svg>';
const valid = () => ({
  title: 'رمضان كريم',
  category: 'ramadan',
  fonts: [searchLibraryFonts('')[0]!.id],
  license: 'personal',
  note: '',
  rights: true,
  file: { name: 'ramadan.svg', bytes: 200, width: 10, height: 10 },
});

/** استوديو موثّق — يُكتب السجلّ مباشرة كما يحفظه المتصفّح */
function verify(userId: string) {
  localStorage.setItem(
    'harf_studio_verification_v2',
    JSON.stringify({ [userId]: { userId, status: 'approved', updatedAt: new Date().toISOString() } }),
  );
}

async function submitAsStudio() {
  setDemoSession('studio');
  verify(getCurrentUser()!.id);
  const r = await submitManuscript(valid(), SVG);
  if (!r.ok) throw new Error(JSON.stringify(r.errors));
  return r.reference;
}

describe('إرسال مخطوطة', () => {
  beforeEach(() => localStorage.clear());

  it('الحساب المجاني لا يرسل', async () => {
    setDemoSession('free');
    const r = await submitManuscript(valid(), SVG);
    expect(r.ok).toBe(false);
    expect(getSubmissions()).toHaveLength(0);
  });

  it('يُحفظ الطلب كاملاً وصاحبه من الجلسة لا من النموذج', async () => {
    setDemoSession('studio');
    const me = getCurrentUser()!;
    verify(me.id);
    const r = await submitManuscript({ ...valid(), userId: 'u-admin' }, SVG);
    expect(r.ok).toBe(true);
    const s = getSubmission(r.ok ? r.reference : '')!;
    expect(s.userId).toBe(me.id);
    expect(s.status).toBe('pending');
    expect(s.file.id).toBe('m-test0001');
    expect(s.fonts[0]!.name).toBeTruthy();
  });

  it('السجلّ التالف أو المعدّل يدوياً يُسقط', () => {
    localStorage.setItem(
      'harf_manuscript_submissions',
      JSON.stringify([{ reference: 'x' }, { reference: 'MS-1234', title: '<b>', status: 'hacked' }, 'junk']),
    );
    expect(getSubmissions()).toEqual([]);
  });
});

describe('قرار الإدارة في المخطوطات', () => {
  beforeEach(() => localStorage.clear());

  it('غير المشرف مرفوض', async () => {
    const ref = await submitAsStudio();
    expect(decideManuscript({ reference: ref, decision: 'approved', reason: '' }).ok).toBe(false);
    expect(getSubmission(ref)!.status).toBe('pending');
  });

  it('الرفض يحتاج سبباً، ويصل السبب كما هو لصاحب الطلب', async () => {
    const ref = await submitAsStudio();
    setDemoSession('admin');
    expect(decideManuscript({ reference: ref, decision: 'rejected', reason: 'قصير' }).ok).toBe(false);
    const reason = 'الملف مقصوص الأطراف من الأعلى.';
    expect(decideManuscript({ reference: ref, decision: 'rejected', reason }).ok).toBe(true);
    expect(getSubmission(ref)).toMatchObject({ status: 'rejected', reason });
  });

  it('لا قرار مرّتين، والتراجع يعيده للطابور', async () => {
    const ref = await submitAsStudio();
    setDemoSession('admin');
    expect(decideManuscript({ reference: ref, decision: 'approved', reason: '' }).ok).toBe(true);
    expect(decideManuscript({ reference: ref, decision: 'rejected', reason: 'سبب طويل بما يكفي.' }).ok).toBe(false);
    expect(undoManuscriptDecision(ref).ok).toBe(true);
    expect(getSubmission(ref)).toMatchObject({ status: 'pending' });
    expect(getSubmission(ref)!.by).toBeUndefined();
  });

  it('طلب بلا ملف (قديم) لا يُقبل', () => {
    localStorage.setItem(
      'harf_manuscript_submissions',
      JSON.stringify([
        {
          reference: 'MS-1111',
          userId: 'u-saad',
          studioName: 'استوديو',
          title: 'قديم',
          category: 'eid',
          fonts: [],
          license: 'personal',
          note: '',
          file: { name: 'a.svg', bytes: 10, width: 10, height: 10 },
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      ]),
    );
    setDemoSession('admin');
    expect(decideManuscript({ reference: 'MS-1111', decision: 'approved', reason: '' }).ok).toBe(false);
    expect(
      decideManuscript({ reference: 'MS-1111', decision: 'rejected', reason: 'الملف غير متاح، أعد رفعه.' }).ok,
    ).toBe(true);
  });
});
