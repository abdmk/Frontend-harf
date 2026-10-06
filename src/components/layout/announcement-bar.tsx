import { Link } from 'react-router';

import { ArrowLeftIcon } from '@/components/ui/icons';
import { isExternalLink, safeContentLink, useSiteContent } from '@/stores/site-content';

/** شريط إعلان أعلى الموقع — نصّه ورابطه من لوحة الإدارة («المحتوى»)، ولا يظهر ما لم يُفعَّل */
export function AnnouncementBar() {
  const { announcement: a } = useSiteContent();
  if (!a.active || !a.text) return null;
  const href = safeContentLink(a.href);
  const cls = 'inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline';
  const more = (
    <>
      التفاصيل
      <ArrowLeftIcon className="size-3.5" />
    </>
  );
  return (
    <div role="region" aria-label="إعلان" className="bg-ink text-ink-foreground">
      <p className="container-page flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2.5 text-center text-meta">
        <span>{a.text}</span>
        {href &&
          (isExternalLink(href) ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
              {more}
            </a>
          ) : (
            <Link to={href} className={cls}>
              {more}
            </Link>
          ))}
      </p>
    </div>
  );
}
