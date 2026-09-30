import { Navigate, Route, Routes } from 'react-router';

import { COMING_SOON, type ComingSoonKey } from '@/config/coming-soon';

import { ErrorBoundary } from './error';
import { SiteLayout } from './layouts/site-layout';
import { StudioLayout } from './layouts/studio-layout';
import { WideLayout } from './layouts/wide-layout';
import { FontLabPage, FontMatchingPage, NasaqPage } from './lazy-pages';
import { AccountIndexPage } from './pages/account-index';
import { AccountSectionPage } from './pages/account-section';
import { AnalyticsPage } from './pages/analytics';
import { CartPage } from './pages/cart';
import { CheckoutPage } from './pages/checkout';
import { ComingSoonPage } from './pages/coming-soon';
import { DesignSystemPage } from './pages/design-system';
import { DesignerPage } from './pages/designer';
import { FontPage } from './pages/font';
import { FoundryPage } from './pages/foundry';
import { HomePage } from './pages/home';
import { LoginPage } from './pages/login';
import { ManuscriptsPage } from './pages/manuscripts';
import { NotFoundPage } from './pages/not-found';
import { NotificationsPage } from './pages/notifications';
import { PublishPage } from './pages/publish';
import { RegisterPage } from './pages/register';
import { ReverseTextPage } from './pages/reverse-text';
import { AboutPage, HelpPage, PrivacyPage, ServicesPage, TermsPage } from './pages/static-pages';
import {
  StudioAnalyticsPage,
  StudioFinancePage,
  StudioFontsPage,
  StudioOverviewPage,
  StudioProfilePage,
} from './pages/studio';
import { AppProviders } from './providers';
import { ScrollToTop } from './scroll-to-top';

export function App() {
  return (
    <AppProviders>
      <ScrollToTop />
      <Routes>
        {/* صفحات الموقع العامة — ترويسة عادية + تذييل */}
        <Route errorElement={<ErrorBoundary />} element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="fonts/:id" element={<FontPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="foundries/:id" element={<FoundryPage />} />
          <Route path="designers/:id" element={<DesignerPage />} />
          <Route path="manuscripts" element={<ManuscriptsPage />} />
          <Route path="tools/reverse-text" element={<ReverseTextPage />} />
          <Route path="tools/nasaq" element={<NasaqPage />} />
          <Route path="tools/font-lab" element={<FontLabPage />} />
          <Route path="tools/font-matching" element={<FontMatchingPage />} />
          {(Object.keys(COMING_SOON) as ComingSoonKey[]).map((k) => (
            <Route key={k} path={COMING_SOON[k].path.slice(1)} element={<ComingSoonPage page={k} />} />
          ))}
          <Route path="about" element={<AboutPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
        </Route>

        {/* المصادقة — بلا ترويسة */}
        <Route errorElement={<ErrorBoundary />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* الحساب — ترويسة عريضة بلا تذييل */}
        <Route errorElement={<ErrorBoundary />} element={<WideLayout />}>
          <Route path="account" element={<AccountIndexPage />} />
          <Route path="account/:section" element={<AccountSectionPage />} />
        </Route>

        {/* الاستوديو — مساحة مستقلّة بعمودها الجانبي */}
        <Route path="studio" errorElement={<ErrorBoundary />} element={<StudioLayout />}>
          <Route index element={<StudioOverviewPage />} />
          <Route path="fonts" element={<StudioFontsPage />} />
          <Route path="analytics" element={<StudioAnalyticsPage />} />
          <Route path="finance" element={<StudioFinancePage page="overview" />} />
          <Route path="finance/sales" element={<StudioFinancePage page="sales" />} />
          <Route path="finance/payouts" element={<StudioFinancePage page="payouts" />} />
          {/* «الأرباح» حُذف — العنوان القديم يذهب إلى النظرة المالية */}
          <Route path="finance/earnings" element={<Navigate to="/studio/finance" replace />} />
          <Route path="profile" element={<StudioProfilePage />} />
          <Route path="publish" element={<PublishPage />} />
          <Route path="*" element={<Navigate to="/studio" replace />} />
        </Route>

        {/* عناوين المالية القديمة في الحساب */}
        <Route path="account/sales" element={<Navigate to="/studio/finance/sales" replace />} />
        <Route path="account/earnings" element={<Navigate to="/studio/finance" replace />} />
        <Route path="account/payouts" element={<Navigate to="/studio/finance/payouts" replace />} />

        {/* المشرف */}
        <Route errorElement={<ErrorBoundary />} element={<WideLayout />}>
          <Route path="admin/analytics" element={<AnalyticsPage />} />
        </Route>

        {/* دليل التصميم */}
        <Route errorElement={<ErrorBoundary />} element={<WideLayout />}>
          <Route path="design-system" element={<DesignSystemPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppProviders>
  );
}
