import { PageMeta } from '@/components/shared/page-meta';
import { studioTotals } from '@/features/studio/api/get-studio';
import { EarningsSection } from '@/features/studio/components/money/earnings-section';
import { FinanceEmpty, FinanceOverview } from '@/features/studio/components/money/finance-overview';
import { PayoutsSection } from '@/features/studio/components/money/payouts-section';
import { SalesSection } from '@/features/studio/components/money/sales-section';
import { PublicProfileEditor } from '@/features/studio/components/public-profile-editor';
import { StudioAnalyticsView } from '@/features/studio/components/studio-analytics';
import { StudioFonts } from '@/features/studio/components/studio-fonts';
import { StudioOverview } from '@/features/studio/components/studio-overview';
import { StudioPageHeader } from '@/features/studio/components/studio-page-header';

import { useStudio } from '../layouts/studio-layout';

/* صفحات مساحة الاستوديو — كل صفحة تأخذ بياناتها من التخطيط (useStudio) */

export function StudioOverviewPage() {
  const { fonts, analytics } = useStudio();
  return (
    <>
      <PageMeta title="الاستوديو" noindex />
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
  earnings: { title: 'الأرباح', description: 'كيف يُحسب صافيك، وتطوّره عبر الأشهر.' },
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
  ) : page === 'earnings' ? (
    <EarningsSection fonts={fonts} />
  ) : (
    <PayoutsSection />
  );
  return (
    <>
      <PageMeta title={meta.title} noindex />
      <StudioPageHeader title={meta.title} description={meta.description} />
      {body}
    </>
  );
}

export function StudioProfilePage() {
  const { foundry } = useStudio();
  return (
    <>
      <PageMeta title="الملف العام" noindex />
      <StudioPageHeader title="الملف العام" description="ما يراه الناس في صفحة استوديوك." />
      <PublicProfileEditor foundry={foundry} />
    </>
  );
}
