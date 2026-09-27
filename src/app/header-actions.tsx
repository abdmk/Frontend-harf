import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { AccountMenu } from '@/features/account/components/account-menu';
import { removeFromCart } from '@/features/cart/api/actions';
import { CartMenu } from '@/features/cart/components/cart-menu';
import { getNotifications } from '@/features/notifications/api/get-notifications';
import { NotificationsMenu } from '@/features/notifications/components/notifications-menu';
import { getCurrentUser } from '@/lib/auth';
import { buildCart } from '@/lib/commerce/server';

export function HeaderActions() {
  const user = getCurrentUser();
  const cart = buildCart();
  return (
    <>
      <CartMenu cart={cart} onRemove={removeFromCart} />
      {user ? (
        <>
          <NotificationsMenu initial={getNotifications(user)} allHref={paths.notifications.getHref()} />
          <AccountMenu user={user} />
        </>
      ) : (
        <Button asChild size="sm" shape="pill" className="ms-1">
          <Link to={paths.login.getHref()}>تسجيل الدخول</Link>
        </Button>
      )}
    </>
  );
}
