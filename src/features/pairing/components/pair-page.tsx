import type { CSSProperties, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, ArrowRightIcon, BookmarkIcon, CopyIcon } from '@/components/ui/icons';
import { toast } from '@/components/ui/toast';
import { paths } from '@/config/paths';
import { cn } from '@/lib/utils';

import { BuyAction, DownloadAction, libraryItems, PriceTag } from './font-actions';
import { comboSlots, slotStyle } from './pair-card';
import type { Specimen } from '../data/specimens';
import { useFontsReady } from '../hooks/use-font-ready';
import { useSavedPairs } from '../hooks/use-saved-pairs';
import { cssSnippet } from '../utils/css-snippet';
import { type Combo, type Slot, styleLabel } from '../utils/pairing';

const SCRIPT_LABEL = { ar: 'العربية', en: 'الإنجليزية', ku: 'الكردية' } as const;

/** شارة الدور فوق كل نموذج — أيّ خط في أيّ مكان، بلا تخمين */
function RoleTag({ slot, label }: { slot: Slot; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-card/90 px-2.5 py-1 text-caption text-muted-foreground ring-1 ring-border backdrop-blur">
      <span className="font-medium text-foreground">{label ?? slot.role}</span>
      <bdi dir="ltr">
        {slot.font.name} {slot.weight}
      </bdi>
    </span>
  );
}

/** إطار نموذج تطبيقي: عنوان صغير يشرح السياق، وشارات الأدوار، ثم المساحة نفسها */
function Mockup({
  title,
  tags,
  className,
  children,
}: {
  title: string;
  tags: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <figure className="flex min-w-0 flex-col gap-3">
      <figcaption className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-control font-semibold">{title}</span>
        <span className="flex flex-wrap gap-1.5">{tags}</span>
      </figcaption>
      <div className={cn('overflow-hidden rounded-xl border', className)}>{children}</div>
    </figure>
  );
}

/**
 * صفحة التركيبة — «كيف تُوضع الخطوط»: الخطوط في ثلاث سياقات حقيقية (مقال، منشور، واجهة)
 * بشارة دور فوق كل منها، ثم سلّم الأحجام، ثم كل خط بمعلوماته وتحميله أو شرائه، وCSS جاهز.
 */
