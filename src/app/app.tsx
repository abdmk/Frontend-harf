import { Navigate, Route, Routes } from 'react-router';

import { ErrorBoundary } from './error';
import { AdminLayout } from './layouts/admin-layout';
import { SiteLayout } from './layouts/site-layout';
import { StudioLayout } from './layouts/studio-layout';
import { WideLayout } from './layouts/wide-layout';
import { FontLabPage, FontMatchingPage, NasaqPage } from './lazy-pages';
import { AccountIndexPage } from './pages/account-index';
import { AccountSectionPage } from './pages/account-section';
import {
  AdminAnalyticsPage,
  AdminContentPage,
  AdminPlansPage,
  AdminFontDetailPage,
  AdminFontsPage,
  AdminHomePage,
  AdminReviewDetailPage,
  AdminReviewPage,
  AdminUsersPage,
} from './pages/admin';
import { BlogPage, BlogPostPage } from './pages/blog';
import { CartPage } from './pages/cart';
import { CheckoutPage } from './pages/checkout';
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
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogPostPage />} />
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

        {/* لوحة الإدارة — مساحة مستقلّة بعمود جانبي وحارس واحد */}
        <Route path="admin" errorElement={<ErrorBoundary />} element={<AdminLayout />}>
          <Route index element={<AdminHomePage />} />
          <Route path="review" element={<AdminReviewPage />} />
          <Route path="review/:id" element={<AdminReviewDetailPage />} />
          <Route path="fonts" element={<AdminFontsPage />} />
          <Route path="fonts/:id" element={<AdminFontDetailPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="plans" element={<AdminPlansPage />} />
          <Route path="content" element={<AdminContentPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
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
