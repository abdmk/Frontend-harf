import { Link } from 'react-router';

import { UsageMeter } from '@/components/shared/usage-meter';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DownloadIcon, MagicWandIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import type { User } from '@/features/account/types';

import { SectionCard } from './section-card';

export function UsageSection({ user }: { user: User }) {
  const limited = user.usage.downloads.limit !== null;
  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="حدود اليوم" description={`تتجدّد خلال ${user.usage.resetsInHours} ساعات`}>
        <div className="grid gap-6 sm:grid-cols-2">
          <UsageMeter label="تحميل الخطوط" icon={<DownloadIcon />} meter={user.usage.downloads} />
          <UsageMeter label="مطابقة الخطوط" icon={<MagicWandIcon />} meter={user.usage.matching} />
        </div>
      </SectionCard>
      {limited && (
        <Alert
          tone="info"
          title="تحتاج أكثر؟"
          description="الخطة الأساسية ترفع حدّ التحميل والمطابقة. الحدود والأسعار الحالية أمثلة تجريبية."
          actions={
            <Button asChild size="sm" variant="ghost" className="text-info-text">
              <Link to={paths.account.getHref('subscription')}>عرض الخطط</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