export function PairPage({ combo, text, showLatin }: { combo: Combo; text: Specimen; showLatin: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const slots = comboSlots(combo);
  const { ready } = useFontsReady(
    slots.map((s) => ({ family: s.font.family, weight: s.weight })),
    `${text.heading}${text.body}`,
  );
  const saved = useSavedPairs();
  const isSaved = saved.isSaved(combo.key);
  const items = libraryItems(slots.map((s) => s.font));
  const h = slotStyle(combo.heading);
  const b = slotStyle(combo.body);
  const sub: CSSProperties = combo.sub ? slotStyle(combo.sub) : b;
  const title = slots.map((s) => s.font.nameAr).join(' + ');
  // من «نسق» نفسه: رجوع يحفظ النتائج والخيارات؛ ومن رابط مباشر: إلى «نسق»
  const back = () => (location.key !== 'default' ? navigate(-1) : navigate('/tools/nasaq'));

  async function copyCss() {
    try {
      await navigator.clipboard.writeText(cssSnippet(combo));
      toast({ tone: 'success', title: 'نُسخ مقتطف CSS', description: 'الصقه في ملف الأنماط.' });
    } catch {
      toast({ tone: 'danger', title: 'تعذّر النسخ' });
    }
  }

  return (
    <div className="flex flex-col gap-12 sm:gap-16">
      {/* الرأس: اسم التركيبة، درجتها وسببها، والأفعال */}
      <header className="flex flex-col gap-5">
        <button
          type="button"
          onClick={back}
          className="inline-flex w-fit items-center gap-1.5 text-meta text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRightIcon className="size-4" />
          العودة إلى نسق
        </button>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-caption text-tertiary">تركيبة من «نسق»</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
            <p className="mt-3 max-w-[60ch] text-lead text-muted-foreground">
              تناسق{' '}
              <strong dir="ltr" className="text-foreground tabular-nums">
                {combo.score}٪
              </strong>{' '}
              — {combo.reason}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={isSaved ? 'secondary' : 'outline'}
              aria-pressed={isSaved}
              onClick={() => saved.toggle(combo)}
            >
              <BookmarkIcon filled={isSaved} />
              {isSaved ? 'محفوظة' : 'حفظ التركيبة'}
            </Button>
            <Button variant="outline" onClick={() => void copyCss()}>
              <CopyIcon />
              نسخ CSS
            </Button>
            <DownloadAction items={items} />
            <BuyAction items={items} />
          </div>
        </div>
      </header>

      {/* كيف تبدو في التصميم — ثلاث سياقات حقيقية */}
      <section aria-labelledby="pair-context" className={cn('transition-opacity', !ready && 'opacity-0')}>
        <h2 id="pair-context" className="text-xl font-semibold">
          كيف تبدو في التصميم
        </h2>
        <p className="mt-1 mb-6 text-meta text-muted-foreground">
          الخطوط بأدوارها في ثلاثة سياقات — الشارة فوق كل نموذج تقول أيّ خط في أيّ مكان.
        </p>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          {/* مقال */}
          <Mockup
            title="صفحة مقال"
            className="bg-card"
            tags={
              <>
                <RoleTag slot={combo.heading} />
                {combo.sub && <RoleTag slot={combo.sub} />}
                <RoleTag slot={combo.body} />
              </>
            }
          >
            <article className="flex flex-col gap-4 p-6 sm:p-10">
              <p className="text-meta text-primary" style={sub}>
                {text.sub}
              </p>
              <p className="text-4xl leading-tight [overflow-wrap:anywhere] sm:text-5xl" style={h}>
                {text.heading}
              </p>
              {showLatin && (
                <p dir="ltr" className="text-left text-2xl text-muted-foreground" style={h}>
                  {text.latin}
                </p>
              )}
              <p className="text-lg leading-relaxed text-muted-foreground" style={sub}>
                {text.body.split('،')[0]}.
              </p>
              <hr className="my-2" />
              <div className="gap-8 text-base leading-loose text-foreground/85 sm:columns-2" style={b}>
                <p>{text.body}</p>
                <p className="mt-4">{text.body}</p>
              </div>
              <blockquote className="mt-2 border-s-2 border-primary ps-4 text-2xl leading-snug" style={h}>
                «{text.heading}»
              </blockquote>
            </article>
          </Mockup>

          <div className="flex flex-col gap-8">
            {/* منشور */}
            <Mockup
              title="منشور اجتماعي"
              className="moment"
              tags={
                <>
                  <RoleTag slot={combo.heading} />
                  <RoleTag slot={combo.body} />
                </>
              }
            >
              <div className="flex aspect-square flex-col justify-between p-6 sm:p-8">
                <p className="text-caption text-muted-foreground" style={b}>
                  مكتبة حرف
                </p>
                <div className="flex flex-col gap-3">
                  <p className="text-4xl leading-tight [overflow-wrap:anywhere] sm:text-5xl" style={h}>
                    {text.heading}
                  </p>
                  <p className="text-base leading-relaxed text-foreground/80" style={b}>
                    {text.sub}
                  </p>
                </div>
              </div>
            </Mockup>

            {/* واجهة */}
            <Mockup
              title="واجهة موقع أو تطبيق"
              className="bg-sunken"
              tags={
                <>
                  <RoleTag slot={combo.heading} />
                  <RoleTag slot={combo.body} />
                </>
              }
            >
              <div className="flex flex-col gap-4 p-6 sm:p-8">
                <p className="text-3xl leading-tight [overflow-wrap:anywhere]" style={h}>
                  {text.heading}
                </p>
                <p className="text-control leading-relaxed text-muted-foreground" style={b}>
                  {text.body}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary-fill px-4 py-2 text-control text-white" style={b}>
                    ابدأ الآن
                  </span>
                  <span className="rounded-full border bg-card px-4 py-2 text-control" style={b}>
                    اعرف المزيد
                  </span>
                </div>
              </div>
            </Mockup>
          </div>
        </div>
      </section>

      {/* سلّم الأحجام — كيف يتدرّج العنوان والمتن معاً */}
      <section aria-labelledby="pair-scale">
        <h2 id="pair-scale" className="text-xl font-semibold">
          سلّم الأحجام
        </h2>
        <p className="mt-1 mb-6 text-meta text-muted-foreground">
          أحجام مقترحة لكل مستوى — العنوان يقود، والمتن يُقرأ براحة.
        </p>
        <ol className="divide-y rounded-xl border bg-card">
          {(
            [
              ['عنوان رئيسي · H1', 48, combo.heading, text.heading],
              ['عنوان قسم · H2', 32, combo.heading, text.heading],
              ['عنوان فرعي · H3', 22, combo.sub ?? combo.body, text.sub],
              ['متن', 17, combo.body, text.body],
              ['نص صغير', 13, combo.body, text.sub],
            ] as const
          ).map(([label, size, slot, sample]) => (
            <li key={label} className="grid items-baseline gap-2 px-5 py-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6">
              <span className="text-caption text-muted-foreground">
                {label}{' '}
                <bdi dir="ltr" className="text-tertiary tabular-nums">
                  {size}px · {slot.font.name} {slot.weight}
                </bdi>
              </span>
              <p className="min-w-0 truncate leading-normal" style={{ ...slotStyle(slot), fontSize: size }}>
                {sample}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* الخطوط: معلوماتها وتحميلها أو شراؤها */}
      <section aria-labelledby="pair-fonts">
        <h2 id="pair-fonts" className="mb-6 text-xl font-semibold">
          الخطوط في التركيبة
        </h2>
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {slots.map((s) => {
            const one = libraryItems([s.font]);
            return (
              <li key={s.role} className="flex flex-col gap-3 rounded-xl border bg-card p-6">
                <span className="text-caption text-tertiary">{s.role}</span>
                <p className="text-3xl leading-snug" style={slotStyle(s)}>
                  أبجد هوز
                </p>
                <div>
                  <p className="text-control font-semibold">
                    {s.font.nameAr}{' '}
                    <span dir="ltr" className="font-normal text-muted-foreground">
                      {s.font.name}
                    </span>
                  </p>
                  <p className="text-caption text-muted-foreground">{s.font.designer ?? s.font.foundry}</p>
                </div>
                <p className="text-meta leading-relaxed text-muted-foreground">{s.font.desc}</p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-caption">
                  <dt className="text-tertiary">الأسلوب</dt>
                  <dd>{styleLabel(s.font.style)}</dd>
                  <dt className="text-tertiary">الأوزان</dt>
                  <dd dir="ltr" className="text-right tabular-nums">
                    {s.font.weights.join(' · ')}
                  </dd>
                  <dt className="text-tertiary">اللغات</dt>
                  <dd>{s.font.scripts.map((x) => SCRIPT_LABEL[x]).join('، ')}</dd>
                  <dt className="text-tertiary">الترخيص</dt>
                  <dd>{s.font.tier === 'free' ? 'مجاني · SIL OFL' : <PriceTag id={s.font.id} />}</dd>
                </dl>
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                  <DownloadAction items={one} />
                  <BuyAction items={one} />
                  {one[0] && (
                    <Link
                      to={paths.font.getHref(one[0].font.id)}
                      className="ms-auto inline-flex items-center gap-1 text-caption font-medium text-primary hover:underline"
                    >
                      صفحة الخط
                      <ArrowLeftIcon className="size-3.5" />
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* CSS */}
      <section aria-labelledby="pair-css">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="pair-css" className="text-xl font-semibold">
            CSS جاهز
          </h2>
          <Button variant="ghost" size="sm" onClick={() => void copyCss()}>
            <CopyIcon />
            نسخ
          </Button>
        </div>
        <pre
          dir="ltr"
          className="overflow-x-auto rounded-xl border bg-sunken p-5 text-left font-mono text-caption leading-relaxed"
        >
          {cssSnippet(combo)}
        </pre>
      </section>
    </div>
  );
}
