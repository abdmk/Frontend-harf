import { AccountMenu } from '@/features/account/components/account-menu';
import { CartMenu } from '@/features/cart/components/cart-menu';
import { NotificationsMenu } from '@/features/notifications/components/notifications-menu';
import { getCurrentUser } from '@/lib/auth';
import { MOCK_NOTIFICATIONS } from '@/mocks/notifications';

/** يُركّب أزرار الترويسة من الـfeatures — الترويسة المشتركة نفسها لا تعرف الـfeatures */
export async function HeaderActions() {
  const user = await getCurrentUser();
  return (
    <>
      <CartMenu />
      <NotificationsMenu initial={MOCK_NOTIFICATIONS} />
      <AccountMenu user={user} />
    </>
  );
}
