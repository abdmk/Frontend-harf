import { useDeferredValue, useState } from 'react';
import { Link } from 'react-router';

import { EmptyState } from '@/components/shared/empty-state';
import { FontTypeBadge } from '@/components/shared/font-type-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  EyeIcon,
  EyeOffIcon,
  LayersIcon,
  PencilIcon,
  RefreshIcon,
  SearchIcon,
  StarIcon,
  TrashIcon,
} from '@/components/ui/icons';
import { InputGroup } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';
import { faceStyle } from '@/lib/font-weight';
import { CATEGORY_LABEL } from '@/lib/labels';
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

/** «عبدالملك جاسم» · «أ وب» · «أ و4 آخرون» — سطر قصير ثابت مهما كثر المصمّمون */
function designersShort(names: string[]) {
  if (names.length <= 1) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} و${names[1]}`;
  return `${names[0]} و${names.length - 1} آخرون`;
}

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

/**
 * إجراءات الصفّ ظاهرة مباشرة (لا قائمة مخفية): تعديل، إخفاء/إظهار، تمييز، حذف.
 * النصّ يختفي تحت xl ويبقى الاسم في aria-label وtitle.
 */
function RowActions({ item }: { item: StoreFont }) {
  const [edit, setEdit] = useState(false);
  const [del, setDel] = useState(false);
  const name = item.font.name;
  if (item.visibility === 'deleted')
    return (
      <Button variant="outline" size="sm" onClick={() => restore(item)}>
        <RefreshIcon />
        استرجاع
      </Button>
    );
  const hidden = item.visibility === 'hidden';
  // «تعديل» بنصّه، والبقية أزرار أيقونات بأسماء كاملة (aria-label) وتلميح — كلها ظاهرة على الصفّ
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="outline" size="sm" onClick={() => setEdit(true)} aria-label={`تعديل ${name}`}>
        <PencilIcon />
        تعديل
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => toggleHidden(item)}
        aria-label={`${hidden ? 'إظهار' : 'إخفاء'} ${name}`}
        title={hidden ? 'إظهار' : 'إخفاء'}
      >
        {hidden ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => toggleFeatured(item)}
        aria-label={`${item.featured ? 'إلغاء تمييز' : 'تمييز'} ${name}`}
        aria-pressed={item.featured}
        title={item.featured ? 'إلغاء التمييز' : 'تمييز'}
      >
        <StarIcon filled={item.featured} className={cn('size-4', item.featured && 'text-gold-500')} />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setDel(true)}
        aria-label={`حذف ${name}`}
        title="حذف"
        className="text-dgr-text hover:bg-tint-dgr hover:text-dgr-text"
      >
        <TrashIcon className="size-4" />
      </Button>
      {edit && <EditFontDialog item={item} open={edit} onOpenChange={setEdit} />}
      {del && <DeleteFontDialog item={item} open={del} onOpenChange={setDel} />}
    </div>
  );
}

/**
 * «مخزن الخطوط»: كل خطوط المكتبة في جدول واحد — بحث، تصفية بالظهور والنوع، ترتيب،
 * وإجراءات كل خط ظاهرة على صفّه. التفاصيل والإحصاءات الكاملة في صفحة الخط داخل الإدارة.
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
        title="الخطوط"
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
                <TableHead>الحالة</TableHead>
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
                          {/* التصنيف شارة، والمصمّمون مختصرون (الأول + العدد) — القائمة كاملة عند التمرير */}
                          <p className="mt-1 flex min-w-0 items-center gap-2 text-caption text-muted-foreground">
                            <span className="shrink-0 rounded-full bg-sunken px-2 py-0.5 font-medium">
                              {CATEGORY_LABEL[f.category]}
                            </span>
                            {f.designers.length > 0 && (
                              <span className="truncate" title={f.designers.map((d) => d.nameAr).join('، ')}>
                                {designersShort(f.designers.map((d) => d.nameAr))}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <FontTypeBadge type={f.type}>
                        {f.type !== 'free' && <bdi dir="ltr">${f.price}</bdi>}
                      </FontTypeBadge>
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      <span dir="ltr">{fmt(i.stats.downloads)}</span>
                      {i.stats.revenue > 0 && (
                        <span dir="ltr" className="block text-caption text-muted-foreground">
                          ${fmt(i.stats.revenue)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {deleted ? (
                        <Badge tone="danger">محذوف</Badge>
                      ) : i.visibility === 'hidden' ? (
                        <Badge tone="warning" icon={<EyeOffIcon />}>
                          مخفي
                        </Badge>
                      ) : (
                        <span className="text-meta text-muted-foreground">ظاهر</span>
                      )}
                    </TableCell>
                    <TableCell className="text-end">
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
