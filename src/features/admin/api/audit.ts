import { asObject, createJsonStore } from '@/lib/json-store';

/**
 * سجلّ إجراءات الإدارة: من فعل ماذا ومتى — بلا بيانات حسّاسة (لا بريد ولا مبالغ ولا محتوى الملفات).
 * ⚠️ عرض: في المنتج يُكتب على الخادم في سجلّ لا يعدَّل، ولا يُكتفى بنسخة المتصفّح.
 */
export type AuditEntry = { id: string; at: string; actor: string; action: string; target: string };

const MAX = 100;
const store = createJsonStore<AuditEntry[]>(
  'harf_admin_audit',
  (x) =>
    (Array.isArray(x) ? x : [])
      .map(asObject)
      .filter(
        (e) =>
          typeof e.id === 'string' &&
          typeof e.at === 'string' &&
          typeof e.actor === 'string' &&
          typeof e.action === 'string' &&
          typeof e.target === 'string',
      )
      .map((e) => ({
        id: String(e.id).slice(0, 40),
        at: String(e.at).slice(0, 40),
        actor: String(e.actor).slice(0, 60),
        action: String(e.action).slice(0, 80),
        target: String(e.target).slice(0, 80),
      }))
      .slice(0, MAX),
  [],
);

export function logAdmin(actor: string, action: string, target: string) {
  const entry: AuditEntry = {
    id: `a-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    actor,
    action,
    target,
  };
  store.set([entry, ...store.get()].slice(0, MAX));
}

export const useAuditLog = store.use;
