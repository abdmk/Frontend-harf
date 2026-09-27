import Link from 'next/link';

import { CatalogCard } from '@/app/_components/catalog-card';
import { EmptyState } from '@/components/shared/empty-state';
import { FontGrid } from '@/components/shared/font-grid';
import { Button } from '@/components/ui/button';
import { AppsIcon, CloudUploadIcon, FolderIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { changePassword, updateProfile } from '@/features/account/api/actions';
import { getLibraryIds, getPurchases } from '@/features/account/api/queries';
import { HelpSection } from '@/features/account/components/sections/help-section';
import { PreferencesSection } from '@/features/account/components/sections/preferences-section';
import { ProfileSection } from '@/features/account/components/sections/profile-section';
import { PurchasesSection } from '@/features/account/components/sections/purchases-section';
import { SecuritySection } from '@/features/account/components/sections/security-section';
import { UsageSection } from '@/features/account/components/sections/usage-section';
import type { AccountSection, User } from '@/features/account/types';
import { getFonts } from '@/features/catalog/api/get-fonts';
import { DEFAULT_QUERY } from '@/features/catalog/types/catalog-query';
import { FavoritesGrid } from '@/features/favorites/components/favorites-grid';
import { UploadDialog } from '@/features/publishing/components/upload-dialog';
import { changePlan } from '@/features/subscriptions/api/actions';
import { getInvoices, getPlans, getSubscription } from '@/features/subscriptions/api/get-subscription';
import { PlansDialog } from '@/features/subscriptions/components/plans-dialog';
import { SubscriptionSection } from '@/features/subscriptions/components/subscription-section';

/** يركّب محتوى كل قسم من الـfeatures — طبقة التطبيق وحدها تعرف كل الـfeatures */
export async function SectionContent({ user, section }: { user: User; section: AccountSection }) {
  switch (section) {
    case 'profile':
      return <ProfileSection user={user} action={updateProfile} />;
    case 'usage':
      return <UsageSection user={user} />;
    case 'purchases':
      return <PurchasesSection purchases={await getPurchases(user)} />;
    case 'preferences':
      return <PreferencesSection />;
    case 'security':
      return <SecuritySection user={user} action={changePassword} />;
    case 'help':
      return <HelpSection />;
    case 'library': {
      const ids = new Set(await getLibraryIds(user));
      const fonts = (await getFonts(DEFAULT_QUERY)).filter((f) => ids.has(f.id));
      return (
        <FontGrid
          fonts={fonts}
          renderCard={(f) => <CatalogCard font={f} />}
          empty={
            <EmptyState
              icon={<FolderIcon />}
              title="مكتبتك فارغة"
              description="الخطوط التي تحمّلها أو تشتريها تُحفظ هنا."
              action={
                <Button asChild>
                  <Link href={paths.home.getHref()}>تصفّح الخطوط</Link>
                </Button>
              }
            />
          }
        />
      );
    }
    case 'favorites': {
      const fonts = await getFonts(DEFAULT_QUERY);
      return (
        <FavoritesGrid cards={Object.fromEntries(fonts.map((f) => [f.id, <CatalogCard key={f.id} font={f} />]))} />
      );
    }
    case 'subscription': {
      const [plans, subscription, invoices] = await Promise.all([
        getPlans(),
        getSubscription(user.plan),
        getInvoices(user.plan),
      ]);
      const plan = plans.find((p) => p.id === user.plan) ?? plans[0]!;
      return (
        <SubscriptionSection
          user={user}
          plan={plan}
          subscription={subscription}
          invoices={invoices}
          changePlan={
            <PlansDialog
              plans={plans}
              current={user.plan}
              onChange={changePlan}
              trigger={
                <Button variant={user.plan === 'free' ? 'primary' : 'secondary'}>
                  {user.plan === 'free' ? 'ترقية الخطة' : 'تغيير الخطة'}
                </Button>
              }
            />
          }
        />
      );
    }
    case 'foundry':
      return (
        <div className="flex flex-wrap gap-3">
          <UploadDialog>
            <Button size="lg">
              <CloudUploadIcon />
              تحميل الملفات
            </Button>
          </UploadDialog>
          <Button asChild size="lg" variant="outline">
            <Link href={paths.studio.getHref()}>
              <AppsIcon />
              فتح لوحة المسبك
            </Link>
          </Button>
        </div>
      );
  }
}
