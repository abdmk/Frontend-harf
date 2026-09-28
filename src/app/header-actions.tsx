import { useRef, useState } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { AccountMenu } from '@/features/account/components/account-menu';
import { removeFromCart } from '@/features/cart/api/actions';
import { CartMenu } from '@/features/cart/components/cart-menu';
import { getNotifications } from '@/features/notifications/api/get-notifications';
import { NotificationsMenu } from '@/features/notifications/components/notifications-menu';
import { changePlan } from '@/features/subscriptions/api/actions';
import { getPlans } from '@/features/subscriptions/api/get-subscription';
import { PlansDialog } from '@/features/subscriptions/components/plans-dialog';
import { useCart } from '@/hooks/use-cart';
import { useCurrentUser } from '@/hooks/use-current-user';

export function HeaderActions() {
  const user = useCurrentUser();
  const cart = useCart();
  // نافذة الخطط خارج قائمة الحساب: إغلاق القائمة لا يُسقطها
  const [plansOpen, setPlansOpen] = useState(false);
  const avatarRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <CartMenu cart={cart} onRemove={removeFromCart} />
      {user ? (
        <>
          <NotificationsMenu initial={getNotifications(user)} allHref={paths.notifications.getHref()} />
          <AccountMenu user={user} onManagePlan={() => setPlansOpen(true)} triggerRef={avatarRef} />
          <PlansDialog
            plans={getPlans()}
            current={user.plan}
            onChange={changePlan}
            open={plansOpen}
            onOpenChange={setPlansOpen}
            returnFocusTo={avatarRef}
          />
        </>
      ) : (
        <Button asChild size="sm" shape="pill" className="ms-1">
          <Link to={paths.login.getHref()}>تسجيل الدخول</Link>
        </Button>
      )}
    </>
  );
}
