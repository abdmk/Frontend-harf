import { useSearchParams } from 'react-router';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { AdminPageHeader } from './admin-nav';
import { ReviewQueue } from './review-queue';
import { StudioRequests } from './studio-verifications';
import { usePendingCount } from '../api/review';
import { usePendingStudios } from '../api/studios';

type Tab = 'fonts' | 'studios';

function Count({ n }: { n: number }) {
  return n ? (
    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-tint-brand px-1.5 text-caption font-semibold text-primary tabular-nums">
      {n}
    </span>
  ) : null;
}

/**
 * «الطلبات»: كل ما ينتظر قرار الإدارة في مكان واحد — خطوط مرفوعة للمراجعة، واستوديوهات تطلب
 * التوثيق. التبويب في العنوان (?type=studios) ليبقى الرابط قابلاً للمشاركة والرجوع.
 */
export function Requests() {
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get('type') === 'studios' ? 'studios' : 'fonts';
  const fonts = usePendingCount();
  const studios = usePendingStudios();
  const total = fonts + studios;
  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="الطلبات"
        description={total ? `${total} بانتظار قرارك — الأقدم أولاً.` : 'لا شيء ينتظر قرارك الآن.'}
      />
      <Tabs value={tab} onValueChange={(v) => setParams(v === 'studios' ? { type: 'studios' } : {}, { replace: true })}>
        <TabsList aria-label="نوع الطلب">
          <TabsTrigger value="fonts" className="inline-flex items-center gap-2">
            خطوط للمراجعة
            <Count n={fonts} />
          </TabsTrigger>
          <TabsTrigger value="studios" className="inline-flex items-center gap-2">
            توثيق استوديوهات
            <Count n={studios} />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="fonts">
          <ReviewQueue embedded />
        </TabsContent>
        <TabsContent value="studios">
          <StudioRequests embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}
