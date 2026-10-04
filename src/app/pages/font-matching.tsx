import { CatalogCard } from '@/app/_components/catalog-card';
import { Container } from '@/components/layout/container';
import { ToolHero } from '@/components/layout/tool-hero';
import { PageMeta } from '@/components/shared/page-meta';
import { Button } from '@/components/ui/button';
import { MagicWandIcon } from '@/components/ui/icons';
import { FontMatchingTool, type ResultCardProps } from '@/features/font-matching/components/font-matching-tool';
import { cn } from '@/lib/cn';

/** درجة التطابق: اللون مع كلمة تصفه — لا يُقرأ المعنى من اللون وحده */
function matchTone(score: number) {
  if (score >= 75) return { label: 'تطابق عالٍ', bar: 'bg-ok-500', text: 'text-ok-text' };
  if (score >= 50) return { label: 'تطابق متوسط', bar: 'bg-warn-500', text: 'text-warn-text' };
  return { label: 'تطابق ضعيف', bar: 'bg-dgr-500', text: 'text-dgr-text' };
}

/**
 * بطاقة النتيجة = بطاقة الخط نفسها في الموقع (CatalogCard) — لا نمط جديد. ما تغيّر هو ترتيب المعلومة فقط:
 * نسبة التطابق في مكان «الأوزان» بجانب الاسم، شريط رفيع بلون الدرجة، ثم سطر هادئ: الدرجة + «قارن».
 * العيّنة أقصر قليلاً (wide) لأن نصّ المستخدم كلمة أو كلمتان — بلا فراغ ميّت فوقها وتحتها.
 */
function ResultCard({ match, text, selected, onCompare }: ResultCardProps) {
  const tone = matchTone(match.score);
  return (
    <CatalogCard
      font={match.font}
      specimen={{ text, weight: match.weight }}
      specimenRatio="wide"
      meta={
        <>
          تطابق{' '}
          <span dir="ltr" className="font-medium text-foreground tabular-nums">
            {match.score}%
          </span>
        </>
      }
      // المحدَّدة للمقارنة: حدّ أوضح بدرجة واحدة فقط — لا إطار أحمر
      className={selected ? 'border-strong shadow-soft' : undefined}
      extra={
        <div className="flex flex-col gap-2">
          <div
            role="meter"
            aria-label={`نسبة التشابه مع ${match.font.name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={match.score}
            aria-valuetext={`${match.score}٪ — ${tone.label}`}
            className="h-1 overflow-hidden rounded-full bg-inset"
          >
            <span
              className={cn('block h-full animate-grow-x rounded-full ltr:origin-left rtl:origin-right', tone.bar)}
              style={{ width: `${match.score}%` }}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className={cn('text-caption font-medium', tone.text)}>{tone.label}</span>
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
        </div>
      }
    />
  );
}

/** «عين» (مطابقة الخطوط) — تُحمَّل كسولاً: المحرّك ومعالجة الصور لا تثقل باقي الموقع */
export function FontMatchingPage() {
  return (
    <Container as="main" id="main" className="py-10 sm:py-14">
      <PageMeta
        title="عين — مطابقة الخطوط"
        description="ارفع صورة فيها كتابة عربية، ونقارن شكل حروفها بخطوط مكتبة حرف — في متصفّحك."
      />
      <ToolHero
        badgeIcon={<MagicWandIcon />}
        badge="مطابقة بصرية داخل متصفّحك"
        title="أفضل أداة AI!"
        highlight="لمطابقة الخطوط العربية"
        lead="ارفع الصورة واكتشف أي خط في ثوانٍ معدودة، يحلل ويطابق مع أكثر من 20,000 خط عربي"
      />
      <FontMatchingTool renderResult={(p) => <ResultCard {...p} />} />
    </Container>
  );
}
