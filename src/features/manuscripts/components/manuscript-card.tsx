import { Link } from 'react-router';

import { formatBytes } from '@/components/shared/download-button';
import { BookmarkIcon, DownloadIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';
import type { Manuscript } from '@/types/domain/manuscript';

/** الهامش حول الرسم داخل اللوحة (نسبةً للعرض) — أقلّ من قبل: المخطوطة تملأ مساحتها */
export const CARD_PAD = 0.14;
/** ارتفاع سطرَي التعريف تحت اللوحة (العنوان + المصمّم) — لحساب التخطيط المتدفّق مسبقاً */
export const cardExtra = () => 54;

/** اسم لاتيني آمن لكل الأنظمة — بعض المتصفّحات تتجاهل الأسماء العربية في download */
export const fileName = (m: Manuscript) => `harf-${m.id}.svg`;

/** زرّ دائري فوق اللوحة — يظهر عند المرور حيث يوجد مؤشّر، ودائماً على اللمس */
const overlayBtn =
  'relative z-10 grid size-8 place-items-center rounded-full bg-card/90 text-foreground shadow-soft backdrop-blur-sm transition-[opacity,transform,background-color,color] duration-(--dur-base) ease-out-quint hover:scale-105 hover:bg-card active:scale-95 focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/card:opacity-100';

/**
 * بطاقة المخطوطة كقطعة في معرض: اللوحة هي البطل (بلا إطار ولا شارات فوقها)، وتحتها العنوان والمصمّم فقط.
 * الحفظ والتحميل أيقونتان هادئتان تظهران عند المرور؛ الترخيص وعدد التحميلات في العارض.
 * النقر في أي مكان يفتح العارض.
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
    <article aria-label={m.title} className="group/card relative flex flex-col">
      <div
        className="relative overflow-hidden rounded-lg bg-sunken transition-[background-color] duration-(--dur-base) group-hover/card:bg-inset"
        style={{ padding: `${CARD_PAD * 50}%` }}
      >
        <img
          src={m.url}
          alt=""
          loading="lazy"
          decoding="async"
          width={m.width}
          height={m.height}
          className="h-auto w-full transition-transform duration-(--dur-xslow) ease-out-quint group-hover/card:scale-[1.03] dark:invert"
        />
        <div className="pointer-events-none absolute inset-x-3 top-3 flex justify-between [&>*]:pointer-events-auto">
          <button
            type="button"
            aria-pressed={saved}
            aria-label={saved ? `إزالة ${m.title} من المحفوظة` : `حفظ ${m.title}`}
            title={saved ? 'محفوظة' : 'حفظ'}
            onClick={onSave}
            className={cn(overlayBtn, saved && 'text-primary opacity-100 [@media(hover:hover)]:opacity-100')}
          >
            <BookmarkIcon filled={saved} className={cn('size-4', saved && 'animate-pop-in')} />
          </button>
          <a
            href={m.url}
            download={fileName(m)}
            aria-label={`تحميل ${m.title} (SVG، ${formatBytes(m.bytes)})`}
            title={`تحميل SVG · ${formatBytes(m.bytes)}`}
            className={cn(overlayBtn, '[@media(hover:none)]:hidden')}
          >
            <DownloadIcon className="size-4" />
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-0.5 px-1 pt-2.5">
        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 truncate text-start text-control font-medium after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-primary"
        >
          {m.title}
        </button>
        <Link
          to={paths.designer.getHref(m.designer.id)}
          dir={latin ? 'ltr' : undefined}
          className="relative z-10 self-start truncate text-caption text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          {m.designer.nameAr}
        </Link>
      </div>
    </article>
  );
}
