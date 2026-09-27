import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { AccountMenu } from '@/features/account/components/account-menu';
import { removeFromCart } from '@/features/cart/api/actions';
import { CartMenu } from '@/features/cart/components/cart-menu';
import { NotificationsMenu } from '@/features/notifications/components/notifications-menu';
import { getCurrentUser } from '@/lib/auth';
import { buildCart } from '@/lib/commerce/server';
import { MOCK_NOTIFICATIONS } from '@/mocks/notifications';

/** يُركّب أزرار الترويسة من الـfeatures — الترويسة المشتركة نفسها لا تعرف الـfeatures */
export async function HeaderActions() {
  const [user, cart] = await Promise.all([getCurrentUser(), buildCart()]);
  return (
    <>
      <CartMenu cart={cart} onRemove={removeFromCart} />
      {user ? (
        <>
          <NotificationsMenu initial={MOCK_NOTIFICATIONS} />
          <AccountMenu user={user} />
        </>
      ) : (
        <Button asChild size="sm" shape="pill" className="ms-1">
          <Link href={paths.login.getHref()}>تسجيل الدخول</Link>
        </Button>
      )}
    </>
  );
}
