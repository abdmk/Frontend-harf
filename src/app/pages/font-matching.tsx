import { CatalogCard } from '@/app/_components/catalog-card';
import { Container } from '@/components/layout/container';
import { PageIntro } from '@/components/layout/page-intro';
import { PageMeta } from '@/components/shared/page-meta';
import { Button } from '@/components/ui/button';
import { FontMatchingTool, type ResultCardProps } from '@/features/font-matching/components/font-matching-tool';

/** بطاقة النتيجة = بطاقة الخط نفسها بنصّ المستخدم، مع التشابه وزرّ «قارن» */
function ResultCard({ match, text, selected, onCompare }: ResultCardProps) {
  return (
    <CatalogCard
      font={match.font}
      specimen={{ text, weight: match.weight }}
      meta={
        <>
          تشابه{' '}
          <span dir="ltr" className="font-medium text-foreground tabular-nums">
            {match.score}٪
          </span>
        </>
      }
      className={selected ? 'border-primary ring-2 ring-primary/20' : undefined}
      extra={
        <div className="flex items-center gap-3">
          <div
            role="meter"
            aria-label={`نسبة التشابه مع ${match.font.name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={match.score}
            className="h-1 flex-1 overflow-hidden rounded-full bg-inset"
          >
            <span className="block h-full rounded-full bg-foreground/70" style={{ width: `${match.score}%` }} />
          </div>
          <Button
            variant={selected ? 'secondary' : 'ghost'}
            size="sm"
            aria-pressed={selected}
            onClick={onCompare}
            className="relative z-10 -me-2"
          >
            {selected ? 'في المقارنة' : 'قارن'}
          </Button>
        </div>
      }
    />
  );
}

/** «مطابقة الخطوط» — تُحمَّل كسولاً: المحرّك ومعالجة الصور لا تثقل باقي الموقع */
export function FontMatchingPage() {
  return (
    <Container as="main" id="main" className="py-10 sm:py-14">
      <PageMeta
        title="مطابقة الخطوط"
        description="ارفع صورة فيها كتابة عربية، ونقارن شكل حروفها بخطوط مكتبة حرف — في متصفّحك."
      />
      <PageIntro
        eyebrow="أدوات حرف"
        title="مطابقة الخطوط"
        lead="ارفع صورة فيها كتابة عربية واكتب ما فيها، ونقارن شكل الحروف بخطوط مكتبة حرف — في متصفّحك، ولا تُرفع صورتك إلى أي خادم."
      />
      <FontMatchingTool renderResult={(p) => <ResultCard {...p} />} />
    </Container>
  );
}
