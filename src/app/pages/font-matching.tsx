import { Link } from 'react-router';

import { Container } from '@/components/layout/container';
import { ToolHero } from '@/components/layout/tool-hero';
import { DownloadButton } from '@/components/shared/download-button';
import { FontTypeBadge } from '@/components/shared/font-type-badge';
import { PageMeta } from '@/components/shared/page-meta';
import { Button } from '@/components/ui/button';
import { MagicWandIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { FavoriteButton } from '@/features/favorites/components/favorite-button';
import { FontMatchingTool, type ResultCardProps } from '@/features/font-matching/components/font-matching-tool';
import { cn } from '@/lib/cn';
import { faceStyle } from '@/lib/font-weight';

/** درجة التطابق: اللون مع كلمة تصفه — لا يُقرأ المعنى من اللون وحده */
function matchTone(score: number) {
  if (score >= 75) return { label: 'تطابق عالٍ', bar: 'bg-ok-500', text: 'text-ok-text' };
  if (score >= 50) return { label: 'تطابق متوسط', bar: 'bg-warn-500', text: 'text-warn-text' };
  return { label: 'تطابق ضعيف', bar: 'bg-dgr-500', text: 'text-dgr-text' };
}

/**
 * بطاقة نتيجة «عين» — مصمَّمة للمقارنة لا للتصفّح: الاسم والنسبة في سطر، نصّ المستخدم كبيراً بخطّ النتيجة
 * في شريط قصير، شريط التطابق، ثم سطر أفعال واحد (قارن · مفضّلة · تحميل أو ترخيص). بلا مساحات ميتة.
 */
function ResultCard({ match, text, selected, onCompare, rank }: ResultCardProps) {
  const { font } = match;
  const tone = matchTone(match.score);
  const designer = font.designerLabel ?? font.designers[0]?.nameAr;
  return (
    <article
      className={cn(
        'group/card relative flex flex-col gap-4 rounded-xl border bg-card p-4 transition-[border-color,box-shadow] duration-(--dur-base) hover:border-strong hover:shadow-soft sm:p-5',
        selected && 'border-primary ring-2 ring-primary/15',
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-sunken text-caption font-semibold tabular-nums">
            {rank + 1}
          </span>
          <div className="min-w-0">
            <Link
              to={paths.font.getHref(font.id)}
              dir="ltr"
              className="block truncate text-lead font-semibold hover:text-primary"
            >
              {font.name}
            </Link>
            <p className="mt-0.5 flex items-center gap-2 truncate text-caption text-muted-foreground">
              <FontTypeBadge type={font.type} className="h-5" />
              {designer && <span className="truncate">{designer}</span>}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-end">
          <span dir="ltr" className="block text-2xl leading-none font-bold tabular-nums">
            {match.score}%
          </span>
          <span className={cn('mt-1 block text-caption font-medium', tone.text)}>{tone.label}</span>
        </div>
      </header>

      {/* نصّ المستخدم بخطّ النتيجة — شريط قصير بلا فراغ، والحجم كبير ليُقارن بالعين */}
      <div
        aria-hidden
        className="flex min-h-24 items-center justify-center overflow-hidden rounded-lg bg-sunken px-4 py-3"
      >
        {font.face && (
          <span className="line-clamp-1 text-center text-5xl leading-tight" style={faceStyle(font.face, match.weight)}>
            {text}
          </span>
        )}
      </div>

      <div
        role="meter"
        aria-label={`نسبة التشابه مع ${font.name}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={match.score}
        aria-valuetext={`${match.score}٪ — ${tone.label}`}
        className="h-2 overflow-hidden rounded-full bg-inset"
      >
        <span
          className={cn('block h-full animate-grow-x rounded-full ltr:origin-left rtl:origin-right', tone.bar)}
          style={{ width: `${match.score}%` }}
        />
      </div>

      <footer className="flex items-center gap-2">
        <Button variant={selected ? 'secondary' : 'outline'} size="sm" aria-pressed={selected} onClick={onCompare}>
          {selected ? 'في المقارنة' : 'قارن مع صورتك'}
        </Button>
        <FavoriteButton
          fontId={font.id}
          fontName={font.name}
          variant="square"
          className="size-8.5 rounded-xs border-border bg-card text-muted-foreground hover:text-primary"
        />
        <span className="ms-auto">
          {font.type === 'free' ? (
            <DownloadButton fontName={font.name} file={font.download} />
          ) : (
            <Button asChild size="sm">
              <Link to={paths.font.getHref(font.id, { license: true })} aria-label={`شراء ترخيص ${font.name}`}>
                <bdi dir="ltr" className="tabular-nums">
                  ${font.price}
                </bdi>
                · ترخيص
              </Link>
            </Button>
          )}
        </span>
      </footer>
    </article>
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
