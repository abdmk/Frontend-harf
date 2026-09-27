import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { paths } from '@/config/paths';
import { AccountShell } from '@/features/account/components/account-shell';
import { SECTION_TITLE } from '@/features/account/config/nav';
import { ACCOUNT_SECTIONS, type AccountSection } from '@/features/account/types';
import { requireUser } from '@/lib/auth';

import { SectionContent } from '../_components/section-content';

const isSection = (s: string): s is AccountSection => (ACCOUNT_SECTIONS as readonly string[]).includes(s);

export async function generateMetadata({ params }: PageProps<'/account/[section]'>): Promise<Metadata> {
  const { section } = await params;
  return { title: isSection(section) ? SECTION_TITLE[section] : 'الحساب', robots: { index: false } };
}

export default async function AccountSectionPage({ params }: PageProps<'/account/[section]'>) {
  const { section } = await params;
  if (!isSection(section)) notFound();
  const user = await requireUser(paths.account.getHref(section));
  // لوحة المسبك لحساب الاستوديو وحده — التحقّق على الخادم لا بإخفاء الرابط فقط
  if (section === 'foundry' && user.plan !== 'studio') redirect(paths.account.getHref('subscription'));

  return (
    <AccountShell user={user} section={section}>
      <SectionContent user={user} section={section} />
    </AccountShell>
  );
}
