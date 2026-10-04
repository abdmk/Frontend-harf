import { Link } from 'react-router';

import { Container } from '@/components/layout/container';
import { PageIntro } from '@/components/layout/page-intro';
import { EmptyState } from '@/components/shared/empty-state';
import { OrderSummary } from '@/components/shared/order-summary';
import { PageMeta } from '@/components/shared/page-meta';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, CartIcon, DownloadIcon, LockIcon, PencilIcon, ReceiptIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { addToCart, applyCoupon, removeFromCart, updateCartItem } from '@/features/cart/api/actions';
import { CartItems } from '@/features/cart/components/cart-items';
import { CouponForm } from '@/features/cart/components/coupon-form';
import { LicenseSheet } from '@/features/licensing/components/license-sheet';
import { useCart } from '@/hooks/use-cart';
import { getPricing } from '@/lib/commerce/cart-store';
import { formatMoney } from '@/lib/format';

const REASSURE = [
  { Icon: LockIcon, tone: 'bg-tint-ok text-ok-text', text: 'دفع آمن عبر Stripe — لا نخزّن بيانات بطاقتك' },
  { Icon: DownloadIcon, tone: 'bg-tint-info text-info-text', text: 'التحميل فور الدفع من «المشتريات» في حسابك' },
  { Icon: ReceiptIcon, tone: 'bg-tint-warn text-warn-text', text: 'تعديل الترخيص متاح قبل الدفع لكل خط' },
] as const;

/** عدد الخطوط بالعربية: خط واحد، خطّان، 3 خطوط، 11 خطاً */
const fontsCount = (n: number) => (n === 1 ? 'خط واحد' : n === 2 ? 'خطّان' : n <= 10 ? `${n} خطوط` : `${n} خطاً`);

/**
 * السلة — مصمّمة لخط واحد أو لعشرة: العناصر في العمود الرئيسي تتراصّ بالبنية نفسها،
 * والملخّص ثابت بجانبها (المجموع الفرعي، الخصم، الإجمالي) وزرّ الشراء أقوى ما في الصفحة.
 * على الجوال: شريط سفلي ثابت بالإجمالي وزرّ الشراء — لا تمرير حتى آخر القائمة للدفع.
 */
export function CartPage() {
  const cart = useCart();
  const pricings = cart.items.map((i) => getPricing(i.selection.fontId));
  const count = cart.items.length;

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
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <PencilIcon />
                تعديل الترخيص<span className="sr-only"> {item.fontName}</span>
              </Button>
            }
          />
        ) : null,
      ];
    }),
  );

  const checkout = (
    <Button asChild size="lg" block>
      <Link to={paths.checkout.getHref()}>
        إتمام الشراء
        <ArrowLeftIcon />
      </Link>
    </Button>
  );

  return (
    <Container as="main" id="main" className="py-8 max-lg:pb-32 sm:py-10">
      <PageMeta title="السلة" />
      <PageIntro
        size="compact"
        title="السلة"
        icon={<CartIcon />}
        count={count}
        className="mb-6"
        aside={
          count > 0 && (
            <Link
              to={paths.home.getHref()}
              className="text-meta text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              متابعة التسوّق
            </Link>
          )
        }
      />

      {count === 0 ? (
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
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
          <CartItems
            items={cart.items}
            onRemove={removeFromCart}
            onRestore={(item) => addToCart(item.selection)}
            edits={edits}
          />
          <div className="flex flex-col gap-3 lg:sticky lg:top-26">
            <OrderSummary
              cart={cart}
              tone="moment"
              subtotalHint={fontsCount(count)}
              coupon={<CouponForm action={applyCoupon} applied={cart.coupon} />}
              action={checkout}
            />
            {/* طمأنة قبل الدفع — حقائق عن الخدمة، لا وعود تسويقية */}
            <ul className="flex flex-col gap-2.5 rounded-lg border bg-card p-4 text-meta">
              {REASSURE.map(({ Icon, tone, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full ${tone}`}>
                    <Icon className="size-4" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* الجوال: الإجمالي وزرّ الشراء في متناول الإبهام دائماً */}
      {count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/90 backdrop-blur-md lg:hidden">
          <div className="container-page flex items-center gap-4 py-3">
            <div className="min-w-0">
              <p className="text-caption text-muted-foreground">الإجمالي · {fontsCount(count)}</p>
              <p dir="ltr" className="text-end text-xl font-semibold tabular-nums">
                {formatMoney(cart.total)}
              </p>
            </div>
            <div className="flex-1">{checkout}</div>
          </div>
        </div>
      )}
    </Container>
  );
}
