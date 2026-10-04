import { PageMeta } from '@/components/shared/page-meta';
import { updateProfile } from '@/features/account/api/actions';
import { ProfileInfoForm, ProfileSummary } from '@/features/account/components/sections/profile-section';
import { studioTotals } from '@/features/studio/api/get-studio';
import { FinanceEmpty, FinanceOverview } from '@/features/studio/components/money/finance-overview';
import { PayoutsSection } from '@/features/studio/components/money/payouts-section';
import { SalesSection } from '@/features/studio/components/money/sales-section';
import { PublicProfileEditor } from '@/features/studio/components/public-profile-editor';
import { StudioAnalyticsView } from '@/features/studio/components/studio-analytics';
import { StudioFonts } from '@/features/studio/components/studio-fonts';
import { StudioOverview } from '@/features/studio/components/studio-overview';
import { StudioPageHeader } from '@/features/studio/components/studio-page-header';
import { VerificationCallout } from '@/features/verification/components/verification-callout';
import { requireUser } from '@/lib/auth';

import { useStudio } from '../layouts/studio-layout';

/* صفحات مساحة الاستوديو — كل صفحة تأخذ بياناتها من التخطيط (useStudio) */

export function StudioOverviewPage() {
  const { fonts, analytics } = useStudio();
  return (
    <>
      <PageMeta title="الاستوديو" noindex />
      <VerificationCallout className="mb-6" />
      <StudioOverview fonts={fonts} analytics={analytics} />
    </>
  );
}

export function StudioFontsPage() {
  const { fonts } = useStudio();
  return (
    <>
      <PageMeta title="خطوطي" noindex />
      <StudioFonts fonts={fonts} />
    </>
  );
}

export function StudioAnalyticsPage() {
  const { fonts, analytics } = useStudio();
  return (
    <>
      <PageMeta title="التحليلات" noindex />
      <StudioAnalyticsView fonts={fonts} analytics={analytics} />
    </>
  );
}

const FINANCE = {
  overview: { title: 'المالية', description: 'أرصدتك وآخر مبيعاتك في مكان واحد.' },
  sales: { title: 'المبيعات', description: 'كل عملية بيع لخطوطك وحالتها.' },
  payouts: { title: 'السحوبات', description: 'رصيدك القابل للسحب، حساب التحويل، وسجلّ التحويلات.' },
} as const;

/** صفحات المالية: الاستوديو الذي لا يبيع يرى شرحاً واحداً بدل أرقام صفرية */
export function StudioFinancePage({ page }: { page: keyof typeof FINANCE }) {
  const { fonts } = useStudio();
  const meta = FINANCE[page];
  const body = !studioTotals(fonts).hasPaid ? (
    <FinanceEmpty />
  ) : page === 'overview' ? (
    <FinanceOverview />
  ) : page === 'sales' ? (
    <SalesSection />
  ) : (
    <PayoutsSection />
  );
  return (
    <>
      <PageMeta title={meta.title} noindex />
      <StudioPageHeader title={meta.title} description={meta.description} />
      <VerificationCallout className="mb-6" />
      {body}
    </>
  );
}

/** «الملف الشخصي» للاستوديو: الحساب والصفحة العامة في صفحة واحدة — لا ملفّان منفصلان */
export function StudioProfilePage() {
  const { foundry } = useStudio();
  const user = requireUser();
  return (
    <>
      <PageMeta title="الملف الشخصي" noindex />
      <StudioPageHeader title="الملف الشخصي" description="حسابك وما يراه الناس في صفحتك — في مكان واحد." />
      <div className="flex flex-col gap-5">
        {user && <ProfileSummary user={user} />}
        <PublicProfileEditor foundry={foundry} />
        {user && (
          <ProfileInfoForm
            user={user}
            action={updateProfile}
            compact
            title="معلومات الفواتير"
            description="الاسم الذي يظهر على تراخيصك وفواتيرك — لا يظهر في صفحتك العامة."
          />
        )}
      </div>
    </>
  );
}
