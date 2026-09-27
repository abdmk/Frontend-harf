import { redirect } from 'next/navigation';

import { paths } from '@/config/paths';

export default function AccountIndex() {
  redirect(paths.account.getHref('profile'));
}
