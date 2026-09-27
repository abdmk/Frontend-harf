import type { Metadata } from 'next';

import { paths } from '@/config/paths';
import { AccountShell } from '@/features/account/components/account-shell';
import { requireUser } from '@/lib/auth';

import { SectionContent } from './_components/section-content';

export const metadata: Metadata = { title: 'الحساب', robots: { index: false } };

/** فهرس الحساب: القائمة وحدها على الجوال، والملف الشخصي بجانبها على الشاشات الواسعة */
export default async function AccountIndex() {
  const user = await requireUser(paths.account.getHref(''));
  return (
    <AccountShell user={user} section={null}>
      <SectionContent user={user} section="profile" />
    </AccountShell>
  );
}
