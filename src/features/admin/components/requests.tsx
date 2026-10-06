import { useSearchParams } from 'react-router';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { AdminPageHeader } from './admin-nav';
import { ManuscriptQueue } from './manuscript-queue';
import { ReviewQueue } from './review-queue';
import { StudioRequests } from './studio-verifications';
import { usePendingManuscripts } from '../api/manuscripts';
import { usePendingCount } from '../api/review';
import { usePendingStudios } from '../api/studios';

type Tab = 'fonts' | 'manuscripts' | 'studios';
const toTab = (v: string | null): Tab => (v === 'studios' || v === 'manuscripts' ? v : 'fonts');

function Count({ n }: { n: number }) {
  return n ? (
    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-tint-brand px-1.5 text-caption font-semibold text-primary tabular-nums">
      {n}
    </span>
  ) : null;
}

/**
 * «الطلبات»: كل ما ينتظر قرار الإدارة في مكان واحد — خطوط ومخطوطات مرفوعة للمراجعة، واستوديوهات
 * تطلب التوثيق. التبويب في العنوان (?type=…) ليبقى الرابط قابلاً للمشاركة والرجوع.
 */
export function Requests() {
  const [params, setParams] = useSearchParams();
  const tab = toTab(params.get('type'));
  const fonts = usePendingCount();
  const studios = usePendingStudios();
  const manuscripts = usePendingManuscripts();
  const total = fonts + studios + manuscripts;
  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="الطلبات"
        description={total ? `${total} بانتظار قرارك — الأقدم أولاً.` : 'لا شيء ينتظر قرارك الآن.'}
      />
      <Tabs value={tab} onValueChange={(v) => setParams(v === 'fonts' ? {} : { type: v }, { replace: true })}>
        <TabsList aria-label="نوع الطلب">
          <TabsTrigger value="fonts" className="inline-flex items-center gap-2">
            خطوط للمراجعة
            <Count n={fonts} />
          </TabsTrigger>
          <TabsTrigger value="manuscripts" className="inline-flex items-center gap-2">
            مخطوطات
            <Count n={manuscripts} />
          </TabsTrigger>
          <TabsTrigger value="studios" className="inline-flex items-center gap-2">
            توثيق استوديوهات
            <Count n={studios} />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="fonts">
          <ReviewQueue embedded />
        </TabsContent>
        <TabsContent value="manuscripts">
          <ManuscriptQueue />
        </TabsContent>
        <TabsContent value="studios">
          <StudioRequests embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}
