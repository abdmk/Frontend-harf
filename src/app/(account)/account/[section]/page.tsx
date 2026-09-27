import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { CloudUploadIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { AccountShell, SectionPlaceholder } from '@/features/account/components/account-shell';
import { SECTION_TITLE } from '@/features/account/config/nav';
import { ACCOUNT_SECTIONS, type AccountSection } from '@/features/account/types';
import { UploadDialog } from '@/features/publishing/components/upload-dialog';
import { getCurrentUser } from '@/lib/auth';

const isSection = (s: string): s is AccountSection => (ACCOUNT_SECTIONS as readonly string[]).includes(s);

export async function generateMetadata({ params }: PageProps<'/account/[section]'>): Promise<Metadata> {
  const { section } = await params;
  return { title: isSection(section) ? SECTION_TITLE[section] : 'الحساب', robots: { index: false } };
}

export default async function AccountSectionPage({ params }: PageProps<'/account/[section]'>) {
  const { section } = await params;
  if (!isSection(section)) notFound();
  const user = await getCurrentUser();
  // لوحة المسبك لحساب الاستوديو وحده — التحقّق على الخادم لا بإخفاء الرابط فقط
  if (section === 'foundry' && user.plan !== 'studio') redirect(paths.account.getHref('subscription'));

  return (
    <AccountShell user={user} section={section}>
      {section === 'foundry' ? (
        <UploadDialog>
          <button
            type="button"
            className="inline-flex h-12 items-center gap-2 rounded-sm bg-primary px-6 text-[15px] font-medium text-white transition-[background-color,transform] hover:bg-harf-600 active:scale-[.97]"
          >
            <CloudUploadIcon className="size-[18px]" />
            تحميل الملفات
          </button>
        </UploadDialog>
      ) : (
        <SectionPlaceholder />
      )}
    </AccountShell>
  );
}
