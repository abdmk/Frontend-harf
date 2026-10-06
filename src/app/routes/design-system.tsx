import { Link } from 'react-router';

import { CatalogCard } from '@/app/_components/catalog-card';
import { DesignerCard } from '@/components/shared/designer-card';
import { FileIcon } from '@/components/shared/file-icon';
import { FontGridSkeleton, LoadingState } from '@/components/shared/loading-state';
import { OrderSummary } from '@/components/shared/order-summary';
import { PageMeta } from '@/components/shared/page-meta';
import { PriceDisplay } from '@/components/shared/price-display';
import { StatCard } from '@/components/shared/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartHistogramIcon, CheckIcon, ClockIcon, CrossIcon, DownloadIcon } from '@/components/ui/icons';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { paths } from '@/config/paths';
import { AccountPanel } from '@/features/account/components/account-panel';
import { CartLine } from '@/features/cart/components/cart-line';
import { PaymentResult } from '@/features/checkout/components/checkout-form';
import { WeightWaterfall } from '@/features/font-details/components/weight-waterfall';
import { FontTester } from '@/features/font-tester/components/font-tester';
import { PurchaseActions } from '@/features/licensing/components/purchase-actions';
import { getNotifications } from '@/features/notifications/api/get-notifications';
import { NotificationsMenu } from '@/features/notifications/components/notifications-menu';
import { NotificationsPanel } from '@/features/notifications/components/notifications-panel';
import { UploadDialog } from '@/features/publishing/components/upload-dialog';
import { getPlans } from '@/features/subscriptions/api/get-subscription';
import { PlansDialog } from '@/features/subscriptions/components/plans-dialog';
import { MOCK_FONTS } from '@/mocks/fonts';
import { MOCK_USERS } from '@/mocks/users';
import { getPricing } from '@/stores/cart';
import { type Cart, cents, usd } from '@/types/domain/commerce';
import { CATEGORIES } from '@/types/domain/font';
import { CATEGORY_LABEL } from '@/utils/labels';

import { ComponentsDemo } from '../design-system/_components/components-demo';
import { demoPlan, demoSubmit } from '../design-system/_components/demo-actions';
import { DsPanel, DsSection } from '../design-system/_components/ds-section';
import { Foundations } from '../design-system/_components/foundations';
import { GradientsDemo } from '../design-system/_components/gradients-demo';
import { DS_GROUPS } from '../design-system/_components/nav-items';
import { DataPatternsDemo, NavigationDemo } from '../design-system/_components/patterns-demo';

const STATUS_BADGE = {
  published: ['success', CheckIcon, 'منشور'],
  review: ['info', ClockIcon, 'قيد المراجعة'],
  rejected: ['danger', CrossIcon, 'مرفوض'],
} as const;

