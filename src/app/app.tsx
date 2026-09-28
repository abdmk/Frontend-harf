import { Route, Routes } from 'react-router';

import { ErrorBoundary } from './error';
import { SiteLayout } from './layouts/site-layout';
import { WideLayout } from './layouts/wide-layout';
import { AccountIndexPage } from './pages/account-index';
import { AccountSectionPage } from './pages/account-section';
import { AnalyticsPage } from './pages/analytics';
import { CartPage } from './pages/cart';
import { CheckoutPage } from './pages/checkout';
import { DesignSystemPage } from './pages/design-system';
import { FontPage } from './pages/font';
import { FoundryPage } from './pages/foundry';
import { HomePage } from './pages/home';
import { LoginPage } from './pages/login';
import { NotFoundPage } from './pages/not-found';
import { NotificationsPage } from './pages/notifications';
import { PublishPage } from './pages/publish';
import { RegisterPage } from './pages/register';
import { StudioPage } from './pages/studio';
import { AppProviders } from './providers';

export function App() {
  return (
    <AppProviders>
      <Routes>
        {/* صفحات الموقع العامة — ترويسة عادية + تذييل */}
        <Route errorElement={<ErrorBoundary />} element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="fonts/:id" element={<FontPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="foundries/:id" element={<FoundryPage />} />
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

        {/* الاستوديو — ترويسة عريضة */}
        <Route errorElement={<ErrorBoundary />} element={<WideLayout />}>
          <Route path="studio" element={<StudioPage />} />
          <Route path="studio/publish" element={<PublishPage />} />
        </Route>

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
