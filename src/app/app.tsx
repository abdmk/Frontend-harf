import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { LoadingState } from '@/components/shared/loading-state';

import { ErrorBoundary } from './error';
import { SiteLayout } from './layouts/site-layout';
import { WideLayout } from './layouts/wide-layout';
import {
  AboutPage,
  AccountIndexPage,
  AccountSectionPage,
  AdminAnalyticsPage,
  AdminContentPage,
  AdminFontDetailPage,
  AdminFontsPage,
  AdminHomePage,
  AdminLayout,
  AdminRequestsPage,
  AdminReviewDetailPage,
  AdminStudioDetailPage,
  AdminUsersPage,
  BlogPage,
  BlogPostPage,
  CartPage,
  CheckoutPage,
  DesignerPage,
  DesignSystemPage,
  FontLabPage,
  FontMatchingPage,
  FoundryPage,
  HelpPage,
  LoginPage,
  ManuscriptsPage,
  NasaqPage,
  NasaqPairPage,
  NotificationsPage,
  PrivacyPage,
  PublishPage,
  RegisterPage,
  ReverseTextPage,
  ServicesPage,
  StudioAnalyticsPage,
  StudioFinancePage,
  StudioFontsPage,
  StudioLayout,
  StudioOverviewPage,
  StudioProfilePage,
  StudioVerifyPage,
  TermsPage,
} from './lazy-pages';
// في الحزمة الأولى: أكثر ما يُدخل منه الموقع
import { FontPage } from './pages/font';
import { HomePage } from './pages/home';
import { NotFoundPage } from './pages/not-found';
import { AppProviders } from './providers';
import { ScrollToTop } from './scroll-to-top';

export function App() {
  return (
    <AppProviders>
      <ScrollToTop />
      {/* حاجز أخير لأخطاء التخطيطات وصفحات المصادقة؛ الصفحات داخل التخطيطات لها حاجزها في PageTransition */}
      <ErrorBoundary>
        {/* تخطيطات الاستوديو والإدارة وصفحات الدخول كسولة — تنتظر هنا؛ وداخل التخطيطات PageTransition ينتظر */}
        <Suspense fallback={<LoadingState className="container-page py-14" />}>
          <Routes>
            {/* صفحات الموقع العامة — ترويسة عادية + تذييل */}
            <Route element={<SiteLayout />}>
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
              <Route path="tools/nasaq/:pair" element={<NasaqPairPage />} />
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
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* الحساب — ترويسة عريضة بلا تذييل */}
            <Route element={<WideLayout />}>
              <Route path="account" element={<AccountIndexPage />} />
              <Route path="account/:section" element={<AccountSectionPage />} />
              {/* توثيق الحساب — شريط الموقع العلوي، بلا عمود الاستوديو الجانبي */}
              <Route path="studio/verify" element={<StudioVerifyPage />} />
            </Route>

            {/* الاستوديو — مساحة مستقلّة بعمودها الجانبي */}
            <Route path="studio" element={<StudioLayout />}>
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
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminHomePage />} />
              <Route path="requests" element={<AdminRequestsPage />} />
              <Route path="review/:id" element={<AdminReviewDetailPage />} />
              <Route path="studios/:id" element={<AdminStudioDetailPage />} />
              <Route path="fonts" element={<AdminFontsPage />} />
              <Route path="fonts/:id" element={<AdminFontDetailPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="content" element={<AdminContentPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              {/* عناوين قديمة: المراجعة والتوثيق صارا «الطلبات»، والخطط تبويباً في «المحتوى» */}
              <Route path="review" element={<Navigate to="/admin/requests" replace />} />
              <Route path="studios" element={<Navigate to="/admin/requests?type=studios" replace />} />
              <Route path="plans" element={<Navigate to="/admin/content?tab=plans" replace />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>

            {/* دليل التصميم */}
            <Route element={<WideLayout />}>
              <Route path="design-system" element={<DesignSystemPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AppProviders>
  );
}
