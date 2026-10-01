import { useDeferredValue, useState } from 'react';
import { Link } from 'react-router';

import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  EyeIcon,
  EyeOffIcon,
  LayersIcon,
  MenuDotsIcon,
  PencilIcon,
  RefreshIcon,
  SearchIcon,
  StarIcon,
  TrashIcon,
} from '@/components/ui/icons';
import { InputGroup } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import { paths } from '@/config/paths';
import { faceStyle } from '@/lib/font-weight';
import { CATEGORY_LABEL, TYPE_LABEL } from '@/lib/labels';
import type { Font } from '@/types/domain/font';

import { AdminPageHeader } from './admin-nav';
import { DeleteFontDialog, EditFontDialog } from './font-dialogs';
import {
  restoreFont,
  setFeatured,
  setHidden,
  type StoreFont,
  useStoreFonts,
  type Visibility,
} from '../api/fonts-store';
import { fmt } from '../utils';

type VisFilter = 'all' | Visibility;
type Sort = 'downloads' | 'newest' | 'name';

export const VIS_LABEL: Record<Visibility, string> = { visible: 'ظاهر', hidden: 'مخفي', deleted: 'محذوف' };

export function toggleHidden(item: StoreFont) {
  const hide = item.visibility === 'visible';
  const r = setHidden(item.font.id, hide);
  if (r.ok)
    toast({
      tone: 'info',
      title: hide ? `أُخفي «${item.font.name}»` : `أصبح «${item.font.name}» ظاهراً`,
      description: hide ? 'لا يظهر في المكتبة ولا الأدوات، وصفحته تعطي 404.' : 'عاد إلى المكتبة.',
    });
}

export function toggleFeatured(item: StoreFont) {
  const r = setFeatured(item.font.id, !item.featured);
  if (r.ok) toast({ tone: 'success', title: item.featured ? 'أُلغي التمييز' : `مُيّز «${item.font.name}»` });
}

export function restore(item: StoreFont) {
  const r = restoreFont(item.font.id);
  if (r.ok) toast({ tone: 'success', title: `استُرجع «${item.font.name}»`, description: 'عاد بحالته قبل الحذف.' });
}

/** مصغّرة الخط في الجدول: عيّنة بخطّه الحقيقي */
function Thumb({ font }: { font: Font }) {
  return (
    <span
      aria-hidden
      className="grid h-11 w-16 shrink-0 place-items-center overflow-hidden rounded-md border bg-sunken"
    >
      <span className="text-xl leading-none" style={font.face ? faceStyle(font.face, 700) : undefined}>
        أب
      </span>
    </span>
  );
}

function RowActions({ item }: { item: StoreFont }) {
  const [edit, setEdit] = useState(false);
  const [del, setDel] = useState(false);
  const deleted = item.visibility === 'deleted';
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`إجراءات ${item.font.name}`}>
            <MenuDotsIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {deleted ? (
            <DropdownMenuItem onSelect={() => restore(item)}>
              <RefreshIcon />
              استرجاع
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem onSelect={() => setEdit(true)}>
                <PencilIcon />
                تعديل
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => toggleFeatured(item)}>
                <StarIcon filled={item.featured} />
                {item.featured ? 'إلغاء التمييز' : 'تمييز'}
              </DropdownMenuItem>
              {item.visibility === 'visible' && (
                <DropdownMenuItem asChild>
                  <Link to={paths.font.getHref(item.font.id)}>
                    <EyeIcon />
                    عرض في الموقع
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setDel(true)}>
                <TrashIcon />
                حذف
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {edit && <EditFontDialog item={item} open={edit} onOpenChange={setEdit} />}
      {del && <DeleteFontDialog item={item} open={del} onOpenChange={setDel} />}
    </>
  );
}

/**
 * «مخزن الخطوط»: كل خطوط المكتبة في جدول واحد — بحث، تصفية بالظهور والنوع، ترتيب،
 * ومفتاح ظهور مباشر لكل خط. التفاصيل والإحصاءات الكاملة في صفحة الخط داخل الإدارة.
 */