export function DesignSystemPage() {
  const naskhPricing = getPricing('naskh');
  const trialPricing = getPricing('roobert');
  const plans = getPlans();
  const notifications = getNotifications(MOCK_USERS.studio);

  const demoCart: Cart = {
    items: [
      {
        id: 'demo0001',
        selection: { fontId: 'naskh', package: 'single', weightId: 'regular', uses: { web: 'w10k' } },
        fontName: 'Naskh Hadith',
        foundry: 'سارة نبيل',
        summary: ['وزن عادي', 'موقع إلكتروني · حتى 10 آلاف زيارة/شهر'],
        price: cents(1800),
      },
    ],
    subtotal: cents(1800),
    discount: cents(0),
    total: cents(1800),
  };
  const cards = [
    MOCK_FONTS.find((f) => f.type === 'free'),
    MOCK_FONTS.find((f) => f.type === 'trial'),
    MOCK_FONTS.find((f) => f.type === 'paid'),
  ].filter((f) => f !== undefined);
  const rows = MOCK_FONTS.slice(0, 4).map((f, i) => ({
    font: f,
    status: (['published', 'published', 'review', 'rejected'] as const)[i]!,
    downloads: [38461, 12904, null, null][i] ?? null,
  }));

  return (
    <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-10 py-10 lg:grid-cols-[220px_minmax(0,1fr)]">
      <PageMeta title="دليل تصميم حرف" noindex />
      <aside className="max-lg:hidden">
        <nav
          aria-label="فهرس الدليل"
          className="sticky top-24 flex max-h-[calc(100dvh-7rem)] flex-col gap-5 overflow-y-auto pb-8"
        >
          {DS_GROUPS.map((g) => (
            <div key={g.title}>
              <p className="mb-2 text-caption font-medium text-tertiary">{g.title}</p>
              <ul className="flex flex-col">
                {g.items.map(([id, num, label]) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className="flex h-8 items-center gap-2 rounded-xs px-2 text-control text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground"
                    >
                      <span dir="ltr" className="w-7 font-mono text-micro text-tertiary">
                        {num}
                      </span>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <main id="main" className="min-w-0">
        <header className="mb-12">
          <h1 className="text-display font-semibold">دليل تصميم حرف</h1>
          <p className="mt-2 max-w-[60ch] text-control text-muted-foreground">
            كل ما هنا هو المكوّن الحقيقي المستعمل في الموقع بحالاته. المصدر الوحيد للقيم:{' '}
            <code dir="ltr" className="rounded-xs bg-sunken px-1.5 font-mono text-caption">
              src/design-system/tokens.css
            </code>
            .
          </p>
        </header>

        <Foundations />
        <GradientsDemo />
        <ComponentsDemo />

        <DsSection
          id="upload-field"
          num="2.9"
          title="الرفع"
          en="Upload"
          note="منطقة الإفلات تعمل بالنقر ولوحة المفاتيح. التحقّق من النوع والحجم هنا للتجربة فقط، ويتكرّر على الخادم."
        >
          <DsPanel>
            <UploadDialog>
              <Button>افتح نافذة «تحميل الملفات»</Button>
            </UploadDialog>
          </DsPanel>
        </DsSection>

        <DsSection
          id="nav"
          num="3.1"
          title="ترويسة الموقع"
          en="Website Header"
          note="الترويسة أعلى هذه الصفحة هي المكوّن نفسه: مؤشّر أحمر ينزلق تحت القسم الحالي، وتنتقل الأقسام إلى سطر ثانٍ قابل للتمرير تحت 1024px."
        />

        <DsSection
          id="notif"
          num="3.2"
          title="الإشعارات"
          en="Notifications"
          note="الجرس يفتح قائمة مجمّعة (اليوم، هذا الأسبوع، أقدم) بلون لكل نوع، وتمييز غير المقروء، و«عرض كل الإشعارات» إلى صفحتها."
        >
          <DsPanel className="flex justify-center">
            <NotificationsMenu initial={notifications} allHref={paths.notifications.getHref()} />
          </DsPanel>
          <div className="mt-4 max-w-xl">
            <NotificationsPanel initial={notifications} />
          </div>
        </DsSection>

        <NavigationDemo />

        <DsSection
          id="account-menu"
          num="3.7"
          title="قائمة الحساب"
          en="Account Menu"
          note="مكوّن واحد في مكانين: قائمة الصورة في الترويسة والعمود الجانبي لصفحة الحساب. المجاني يرى دعوة التحويل، والاستوديو يرى «الاستوديو»."
        >
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
            <DsPanel label="حساب مجاني">
              <AccountPanel user={MOCK_USERS.free} variant="menu" />
            </DsPanel>
            <DsPanel label="حساب استوديو">
              <AccountPanel user={MOCK_USERS.studio} variant="menu" />
            </DsPanel>
          </div>
        </DsSection>

        <DsSection
          id="cards"
          num="4.1"
          title="البطاقات"
          en="Cards"
          note="بطاقة الخط في 5.1. بطاقات الأرقام للوحات الإحصاء والأرباح."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="التحميلات" value="38,461" delta={12.4} icon={<DownloadIcon />} hint="آخر 30 يوماً" />
            <StatCard label="المشاهدات" value="3,689" delta={-3.1} icon={<ChartHistogramIcon />} hint="آخر 30 يوماً" />
            <StatCard label="الخطوط المنشورة" value="9" />
          </div>
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
            <DesignerCard
              id="sn"
              name="سعد النهدي"
              initials="SN"
              subtitle="مسبك ابن ثابت · بغداد"
              verified
              stats={{ fonts: 9, weights: 41, followers: 612 }}
              fonts={['طفولة', 'تجاريب', 'نقوش']}
            />
            <DesignerCard
              id="ma"
              name="ميس علي"
              initials="MA"
              subtitle="مصمّمة حروف مستقلّة · أربيل"
              stats={{ fonts: 4, weights: 17, followers: 197 }}
              fonts={['ميس', 'أثر', 'رواق']}
              following
            />
          </div>
        </DsSection>

        <DsSection
          id="table"
          num="4.2"
          title="الجداول"
          en="Tables"
          note="على الشاشات الضيّقة يُمرَّر الجدول أفقياً داخل حاويته فقط."
        >
          <DsPanel className="p-2 sm:p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الخط</TableHead>
                  <TableHead>المصمم</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التحميلات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ font, status, downloads }) => {
                  const [tone, Icon, label] = STATUS_BADGE[status];
                  return (
                    <TableRow key={font.id}>
                      <TableCell>
                        <span className="font-medium">{font.name}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{font.designerLabel}</TableCell>
                      <TableCell>
                        <Badge tone={tone} icon={<Icon />}>
                          {label}
                        </Badge>
                      </TableCell>
                      <TableCell dir="ltr" className="text-end font-medium">
                        {downloads?.toLocaleString('en-US') ?? '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </DsPanel>
        </DsSection>

        <DataPatternsDemo />

        <DsSection
          id="loading"
          num="4.6"
          title="التحميل"
          en="Loading"
          note="هياكل بأبعاد المحتوى الحقيقي كي لا تقفز الصفحة، وإعلان لقارئ الشاشة."
        >
          <DsPanel>
            <LoadingState lines={3} className="mb-8 max-w-md" />
            <FontGridSkeleton count={3} />
          </DsPanel>
        </DsSection>

        <DsSection
          id="font-card"
          num="5.1"
          title="بطاقة الخط"
          en="Font Card"
          note="ثلاث حالات حسب نوع الخط: مجاني، تجريبي، مدفوع. المفضّلة والتحميل حيّان."
        >
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((f) => (
              <li key={f.id} className="flex [&>*]:w-full">
                <CatalogCard font={f} />
              </li>
            ))}
          </ul>
        </DsSection>

        <DsSection id="font-tester" num="5.2" title="مختبر الخط" en="Font Tester" note="من تصميم صفحة الخط.">
          <FontTester />
        </DsSection>

        <DsSection id="weights" num="5.3" title="الأوزان" en="Weights">
          <WeightWaterfall variable />
        </DsSection>

        <DsSection id="taxo" num="5.4" title="التصنيفات" en="Categories" status="reference">
          <DsPanel className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                to={`/?cat=${c}`}
                className="inline-flex h-10 items-center rounded-full border bg-card px-5 text-control text-muted-foreground transition-colors hover:border-strong hover:text-foreground"
              >
                {CATEGORY_LABEL[c]}
              </Link>
            ))}
          </DsPanel>
        </DsSection>

        <DsSection
          id="price"
          num="5.5"
          title="السعر"
          en="Price Display"
          note="الأسعار المعروضة هنا أمثلة تجريبية، ولا تمثّل قراراً تجارياً. السعر النهائي يُحسب على الخادم."
        >
          <DsPanel className="flex flex-wrap items-end gap-10">
            <PriceDisplay price={usd(0)} />
            <PriceDisplay price={usd(49)} size="lg" />
            <PriceDisplay price={usd(39)} compareAt={usd(49)} />
            <PriceDisplay price={usd(9.5)} suffix="/ شهرياً" size="sm" />
          </DsPanel>
        </DsSection>

        <DsSection
          id="licensing"
          num="5.5"
          title="صندوق السعر ولوحة الترخيص"
          en="Price Box / License Sheet"
          note="الأسعار والنطاقات بيانات تجريبية، والخادم يعيد الحساب عند الإضافة وعند الدفع. «ضمن خطة» حالة مدعومة في الأنواع ولا تُفعَّل حتى تُقرّر سياسة الاشتراك."
        >
          {naskhPricing && trialPricing && (
            <div className="flex flex-col gap-4">
              <DsPanel label="مدفوع — افتح «شراء الترخيص» لرؤية اللوحة">
                <PurchaseActions
                  font={{ id: 'naskh', name: 'Naskh Hadith', type: 'paid' }}
                  foundry="سارة نبيل"
                  pricing={naskhPricing}
                  onSubmit={demoSubmit}
                />
              </DsPanel>
              <DsPanel label="تجريبي">
                <PurchaseActions
                  font={{ id: 'roobert', name: 'Roobert Arabic TRIAL', type: 'trial' }}
                  foundry="Mathieu Desjardins"
                  pricing={trialPricing}
                  onSubmit={demoSubmit}
                />
              </DsPanel>
              <DsPanel label="مملوك">
                <PurchaseActions
                  font={{ id: 'naskh', name: 'Naskh Hadith', type: 'paid' }}
                  foundry="سارة نبيل"
                  pricing={naskhPricing}
                  ownership="owned"
                  licenseId="HRF-24918"
                  onSubmit={demoSubmit}
                />
              </DsPanel>
            </div>
          )}
        </DsSection>

        <DsSection
          id="cart"
          num="5.6"
          title="السلة"
          en="Cart"
          note="سلة واحدة بحالتها في الترويسة والصفحة والدفع. العنصر ترخيص كامل، والسعر محسوب على الخادم. كود الخصم التجريبي: HARF10."
        >
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
            <DsPanel label="سطر في السلة المصغّرة" className="p-2">
              {demoCart.items.map((i) => (
                <CartLine key={i.id} item={i} />
              ))}
            </DsPanel>
            <OrderSummary cart={demoCart} />
          </div>
        </DsSection>

        <DsSection
          id="checkout"
          num="5.7"
          title="الدفع"
          en="Checkout (Stripe)"
          note="حقول البطاقة في /checkout شكلية للعرض؛ في المنتج يحلّ محلّها Stripe Elements، والتسليم من webhook موقّع فقط."
        >
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-3">
            <PaymentResult kind="processing" total={cents(12500)} />
            <PaymentResult kind="paid" total={cents(12500)} />
            <PaymentResult kind="declined" total={cents(12500)} message="رفض المصرف العملية، ولم يُخصم أي مبلغ." />
          </div>
        </DsSection>

        <DsSection
          id="auth"
          num="6.1"
          title="الدخول وإنشاء الحساب"
          en="Authentication"
          note="التحقّق على الخادم، حدّ للمحاولات، رسائل لا تكشف إن كان البريد مسجّلاً، ولا توجيه بعد الدخول إلا إلى مسار داخلي."
        >
          <DsPanel className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to={paths.login.getHref()}>صفحة الدخول</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={paths.register.getHref()}>صفحة حساب جديد</Link>
            </Button>
          </DsPanel>
        </DsSection>

        <DsSection
          id="account"
          num="6.2"
          title="حساب المستخدم"
          en="User Account"
          note="على الجوال: ‎/account فهرس بالقائمة، وكل قسم صفحة بزرّ رجوع."
        >
          <DsPanel className="flex flex-wrap gap-3">
            {(['profile', 'purchases', 'usage', 'preferences', 'security'] as const).map((s) => (
              <Button key={s} asChild variant="outline" size="sm">
                <Link to={paths.account.getHref(s)}>{s}</Link>
              </Button>
            ))}
          </DsPanel>
        </DsSection>

        <DsSection
          id="subs"
          num="6.3"
          title="الاشتراك"
          en="Subscriptions"
          note="الأسعار والمزايا منقولة من تصميم «اختر خطتك» كبيانات تجريبية، ولا تمثّل قراراً تجارياً."
        >
          <DsPanel>
            <PlansDialog plans={plans} current="free" onChange={demoPlan} trigger={<Button>افتح نافذة الخطط</Button>} />
          </DsPanel>
        </DsSection>

        <DsSection
          id="studio"
          num="6.4–6.6"
          title="الاستوديو والنشر والتحليلات"
          en="Studio · Publish · Dashboard"
          note="صفحات كاملة محميّة بالدور على الخادم: الاستوديو لحساب الاستوديو، والتحليلات للمشرف وحده (غيره يرى 404)."
        >
          <DsPanel className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to={paths.studio.getHref()}>الاستوديو</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={paths.studio.getHref('publish')}>مساحة النشر</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={paths.foundry.getHref('tajarib')}>صفحة المسبك</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={paths.admin.getHref('analytics')}>التحليلات</Link>
            </Button>
          </DsPanel>
        </DsSection>

        <DsSection
          id="files"
          num="5.8"
          title="أيقونات الملفات"
          en="File Icons"
          note="من تصميم نافذة الرفع. أي امتداد غير معروف يظهر بأيقونة عامة."
        >
          <DsPanel className="flex flex-wrap gap-8">
            {(['pdf', 'otf', 'ttf', 'zip', 'file'] as const).map((k) => (
              <span key={k} className="flex flex-col items-center gap-2">
                <FileIcon kind={k} className="size-12" />
                <span dir="ltr" className="font-mono text-caption text-tertiary">
                  {k}
                </span>
              </span>
            ))}
          </DsPanel>
        </DsSection>
      </main>
    </div>
  );
}
