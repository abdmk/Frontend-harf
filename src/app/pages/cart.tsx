import { Link } from 'react-router';

import { Container } from '@/components/layout/container';
import { EmptyState } from '@/components/shared/empty-state';
import { OrderSummary } from '@/components/shared/order-summary';
import { Button } from '@/components/ui/button';
import { CartIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { applyCoupon, removeFromCart, updateCartItem } from '@/features/cart/api/actions';
import { CartItems } from '@/features/cart/components/cart-items';
import { CouponForm } from '@/features/cart/components/coupon-form';
import { LicenseSheet } from '@/features/licensing/components/license-sheet';
import { buildCart, getPricing } from '@/lib/commerce/server';

export function CartPage() {
  const cart = buildCart();
  const pricings = cart.items.map((i) => getPricing(i.selection.fontId));

  const edits = Object.fromEntries(
    cart.items.map((item, i) => {
      const pricing = pricings[i];
      return [
        item.id,
        pricing ? (
          <LicenseSheet
            key={item.id}
            fontName={item.fontName}
            foundry={item.foundry}
            pricing={pricing}
            initial={item.selection}
            submitLabel="حفظ التعديل"
            onSubmit={(sel) => updateCartItem(item.id, sel)}
            trigger={
              <button type="button" className="font-medium text-primary hover:underline">
                تعديل الترخيص<span className="sr-only"> {item.fontName}</span>
              </button>
            }
          />
        ) : null,
      ];
    }),
  );

  return (
    <Container as="main" id="main" className="py-10 sm:py-14">
      <h1 className="mb-8 flex items-center gap-3 text-2xl font-semibold">
        <CartIcon className="size-6" />
        السلة
        {cart.items.length > 0 && (
          <span dir="ltr" className="grid size-7 place-items-center rounded-full bg-sunken text-meta font-medium">
            {cart.items.length}
          </span>
        )}
      </h1>

      {cart.items.length === 0 ? (
        <EmptyState
          icon={<CartIcon />}
          title="سلتك فارغة"
          description="اختر ترخيصاً من صفحة أي خط مدفوع، وسيظهر هنا بتفاصيله."
          action={
            <Button asChild>
              <Link to={paths.home.getHref()}>تصفّح الخطوط</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <CartItems items={cart.items} onRemove={removeFromCart} edits={edits} />
          <OrderSummary
            cart={cart}
            className="lg:sticky lg:top-24"
            coupon={<CouponForm action={applyCoupon} />}
            action={
              <Button asChild size="lg" block>
                <Link to={paths.checkout.getHref()}>إتمام الشراء</Link>
              </Button>
            }
          />
        </div>
      )}
    </Container>
  );
}
