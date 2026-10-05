import { lazy } from 'react';

import { loaders } from './preload';

/*
 * كل صفحة في حزمتها — لا يُحمَّل إلا ما يفتحه الزائر. في الحزمة الأولى: الرئيسية وصفحة الخط والتخطيطات العامة فقط
 * (أكثر ما يُدخل منه الموقع). الصفحات العامة تُسبق عند مرور المؤشّر على رابطها (preload.ts).
 */

// صفحات الأدوات والمكتبة
export const NasaqPage = lazy(() => loaders['/tools/nasaq']().then((m) => ({ default: m.NasaqPage })));
export const NasaqPairPage = lazy(() => import('./pages/nasaq-pair').then((m) => ({ default: m.NasaqPairPage })));
export const FontLabPage = lazy(() => loaders['/tools/font-lab']().then((m) => ({ default: m.FontLabPage })));
export const FontMatchingPage = lazy(() =>
  loaders['/tools/font-matching']().then((m) => ({ default: m.FontMatchingPage })),
);
export const ReverseTextPage = lazy(() =>
  loaders['/tools/reverse-text']().then((m) => ({ default: m.ReverseTextPage })),
);
export const ManuscriptsPage = lazy(() => loaders['/manuscripts']().then((m) => ({ default: m.ManuscriptsPage })));
export const DesignerPage = lazy(() => import('./pages/designer').then((m) => ({ default: m.DesignerPage })));
export const FoundryPage = lazy(() => import('./pages/foundry').then((m) => ({ default: m.FoundryPage })));

// المدوّنة والصفحات الثابتة
export const BlogPage = lazy(() => loaders['/blog']().then((m) => ({ default: m.BlogPage })));
export const BlogPostPage = lazy(() => loaders['/blog']().then((m) => ({ default: m.BlogPostPage })));
const staticPages = () => import('./pages/static-pages');
export const AboutPage = lazy(() => staticPages().then((m) => ({ default: m.AboutPage })));
export const ServicesPage = lazy(() => staticPages().then((m) => ({ default: m.ServicesPage })));
export const HelpPage = lazy(() => staticPages().then((m) => ({ default: m.HelpPage })));
export const TermsPage = lazy(() => staticPages().then((m) => ({ default: m.TermsPage })));
export const PrivacyPage = lazy(() => staticPages().then((m) => ({ default: m.PrivacyPage })));

// الشراء والإشعارات
export const CartPage = lazy(() => loaders['/cart']().then((m) => ({ default: m.CartPage })));
export const CheckoutPage = lazy(() => loaders['/checkout']().then((m) => ({ default: m.CheckoutPage })));
export const NotificationsPage = lazy(() =>
  loaders['/notifications']().then((m) => ({ default: m.NotificationsPage })),
);

// المصادقة والحساب
export const LoginPage = lazy(() => loaders['/login']().then((m) => ({ default: m.LoginPage })));
export const RegisterPage = lazy(() => loaders['/register']().then((m) => ({ default: m.RegisterPage })));
export const AccountIndexPage = lazy(() =>
  import('./pages/account-index').then((m) => ({ default: m.AccountIndexPage })),
);
export const AccountSectionPage = lazy(() =>
  import('./pages/account-section').then((m) => ({ default: m.AccountSectionPage })),
);
export const StudioVerifyPage = lazy(() =>
  import('./pages/studio-verify').then((m) => ({ default: m.StudioVerifyPage })),
);

// الاستوديو
const studio = () => import('./pages/studio');
export const StudioLayout = lazy(() => import('./layouts/studio-layout').then((m) => ({ default: m.StudioLayout })));
export const StudioOverviewPage = lazy(() => studio().then((m) => ({ default: m.StudioOverviewPage })));
export const StudioFontsPage = lazy(() => studio().then((m) => ({ default: m.StudioFontsPage })));
export const StudioAnalyticsPage = lazy(() => studio().then((m) => ({ default: m.StudioAnalyticsPage })));
export const StudioFinancePage = lazy(() => studio().then((m) => ({ default: m.StudioFinancePage })));
export const StudioProfilePage = lazy(() => studio().then((m) => ({ default: m.StudioProfilePage })));
export const PublishPage = lazy(() => import('./pages/publish').then((m) => ({ default: m.PublishPage })));

// الإدارة — لا تصل إلى حزمة الزائر أبداً
export const AdminLayout = lazy(() => import('./layouts/admin-layout').then((m) => ({ default: m.AdminLayout })));
const admin = () => import('./pages/admin');
export const AdminHomePage = lazy(() => admin().then((m) => ({ default: m.AdminHomePage })));
export const AdminRequestsPage = lazy(() => admin().then((m) => ({ default: m.AdminRequestsPage })));
export const AdminReviewDetailPage = lazy(() => admin().then((m) => ({ default: m.AdminReviewDetailPage })));
export const AdminStudioDetailPage = lazy(() => admin().then((m) => ({ default: m.AdminStudioDetailPage })));
export const AdminFontsPage = lazy(() => admin().then((m) => ({ default: m.AdminFontsPage })));
export const AdminFontDetailPage = lazy(() => admin().then((m) => ({ default: m.AdminFontDetailPage })));
export const AdminUsersPage = lazy(() => admin().then((m) => ({ default: m.AdminUsersPage })));
export const AdminContentPage = lazy(() => admin().then((m) => ({ default: m.AdminContentPage })));
export const AdminAnalyticsPage = lazy(() => admin().then((m) => ({ default: m.AdminAnalyticsPage })));

// دليل التصميم
export const DesignSystemPage = lazy(() =>
  import('./pages/design-system').then((m) => ({ default: m.DesignSystemPage })),
);
