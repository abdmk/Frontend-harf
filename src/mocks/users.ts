/* بيانات تجريبية — تُستبدل بجلسة حقيقية (انظر src/lib/auth.ts) */
import type { User } from '@/types/domain/user';

export const MOCK_USERS = {
  free: {
    id: 'u-heba',
    name: 'هبة عبدالحميد',
    email: 'heda.abed@gmail.com',
    initials: 'HA',
    plan: 'free',
    stats: { library: 12, favorites: 32, purchases: 4, usagePct: 65 },
  },
  studio: {
    id: 'u-abdmk',
    name: 'عبدالملك جاسم',
    email: 'abdmk.jassim@gmail.com',
    initials: 'AJ',
    plan: 'studio',
    stats: { library: 12, favorites: 32, purchases: 4, usagePct: 65 },
  },
} as const satisfies Record<string, User>;
