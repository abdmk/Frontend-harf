import { z } from 'zod';

import { LICENSE_PACKAGES } from '@/types/domain/license';

const id = z.string().regex(/^[a-z0-9-]{1,40}$/);

/**
 * التحقّق من اختيار الترخيص القادم من المتصفّح (السلة، الإجراءات).
 * لا يحمل سعراً — السعر يُحسب دائماً من جدول الخادم.
 */
export const selectionSchema = z
  .object({
    fontId: id,
    package: z.enum(LICENSE_PACKAGES),
    weightId: id.optional(),
    uses: z
      .object({ desktop: id.optional(), web: id.optional(), app: id.optional() })
      .strict()
      .refine((u) => Object.values(u).some(Boolean), 'اختر استخداماً واحداً على الأقل'),
  })
  .strict()
  .refine((s) => s.package === 'family' || !!s.weightId, 'اختر الوزن');

export const MAX_CART_ITEMS = 20;

export const cartStateSchema = z.object({
  items: z
    .array(z.object({ id: z.string().regex(/^[a-z0-9]{8,16}$/), selection: selectionSchema }))
    .max(MAX_CART_ITEMS),
  coupon: z.string().max(24).optional(),
});

export type CartState = z.infer<typeof cartStateSchema>;
