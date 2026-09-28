import { Link } from 'react-router';

import { formatBytes } from '@/components/shared/download-button';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CartIcon, ChevronDownIcon, DownloadIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import type { Font } from '@/types/domain/font';

import { libraryFont } from '../api/library';
import type { PairFont } from '../data/catalog';

type Item = { pair: PairFont; font: Font };

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

/**
 * تحميل الخطوط المجانية من حرف مباشرة (حزمة OFL كاملة). خط واحد: رابط مباشر؛ أكثر: قائمة.
 * المدفوعة لا تظهر هنا أبداً.
 */
export function DownloadAction({ items, size = 'sm' }: { items: Item[]; size?: 'sm' | 'md' }) {
  const free = items.filter((i) => i.font.type === 'free' && i.font.download);
  if (!free.length) return null;

  if (free.length === 1) {
    const { pair, font } = free[0]!;
    return (
      <Button asChild variant="secondary" size={size}>
        <a
          href={font.download!.url}
          download
          aria-label={`تحميل ${pair.nameAr} (ZIP، ${formatBytes(font.download!.bytes)})`}
          title={`${pair.nameAr} · ZIP · ${formatBytes(font.download!.bytes)}`}
        >
          <DownloadIcon />
          تحميل
        </a>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size={size} className="group">
          <DownloadIcon />
          تحميل
          <ChevronDownIcon className="size-3.5 transition-transform duration-(--dur-base) group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56 p-1.5">
        <DropdownMenuLabel className="text-caption font-normal text-tertiary">مجانية · SIL OFL</DropdownMenuLabel>
        {free.map(({ pair, font }) => (
          <DropdownMenuItem key={pair.id} asChild className="justify-between gap-4 py-2 text-control">
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
export function BuyAction({ items, size = 'sm' }: { items: Item[]; size?: 'sm' | 'md' }) {
  const paid = items.filter((i) => i.font.type === 'paid');
  if (!paid.length) return null;

  if (paid.length === 1) {
    const { pair, font } = paid[0]!;
    return (
      <Button asChild size={size}>
        <Link to={paths.font.getHref(font.id, { license: true })} aria-label={`شراء ترخيص ${pair.nameAr}`}>
          <CartIcon />
          شراء
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={size} className="group">
          <CartIcon />
          شراء
          <ChevronDownIcon className="size-3.5 transition-transform duration-(--dur-base) group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56 p-1.5">
        <DropdownMenuLabel className="text-caption font-normal text-tertiary">ترخيص عبر سلة حرف</DropdownMenuLabel>
        {paid.map(({ pair, font }) => (
          <DropdownMenuItem key={pair.id} asChild className="justify-between gap-4 py-2 text-control">
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
