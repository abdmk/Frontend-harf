import { Link, Navigate } from 'react-router';

import { Container } from '@/components/layout/container';
import { OrderSummary } from '@/components/shared/order-summary';
import { PageMeta } from '@/components/shared/page-meta';
import { paths } from '@/config/paths';
import { pay } from '@/features/checkout/api/pay';
import { CheckoutForm } from '@/features/checkout/components/checkout-form';
import { requireUser } from '@/lib/auth';
import { buildCart } from '@/lib/commerce/cart-store';

export function CheckoutPage() {
  const user = requireUser();
  if (!user) return <Navigate to={paths.login.getHref(paths.checkout.getHref())} replace />;
  const cart = buildCart();

  return (
    <Container as="main" id="main" className="py-10 sm:py-14">
      <PageMeta title="الدفع" noindex />
      <h1 className="mb-8 text-2xl font-semibold">الدفع</h1>
      {/* بلا عناصر: الحالة الفارغة بعرض الصفحة بدل عمود بجانبه فراغ */}
      <div
        className={
          cart.items.length
            ? 'grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]'
            : undefined
        }
      >
        <div className="order-2 lg:order-1">
          <CheckoutForm user={user} total={cart.total} empty={!cart.items.length} action={pay} />
        </div>
        {cart.items.length > 0 && (
          <OrderSummary
            cart={cart}
            title="طلبك"
            lines
            className="order-1 lg:sticky lg:top-24 lg:order-2"
            headerAction={
              <Link to={paths.cart.getHref()} className="text-caption text-muted-foreground hover:text-foreground">
                تعديل السلة
              </Link>
            }
            note="دفع آمن عبر Stripe. يصلك ملف الترخيص والإيصال فور الدفع."
          />
        )}
      </div>
    </Container>
  );
}
