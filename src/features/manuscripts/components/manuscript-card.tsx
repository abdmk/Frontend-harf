import { Link } from 'react-router';

import { Avatar } from '@/components/shared/avatar';
import { DownloadButton } from '@/components/shared/download-button';
import { BookmarkIcon, CheckIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';
import { TYPE_LABEL, USAGE_LABEL } from '@/lib/labels';
import type { Manuscript } from '@/types/domain/manuscript';

/** الهامش حول الرسم داخل سطح البطاقة (نسبةً للعرض) */
export const CARD_PAD = 0.22;
/** أقلّ هامش علوي — يبقي الشارة وزرّ الحفظ فوق سطح فارغ لا فوق الرسم */
const TOP_MIN = 56;
/** تحت هذا العرض تصير البطاقة مدمجة (عمودان على الجوال) */
const COMPACT = 240;

/** ما لا يتناسب مع عرض الرسم: تفاصيل البطاقة + ما يزيده الهامش العلوي الأدنى — لحساب التخطيط المتدفّق */
export const cardExtra = (w: number) => (w < COMPACT ? 124 : 150) + Math.max(0, TOP_MIN - (CARD_PAD / 2) * w);

/** اسم لاتيني آمن لكل الأنظمة — بعض المتصفّحات تتجاهل الأسماء العربية في download */
export const fileName = (m: Manuscript) => `harf-${m.id}.svg`;

/**
 * بطاقة المخطوطة بتشريح بطاقة الخط حرفياً: شارة الترخيص وزرّ الحفظ فوق الرسم، ثم العنوان والتحميلات،
 * والمصمّم (رابط لصفحته)، ثم سطر الترخيص وزرّ التحميل. البطاقة كلها تفتح العارض.
 */
export function ManuscriptCard({
  m,
  saved,
  onSave,
  onOpen,
}: {
  m: Manuscript;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
}) {
  const latin = /^[A-Za-z]/.test(m.designer.nameAr);
  return (
    <article
      aria-label={m.title}
      className="group/card @container relative flex flex-col overflow-hidden rounded-lg border bg-card transition-[transform,box-shadow,border-color] duration-(--dur-slow) ease-out-quint hover:-translate-y-1 hover:border-strong hover:shadow-float"
    >
      <div
        className="relative overflow-hidden border-b bg-sunken"
        style={{ padding: `${CARD_PAD * 50}%`, paddingTop: `max(${CARD_PAD * 50}%, ${TOP_MIN}px)` }}
      >
        <img
          src={m.url}
          alt=""
          loading="lazy"
          decoding="async"
          width={m.width}
          height={m.height}
          className="h-auto w-full transition-transform duration-(--dur-xslow) ease-out-quint group-hover/card:scale-[1.04] dark:invert"
        />
      </div>

      {/* كل المخطوطات مجانية حالياً — الشارة نفسها في بطاقة الخط */}
      <span className="absolute end-4 top-4 z-10 inline-flex h-6 items-center gap-1 rounded-full bg-ok-700 px-2 text-caption leading-none font-medium text-white">
        <CheckIcon className="size-3" />
        {TYPE_LABEL.free}
      </span>
      <button
        type="button"
        aria-pressed={saved}
        aria-label={saved ? `إزالة ${m.title} من المحفوظة` : `حفظ ${m.title}`}
        title={saved ? 'محفوظة' : 'حفظ'}
        onClick={onSave}
        className="absolute start-4 top-4 z-10 grid size-8 place-items-center rounded-full bg-heart text-white backdrop-blur-sm transition-[transform,background-color] duration-(--dur-base) ease-pop hover:scale-105 active:scale-95 aria-pressed:bg-primary-fill"
      >
        <BookmarkIcon className={cn('size-3.75', saved && 'animate-pop-in [&_path]:fill-current')} />
      </button>

      {/* تتقلّص التفاصيل مع عرض البطاقة (container query): عمودان على الجوال بلا اقتطاع */}
      <div className="flex flex-col gap-3 p-5 @max-[15rem]:gap-2 @max-[15rem]:p-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <button
            type="button"
            onClick={onOpen}
            className="min-w-0 truncate text-start text-lg font-semibold after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-primary @max-[15rem]:text-control"
          >
            {m.title}
          </button>
          <span className="shrink-0 text-meta text-muted-foreground @max-[15rem]:hidden">
            <span className="tabular-nums">{m.downloads.toLocaleString('en-US')}</span> تحميل
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-2 text-sm font-medium @max-[15rem]:text-meta">
          <Avatar initials={m.designer.initials} seed={m.designer.id} size="xs" className="ring-2 ring-card" />
          <Link
            to={paths.designer.getHref(m.designer.id)}
            dir={latin ? 'ltr' : undefined}
            className="relative z-10 truncate underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            {m.designer.nameAr}
          </Link>
        </div>

        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="truncate text-sm font-medium text-lic @max-[15rem]:hidden">{USAGE_LABEL[m.license]}</span>
          <DownloadButton
            className="@max-[15rem]:w-full"
            fontName={m.title}
            file={{ url: m.url, bytes: m.bytes, format: 'SVG', name: fileName(m) }}
          />
        </div>
      </div>
    </article>
  );
}
