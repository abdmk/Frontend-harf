import { defaultPlan, savePlanEdit } from '@/stores/plan-offers';
import { PLANS, type Plan } from '@/types/domain/user';

import { logAdmin } from './audit';
import { adminOrNull, type AdminResult, DENIED } from './guard';

/** تعديل خطة: الدور يُتحقَّق عند كل حفظ، والقيم تمرّ على المخطّط — السجلّ يذكر الخطة لا الأسعار */
export function updatePlan(id: Plan, input: unknown): AdminResult {
  const admin = adminOrNull();
  if (!admin) return DENIED;
  if (!(PLANS as readonly string[]).includes(id)) return { ok: false, error: 'خطة غير صالحة.' };
  const r = savePlanEdit(id, input);
  if (r.ok) logAdmin(admin.name, 'تعديل خطة', defaultPlan(id).name);
  return r;
}

export function resetPlan(id: Plan): AdminResult {
  const admin = adminOrNull();
  if (!admin) return DENIED;
  if (!(PLANS as readonly string[]).includes(id)) return { ok: false, error: 'خطة غير صالحة.' };
  const r = savePlanEdit(id, null);
  if (r.ok) logAdmin(admin.name, 'استعادة خطة للافتراضي', defaultPlan(id).name);
  return r;
}
