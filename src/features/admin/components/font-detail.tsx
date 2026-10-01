import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { AreaChart } from '@/components/shared/charts/area-chart';
import { ChartCard } from '@/components/shared/charts/chart-frame';
import { EmptyState } from '@/components/shared/empty-state';
import { SectionCard } from '@/components/shared/section-card';
import { StatCard } from '@/components/shared/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CartIcon,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  HeartIcon,
  LayersIcon,
  PencilIcon,
  RefreshIcon,
  StarIcon,
  TrashIcon,
} from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { faceStyle } from '@/lib/font-weight';
import { formatDateAr, weightsLabel } from '@/lib/format';
import { CATEGORY_LABEL, LANG_LABEL, TYPE_LABEL, USAGE_LABEL } from '@/lib/labels';

import { AdminPageHeader } from './admin-nav';
import { DeleteFontDialog, EditFontDialog } from './font-dialogs';
import { restore, toggleFeatured, toggleHidden, VIS_LABEL } from './font-store';
import { useStoreFonts } from '../api/fonts-store';
import { fmt } from '../utils';

const DAY_LABELS = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(Date.now() - (29 - i) * 864e5);
  return d.toLocaleDateString('ar', { day: 'numeric', month: 'short' });
});

/** صفحة خط داخل المخزن: الحالة والإجراءات، الإحصاءات، والبيانات كما تظهر للزوّار */
export function FontDetail({ id }: { id: string }) {
  const item = useStoreFonts().find((i) => i.font.id === id);
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);
  const [del, setDel] = useState(false);
  if (!item)
    return (
      <EmptyState
        icon={<LayersIcon />}
        title="الخط غير موجود"
        action={
          <Button variant="outline" onClick={() => navigate(paths.admin.getHref('fonts'))}>
            العودة إلى المخزن
          </Button>
        }
      />
    );

  const f = item.font;
  const s = item.stats;
  const deleted = item.visibility === 'deleted';
  const conversion = s.views ? ((s.downloads / s.views) * 100).toFixed(1) : '0';
  const info: [string, React.ReactNode][] = [
    ['المصمّمون', f.designerLabel ?? (f.designers.map((d) => d.nameAr).join('، ') || '—')],
    ['التصنيف', CATEGORY_LABEL[f.category]],
    ['النوع', `${TYPE_LABEL[f.type]}${f.type !== 'free' ? ` · $${f.price}` : ''}`],
    ['الاستخدام', USAGE_LABEL[f.usage]],
    ['الأوزان', weightsLabel(f.weights)],
    ['اللغات', f.langs.map((l) => LANG_LABEL[l]).join('، ')],
    ['تاريخ النشر', formatDateAr(f.releasedAt)],
    ['الوسوم', f.tags?.length ? f.tags.join('، ') : '—'],
  ];

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        back={{ to: paths.admin.getHref('fonts'), label: 'مخزن الخطوط' }}
        title={f.name}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge
              tone={item.visibility === 'visible' ? 'success' : item.visibility === 'hidden' ? 'neutral' : 'danger'}
              icon={
                item.visibility === 'visible' ? (
                  <EyeIcon />
                ) : item.visibility === 'hidden' ? (
                  <EyeOffIcon />
                ) : (
                  <TrashIcon />
                )
              }
            >
              {VIS_LABEL[item.visibility]}
            </Badge>
            {item.featured && (
              <Badge tone="studio" icon={<StarIcon filled />}>
                مميّز
              </Badge>
            )}
          </span>
        }
        action={
          deleted ? (
            <Button onClick={() => restore(item)}>
              <RefreshIcon />
              استرجاع
            </Button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setEdit(true)}>
                <PencilIcon />
                تعديل
              </Button>
              <Button variant="outline" onClick={() => toggleHidden(item)}>
                {item.visibility === 'visible' ? <EyeOffIcon /> : <EyeIcon />}
                {item.visibility === 'visible' ? 'إخفاء' : 'إظهار'}
              </Button>
              <Button variant="outline" onClick={() => toggleFeatured(item)} aria-pressed={item.featured}>
                <StarIcon filled={item.featured} />
                {item.featured ? 'مميّز' : 'تمييز'}
              </Button>
              <Button variant="danger" onClick={() => setDel(true)}>
                <TrashIcon />
                حذف
              </Button>
            </div>
          )
        }
      />

      {f.face && (
        <p
          aria-hidden
          className="truncate rounded-xl border bg-card px-6 py-8 text-5xl leading-normal sm:text-6xl"
          style={faceStyle(f.face, 700)}
        >
          {f.face.nameAr} — أبجد هوز حطي
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard tone="info" label="المشاهدات" value={fmt(s.views)} icon={<EyeIcon />} hint="زيارات صفحة الخط" />
        <StatCard
          tone="ok"
          label="التحميلات"
          value={fmt(s.downloads)}
          icon={<DownloadIcon />}
          hint={`${conversion}% من المشاهدات`}
        />
        <StatCard tone="brand" label="في المفضّلة" value={fmt(s.favorites)} icon={<HeartIcon />} />
        {f.type === 'free' ? (
          <StatCard tone="brand" label="الإيراد" value="—" icon={<CartIcon />} hint="خط مجاني" />
        ) : (
          <StatCard
            tone="brand"
            label="الإيراد"
            value={`$${fmt(s.revenue)}`}
            icon={<CartIcon />}
            hint={`${fmt(s.sales)} ترخيص`}
          />
        )}
      </div>

      <ChartCard title="التحميلات اليومية" subtitle="آخر 30 يوماً · بيانات تجريبية">
        <AreaChart
          labels={DAY_LABELS}
          values={s.daily}
          label="التحميلات"
          caption={`تحميلات ${f.name} اليومية خلال آخر 30 يوماً`}
        />
      </ChartCard>

      <SectionCard
        title="البيانات"
        description="كما تظهر للزوّار"
        action={
          item.visibility === 'visible' ? (
            <Button asChild variant="ghost" size="sm">
              <Link to={paths.font.getHref(f.id)}>صفحة الخط</Link>
            </Button>
          ) : undefined
        }
      >
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {info.map(([k, v]) => (
            <div key={k}>
              <dt className="text-caption text-tertiary">{k}</dt>
              <dd className="mt-0.5 text-control">{v}</dd>
            </div>
          ))}
        </dl>
      </SectionCard>

      {edit && <EditFontDialog item={item} open={edit} onOpenChange={setEdit} />}
      {del && <DeleteFontDialog item={item} open={del} onOpenChange={setDel} />}
    </div>
  );
}
