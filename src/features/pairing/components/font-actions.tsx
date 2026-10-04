import { Link } from 'react-router';

import { formatBytes, QUIET_CTA } from '@/components/shared/download-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CartIcon, ChevronDownIcon, DownloadIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';
import type { Font } from '@/types/domain/font';

import { libraryFont } from '../api/library';
import type { PairFont } from '../data/catalog';

type Item = { pair: PairFont; font: Font };
type Tone = 'primary' | 'secondary';

/** خطوط التركيبة كما هي في مكتبة حرف — بلا تكرار (خط واحد قد يشغل دورين) */
export function libraryItems(fonts: readonly PairFont[]): Item[] {
  const seen = new Set<string>();
  return fonts.flatMap((pair) => {
    const font = libraryFont(pair.id);
    if (!font || seen.has(pair.id)) return [];
    seen.add(pair.id);
    return [{ pair, font }];
  });
}

const price = (f: Font) => `$${f.price}`;

/** مقاس زرّ «تحميل» في بطاقة الخط نفسه — حتى تبدو أفعال «نسق» أفعال المكتبة */
const action = (tone: Tone) =>
  cn(
    'group/act relative z-10 inline-flex h-8 min-w-21 items-center justify-center gap-2 rounded-xs px-3 text-meta font-medium whitespace-nowrap transition-[background-color,transform] duration-(--dur-base) outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[.97]',
    // كأفعال بطاقات المكتبة: هادئة، تمتلئ عند المرور — «تركيبات جديدة» هو زرّ الصفحة الرئيسي
    tone === 'primary' ? QUIET_CTA : 'border bg-sunken text-foreground hover:bg-inset',
  );
const chevron = 'size-3 opacity-70 transition-transform duration-(--dur-base) group-data-[state=open]/act:rotate-180';

/**
 * تحميل الخطوط المجانية من حرف مباشرة (حزمة OFL كاملة). خط واحد: رابط مباشر؛ أكثر: قائمة.
 * المدفوعة لا تظهر هنا أبداً.
 */
export function DownloadAction({
  items,
  tone = 'primary',
  className,
}: {
  items: Item[];
  tone?: Tone;
  className?: string;
}) {
  const free = items.filter((i) => i.font.type === 'free' && i.font.download);
  if (!free.length) return null;

  if (free.length === 1) {
    const { pair, font } = free[0]!;
    return (
      <a
        href={font.download!.url}
        download
        aria-label={`تحميل ${pair.nameAr} (ZIP، ${formatBytes(font.download!.bytes)})`}
        title={`${pair.nameAr} · ZIP · ${formatBytes(font.download!.bytes)}`}
        className={cn(action(tone), className)}
      >
        <DownloadIcon className="size-3.5 transition-transform duration-(--dur-base) group-hover/act:translate-y-0.5" />
        تحميل
      </a>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(action(tone), className)}>
        <DownloadIcon filled="auto" className="size-3.5" />
        تحميل
        <ChevronDownIcon className={chevron} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="font-normal">مجانية · SIL OFL</DropdownMenuLabel>
        {free.map(({ pair, font }) => (
          <DropdownMenuItem key={pair.id} asChild className="justify-between gap-4">
            <a href={font.download!.url} download>
              <span>تحميل {pair.nameAr}</span>
              <span dir="ltr" className="text-caption text-tertiary tabular-nums">
                {formatBytes(font.download!.bytes)}
              </span>
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * شراء الخطوط المدفوعة عبر سلة حرف: يفتح صفحة الخط بلوحة الترخيص جاهزة، ومنها إلى السلة.
 * خط واحد: رابط مباشر؛ أكثر: قائمة بالأسعار.
 */
export function BuyAction({ items, className }: { items: Item[]; className?: string }) {
  const paid = items.filter((i) => i.font.type === 'paid');
  if (!paid.length) return null;

  if (paid.length === 1) {
    const { pair, font } = paid[0]!;
    return (
      <Link
        to={paths.font.getHref(font.id, { license: true })}
        aria-label={`شراء ترخيص ${pair.nameAr}`}
        className={cn(action('primary'), className)}
      >
        <CartIcon className="size-3.5" />
        شراء
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(action('primary'), className)}>
        <CartIcon filled="auto" className="size-3.5" />
        شراء
        <ChevronDownIcon className={chevron} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="font-normal">ترخيص عبر سلة حرف</DropdownMenuLabel>
        {paid.map(({ pair, font }) => (
          <DropdownMenuItem key={pair.id} asChild className="justify-between gap-4">
            <Link to={paths.font.getHref(font.id, { license: true })}>
              <span>شراء {pair.nameAr}</span>
              <span dir="ltr" className="text-caption text-tertiary tabular-nums">
                {price(font)}
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** «مجاني» أو «من $260» — الرقم معزول باتجاهه حتى لا تقلبه ثنائية الاتجاه إلى «260$» */
export function PriceTag({ id }: { id: string }) {
  const f = libraryFont(id);
  if (!f) return null;
  if (f.type === 'free') return <>مجاني</>;
  return (
    <>
      من <bdi dir="ltr">{price(f)}</bdi>
    </>
  );
}
