import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { AccountMenu } from '@/features/account/components/account-menu';
import { removeFromCart } from '@/features/cart/api/actions';
import { CartMenu } from '@/features/cart/components/cart-menu';
import { getNotifications } from '@/features/notifications/api/get-notifications';
import { NotificationsMenu } from '@/features/notifications/components/notifications-menu';
import { changePlan } from '@/features/subscriptions/api/actions';
import { usePlans } from '@/features/subscriptions/api/get-subscription';
import { PlansDialog } from '@/features/subscriptions/components/plans-dialog';
import { useCart } from '@/hooks/use-cart';
import { useCurrentUser } from '@/hooks/use-current-user';
import { clearWelcome, isWelcomePending } from '@/lib/auth';
import { onPlansRequest } from '@/stores/plans-request';
import type { Plan } from '@/types/domain/user';

export function HeaderActions() {
  const user = useCurrentUser();
  const cart = useCart();
  const plans = usePlans();
  // نافذة الخطط خارج قائمة الحساب: إغلاق القائمة لا يُسقطها
  // أول دخول بعد إنشاء الحساب: نافذة الخطط تُفتح مرّة واحدة بوضع الترحيب («تابع مجاناً»)
  const [welcome, setWelcome] = useState(() => !!user && isWelcomePending());
  const [plansOpen, setPlansOpen] = useState(welcome);
  const avatarRef = useRef<HTMLButtonElement>(null);
  // طلبات الفتح من خارج الترويسة (العمود الجانبي، بطاقة التحويل)
  const [startWith, setStartWith] = useState<Plan>();
  useEffect(
    () =>
      onPlansRequest((plan) => {
        setStartWith(plan);
        setPlansOpen(true);
      }),
    [],
  );
  return (
    <>
      <CartMenu cart={cart} onRemove={removeFromCart} />
      {user ? (
        <>
          <NotificationsMenu initial={getNotifications(user)} allHref={paths.notifications.getHref()} />
          <AccountMenu user={user} onManagePlan={() => setPlansOpen(true)} triggerRef={avatarRef} />
          <PlansDialog
            plans={plans}
            current={user.plan}
            onChange={changePlan}
            open={plansOpen}
            startWith={startWith}
            onOpenChange={(v) => {
              setPlansOpen(v);
              if (!v) setStartWith(undefined);
              if (!v && welcome) {
                clearWelcome();
                setWelcome(false);
              }
            }}
            welcome={welcome}
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
