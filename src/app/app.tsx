import { Route, Routes } from 'react-router';

import { AppProviders } from './providers';
import { SiteLayout } from './layouts/site-layout';
import { WideLayout } from './layouts/wide-layout';
import { NotFoundPage } from './pages/not-found';

import { HomePage } from './pages/home';
import { FontPage } from './pages/font';
import { CartPage } from './pages/cart';
import { CheckoutPage } from './pages/checkout';
import { NotificationsPage } from './pages/notifications';
import { FoundryPage } from './pages/foundry';
import { LoginPage } from './pages/login';
import { RegisterPage } from './pages/register';
import { AccountIndexPage } from './pages/account-index';
import { AccountSectionPage } from './pages/account-section';
import { StudioPage } from './pages/studio';
import { PublishPage } from './pages/publish';
import { AnalyticsPage } from './pages/analytics';
import { DesignSystemPage } from './pages/design-system';

export function App() {
  return (
    <AppProviders>
      <Routes>
        {/* صفحات الموقع العامة — ترويسة عادية + تذييل */}
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="fonts/:id" element={<FontPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="foundries/:id" element={<FoundryPage />} />
        </Route>

        {/* المصادقة — بلا ترويسة */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* الحساب — ترويسة عريضة بلا تذييل */}
        <Route element={<WideLayout />}>
          <Route path="account" element={<AccountIndexPage />} />
          <Route path="account/:section" element={<AccountSectionPage />} />
        </Route>

        {/* الاستوديو — ترويسة عريضة */}
        <Route element={<WideLayout />}>
          <Route path="studio" element={<StudioPage />} />
          <Route path="studio/publish" element={<PublishPage />} />
        </Route>

        {/* المشرف */}
        <Route element={<WideLayout />}>
          <Route path="admin/analytics" element={<AnalyticsPage />} />
        </Route>

        {/* دليل التصميم */}
        <Route element={<WideLayout />}>
          <Route path="design-system" element={<DesignSystemPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppProviders>
  );
}
