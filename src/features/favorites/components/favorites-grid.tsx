import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { HeartFilledIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';

import { useFavoriteIds } from '../hooks/use-favorites';

/**
 * قسم «المفضلة»: البطاقات تأتي مركّبة من الخادم، وتُصفّى هنا حسب مفضّلة المتصفّح.
 * عند ربط الحساب تُقرأ المفضّلة من الخادم مباشرة.
 */
export function FavoritesGrid({ cards }: { cards: Record<string, ReactNode> }) {
  const ids = useFavoriteIds().filter((id) => id in cards);
  if (!ids.length)
    return (
      <EmptyState
        icon={<HeartFilledIcon />}
        title="لا خطوط في مفضّلتك بعد"
        description="اضغط القلب على أي خط ليظهر هنا وتعود إليه بسهولة."
        action={
          <Button asChild>
            <Link to={paths.home.getHref()}>تصفّح الخطوط المجانية</Link>
          </Button>
        }
      />
    );
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {ids.map((id) => (
        <li key={id} className="flex animate-fade-up [&>*]:w-full">
          {cards[id]}
        </li>
      ))}
    </ul>
  );
}
