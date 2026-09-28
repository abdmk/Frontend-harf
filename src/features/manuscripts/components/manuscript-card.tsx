import { BookmarkIcon, DownloadIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { type Manuscript, MANUSCRIPT_CATEGORY_LABEL } from '@/types/domain/manuscript';

/** ارتفاع ما تحت الصورة — يدخل في حساب التخطيط المتدفّق */
export const CARD_FOOTER = 84;
/** الهامش حول الرسم داخل سطح البطاقة (نسبةً للعرض) */
export const CARD_PAD = 0.22;

/** اسم لاتيني آمن لكل الأنظمة — بعض المتصفّحات تتجاهل الأسماء العربية في download */
export const fileName = (m: Manuscript) => `harf-${m.id}.svg`;

/**
 * بطاقة المخطوطة بتشريح بطاقة الخط: الرسم على سطح هادئ بارتفاعه الطبيعي، زرّ الحفظ فوقه
 * (بشكل زرّ المفضّلة)، ثم العنوان والتصنيف والتحميلات وزرّ تحميل صغير. البطاقة كلها تفتح العارض.
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
  return (
    <article
      aria-label={m.title}
      className="group/card relative flex flex-col overflow-hidden rounded-lg border bg-card transition-[transform,box-shadow,border-color] duration-(--dur-slow) ease-out-quint hover:-translate-y-1 hover:border-strong hover:shadow-float"
    >
      <div className="relative overflow-hidden border-b bg-sunken" style={{ padding: `${CARD_PAD * 50}%` }}>
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

      <button
        type="button"
        aria-pressed={saved}
        aria-label={saved ? `إزالة ${m.title} من المحفوظة` : `حفظ ${m.title}`}
        onClick={onSave}
        className="absolute start-3 top-3 z-10 grid size-8 place-items-center rounded-full bg-heart text-white opacity-100 backdrop-blur-sm transition-[transform,background-color,opacity] duration-(--dur-base) ease-pop hover:scale-105 active:scale-95 aria-pressed:bg-primary-fill sm:opacity-0 sm:group-hover/card:opacity-100 sm:focus-visible:opacity-100 sm:aria-pressed:opacity-100"
      >
        <BookmarkIcon className={cn('size-3.75', saved && '[&_path]:fill-current')} />
      </button>

      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onOpen}
            className="block w-full truncate text-start text-control font-semibold after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-primary"
          >
            {m.title}
          </button>
          <p className="mt-0.5 truncate text-caption text-muted-foreground">
            {MANUSCRIPT_CATEGORY_LABEL[m.category]} ·{' '}
            <span className="tabular-nums">{m.downloads.toLocaleString('en-US')}</span> تحميل
          </p>
        </div>
        <a
          href={m.url}
          download={fileName(m)}
          aria-label={`تحميل ${m.title} (SVG)`}
          className="relative z-10 grid size-9 shrink-0 place-items-center rounded-full border text-muted-foreground transition-colors hover:border-primary hover:bg-primary-fill hover:text-primary-foreground"
        >
          <DownloadIcon className="size-4" />
        </a>
      </div>
    </article>
  );
}