export function FontStore() {
  const all = useStoreFonts();
  const [q, setQ] = useState('');
  const query = useDeferredValue(q.trim().toLowerCase());
  const [vis, setVis] = useState<VisFilter>('all');
  const [type, setType] = useState<'all' | 'free' | 'paid'>('all');
  const [sort, setSort] = useState<Sort>('downloads');

  const count = (v: Visibility) => all.filter((i) => i.visibility === v).length;
  const rows = all
    .filter((i) => (vis === 'all' ? i.visibility !== 'deleted' : i.visibility === vis))
    .filter((i) => type === 'all' || (type === 'free' ? i.font.type === 'free' : i.font.type !== 'free'))
    .filter(
      (i) =>
        !query ||
        i.font.name.toLowerCase().includes(query) ||
        i.font.designers.some((d) => d.nameAr.includes(query) || d.nameEn.toLowerCase().includes(query)) ||
        (i.font.face?.nameAr.includes(query) ?? false),
    )
    .sort((a, b) =>
      sort === 'name'
        ? a.font.name.localeCompare(b.font.name)
        : sort === 'newest'
          ? b.font.releasedAt.localeCompare(a.font.releasedAt)
          : b.stats.downloads - a.stats.downloads,
    );

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="مخزن الخطوط"
        description={`${all.length - count('deleted')} خطاً · ${count('visible')} ظاهر · ${count('hidden')} مخفي`}
      />

      <div className="overflow-hidden rounded-xl border bg-card">
        {/* الظهور تبويبات فوق الجدول؛ والبحث والنوع والترتيب في صفّ واحد تحتها */}
        <div
          role="group"
          aria-label="الظهور"
          className="flex [scrollbar-width:none] gap-1 overflow-x-auto border-b px-3 sm:px-5"
        >
          {(
            [
              ['all', 'الكل', all.length - count('deleted')],
              ['visible', 'ظاهر', count('visible')],
              ['hidden', 'مخفي', count('hidden')],
              ['deleted', 'المحذوفة', count('deleted')],
            ] as const
          ).map(([v, label, n]) => (
            <button
              key={v}
              type="button"
              aria-pressed={vis === v}
              onClick={() => setVis(v)}
              className="relative flex h-13 shrink-0 items-center gap-2 px-3 text-control text-muted-foreground transition-colors hover:text-foreground aria-pressed:font-semibold aria-pressed:text-foreground aria-pressed:after:absolute aria-pressed:after:inset-x-2 aria-pressed:after:bottom-0 aria-pressed:after:h-0.5 aria-pressed:after:rounded-full aria-pressed:after:bg-primary-fill"
            >
              {label}
              <span dir="ltr" className="rounded-full bg-sunken px-2 py-0.5 text-caption font-medium tabular-nums">
                {n}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b bg-sunken/40 p-3 sm:px-5 sm:py-4">
          <InputGroup
            start={<SearchIcon />}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث باسم الخط أو المصمّم"
            aria-label="بحث في الخطوط"
            maxLength={60}
            className="min-w-0 flex-1 basis-60 bg-card"
          />
          <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
            <SelectTrigger aria-label="النوع" className="w-36 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الأنواع</SelectItem>
              <SelectItem value="free">مجانية</SelectItem>
              <SelectItem value="paid">مدفوعة</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger aria-label="الترتيب" className="w-40 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="downloads">الأكثر تحميلاً</SelectItem>
              <SelectItem value="newest">الأحدث</SelectItem>
              <SelectItem value="name">الاسم</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {rows.length ? (
          <Table aria-label="خطوط المكتبة" className="min-w-170">
            <TableHeader>
              <TableRow>
                <TableHead>الخط</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead className="text-end">التحميلات</TableHead>
                <TableHead className="text-end">الإيراد</TableHead>
                <TableHead>الظهور</TableHead>
                <TableHead>
                  <span className="sr-only">إجراءات</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((i) => {
                const f = i.font;
                const deleted = i.visibility === 'deleted';
                return (
                  <TableRow key={f.id} className={deleted ? 'opacity-60' : undefined}>
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3.5">
                        <Thumb font={f} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              to={paths.admin.font.getHref(f.id)}
                              className="font-semibold underline-offset-4 hover:text-primary hover:underline"
                            >
                              <bdi>{f.name}</bdi>
                            </Link>
                            {i.featured && <StarIcon filled className="size-3.5 text-gold-500" title="مميّز" />}
                          </div>
                          <p className="text-caption text-muted-foreground">
                            {[f.designers.map((d) => d.nameAr).join('، '), CATEGORY_LABEL[f.category]]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge tone={f.type === 'free' ? 'neutral' : f.type === 'trial' ? 'info' : 'studio'}>
                        {TYPE_LABEL[f.type]}
                        {f.type !== 'free' && <bdi dir="ltr">${f.price}</bdi>}
                      </Badge>
                    </TableCell>
                    <TableCell dir="ltr" className="text-end tabular-nums">
                      {fmt(i.stats.downloads)}
                    </TableCell>
                    <TableCell dir="ltr" className="text-end tabular-nums">
                      {i.stats.revenue ? `$${fmt(i.stats.revenue)}` : '—'}
                    </TableCell>
                    <TableCell>
                      {deleted ? (
                        <Badge tone="danger" icon={<TrashIcon />}>
                          محذوف
                        </Badge>
                      ) : (
                        <label className="inline-flex items-center gap-2 text-meta text-muted-foreground">
                          <Switch
                            checked={i.visibility === 'visible'}
                            onCheckedChange={() => toggleHidden(i)}
                            aria-label={`ظهور ${f.name}`}
                          />
                          {i.visibility === 'visible' ? (
                            <EyeIcon className="size-4" aria-hidden />
                          ) : (
                            <EyeOffIcon className="size-4" aria-hidden />
                          )}
                          {VIS_LABEL[i.visibility]}
                        </label>
                      )}
                    </TableCell>
                    <TableCell className="w-12">
                      <RowActions item={i} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            className="rounded-none border-0"
            icon={<LayersIcon />}
            title={vis === 'deleted' && !query ? 'لا خطوط محذوفة' : 'لا خطوط تطابق البحث'}
            description={
              vis === 'deleted' && !query ? 'ما تحذفه يظهر هنا ويمكن استرجاعه.' : 'جرّب اسماً آخر أو غيّر التصفية.'
            }
          />
        )}
      </div>
    </div>
  );
}
