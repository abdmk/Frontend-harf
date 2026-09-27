import type { FileKind } from '@/components/shared/file-icon';

/** قيود الرفع كما في التصميم. الخادم يعيد فحصها كلها — هذا للسرعة وتجربة المستخدم فقط. */
export const UPLOAD_LIMITS = {
  exts: ['otf', 'ttf', 'pdf', 'zip'] as const satisfies readonly FileKind[],
  maxBytes: 250 * 1024 * 1024,
};

export type UploadExt = (typeof UPLOAD_LIMITS.exts)[number];

export function extOf(name: string): string {
  const m = /\.([a-z0-9]+)$/i.exec(name.trim());
  return m?.[1]?.toLowerCase() ?? '';
}

/** يعيد رسالة خطأ بالعربية أو null إن كان الملف مقبولاً مبدئياً */
export function validateFile(file: { name: string; size: number }): string | null {
  const ext = extOf(file.name);
  if (!(UPLOAD_LIMITS.exts as readonly string[]).includes(ext))
    return 'صيغة غير مدعومة — ارفع OTF أو TTF أو PDF أو ZIP';
  if (file.size <= 0) return 'الملف فارغ';
  if (file.size > UPLOAD_LIMITS.maxBytes) return 'أكبر من 250 ميجابايت';
  return null;
}

/**
 * فحص أوّلي لرابط الاستيراد. الحماية الحقيقية على الخادم الذي سيجلب الملف:
 * منع العناوين الداخلية بعد حلّ DNS (SSRF)، حدّ للحجم والوقت، وفحص المحتوى لا الامتداد.
 */
export function validateImportUrl(raw: string): { ok: true; url: URL } | { ok: false; error: string } {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return { ok: false, error: 'الرابط غير صالح' };
  }
  if (url.protocol !== 'https:') return { ok: false, error: 'يجب أن يبدأ الرابط بـ https://' };
  if (url.username || url.password) return { ok: false, error: 'الرابط لا يجب أن يحتوي بيانات دخول' };
  const host = url.hostname;
  if (
    host === 'localhost' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(host) ||
    host.startsWith('[')
  )
    return { ok: false, error: 'استعمل رابطاً عامّاً باسم نطاق' };
  return { ok: true, url };
}
