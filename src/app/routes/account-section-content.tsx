import { useState } from 'react';
import { Link, Navigate } from 'react-router';

import { CatalogCard } from '@/app/_components/catalog-card';
import { EmptyState } from '@/components/shared/empty-state';
import { FontGrid } from '@/components/shared/font-grid';
import { Button } from '@/components/ui/button';
import { FolderIcon } from '@/components/ui/icons';
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
import { changePlan } from '@/features/subscriptions/api/actions';
import { getInvoices, getPlans, getSubscription, usePlans } from '@/features/subscriptions/api/get-subscription';
import { PlansDialog } from '@/features/subscriptions/components/plans-dialog';
import { SubscriptionSection } from '@/features/subscriptions/components/subscription-section';

/** «إدارة الخطة» و«ترقية الخطة» في حالة الاستخدام تفتحان نافذة الخطط نفسها */
function UsageWithPlans({ user }: { user: User }) {
  const [plansOpen, setPlansOpen] = useState(false);
  const plans = usePlans();
  return (
    <>
      <UsageSection user={user} onManagePlan={() => setPlansOpen(true)} />
      <PlansDialog
        plans={plans}
        current={user.plan}
        onChange={changePlan}
        open={plansOpen}
        onOpenChange={setPlansOpen}
      />
    </>
  );
}

export function SectionContent({ user, section }: { user: User; section: AccountSection }) {
  switch (section) {
    case 'profile':
      // الاستوديو: ملف واحد يجمع الحساب والصفحة العامة في /studio/profile
      if (user.plan === 'studio') return <Navigate to={paths.studio.getHref('profile')} replace />;
      return <ProfileSection user={user} action={updateProfile} />;
    case 'usage':
      return <UsageWithPlans user={user} />;
    case 'purchases':
      return <PurchasesSection purchases={getPurchases(user)} />;
    case 'preferences':
      return <PreferencesSection />;
    case 'security':
      return <SecuritySection user={user} action={changePassword} />;
    case 'help':
      return <HelpSection />;
    case 'library': {
      const ids = new Set(getLibraryIds(user));
      const fonts = getFonts(DEFAULT_QUERY).filter((f) => ids.has(f.id));
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
                  <Link to={paths.home.getHref()}>تصفّح الخطوط</Link>
                </Button>
              }
            />
          }
        />
      );
    }
    case 'favorites': {
      const fonts = getFonts(DEFAULT_QUERY);
      return (
        <FavoritesGrid cards={Object.fromEntries(fonts.map((f) => [f.id, <CatalogCard key={f.id} font={f} />]))} />
      );
    }
    case 'subscription': {
      const plans = getPlans();
      const subscription = getSubscription(user.plan);
      const invoices = getInvoices(user.plan);
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
      // لا يُعرض: AccountSectionPage يوجّه هذا القسم إلى /studio
      return null;
  }
}
