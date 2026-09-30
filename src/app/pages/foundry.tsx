import { Navigate, useParams } from 'react-router';

import { CatalogCard } from '@/app/_components/catalog-card';
import { Container } from '@/components/layout/container';
import { DesignerCard } from '@/components/shared/designer-card';
import { EmptyState } from '@/components/shared/empty-state';
import { FontGrid } from '@/components/shared/font-grid';
import { PageMeta } from '@/components/shared/page-meta';
import { SectionHeading } from '@/components/shared/section-heading';
import { LayersIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { getFonts } from '@/features/catalog/api/get-fonts';
import { DEFAULT_QUERY } from '@/features/catalog/types/catalog-query';
import { getFoundry, getFoundryDesigners } from '@/features/studio/api/get-studio';
import { FoundryProfile } from '@/features/studio/components/foundry-profile';
import { getCurrentUser } from '@/lib/auth';
import { getPublicProfile, type SocialKey, socialUrl } from '@/lib/public-profile';

export function FoundryPage() {
  const { id } = useParams<{ id: string }>();
  const found = getFoundry(id!);
  if (!found) return <Navigate to="/" replace />;
  // ⚠️ عرض: الملف العام المحفوظ في هذا المتصفّح يظهر لصاحب الاستوديو؛ مع الخادم يأتي من قاعدة البيانات
  const own = getCurrentUser()?.plan === 'studio' ? getPublicProfile() : null;
  const data = own
    ? {
        ...found,
        foundry: {
          ...found.foundry,
          bio: own.bio || found.foundry.bio,
          links: {
            website: own.website || undefined,
            ...Object.fromEntries(
              (Object.keys(own.social) as SocialKey[]).map((k) => [k, socialUrl(k, own.social[k]!)]),
            ),
          },
        },
      }
    : found;
  const ids = new Set(data.fonts.map((f) => f.id));
  const fonts = getFonts(DEFAULT_QUERY).filter((f) => ids.has(f.id));
  const downloads = data.fonts.reduce((sum, f) => sum + f.downloads, 0);
  const all = getFonts(DEFAULT_QUERY);
  const designers = getFoundryDesigners(data.foundry.id).map((d) => {
    const own = all.filter((f) => f.designers.some((x) => x.id === d.id));
    return { d, own, weights: own.reduce((sum, f) => sum + f.weights, 0) };
  });

  return (
    <Container as="main" id="main" className="py-8 sm:py-12">
      <PageMeta title={data.foundry.name} description={data.foundry.bio} />
      <FoundryProfile
        foundry={data.foundry}
        stats={{ fonts: data.fonts.length, downloads }}
        cover={own?.cover}
        avatar={own?.avatar}
      />
      <section aria-labelledby="ff-title" className="mt-12">
        <SectionHeading
          id="ff-title"
          title={
            <>
              خطوط المسبك{' '}
              <span dir="ltr" className="font-normal text-tertiary">
                ({fonts.length})
              </span>
            </>
          }
          description="كل خط منشور من هذا المسبك، بتراخيصه وأسعاره."
        />
        <FontGrid
          fonts={fonts}
          renderCard={(f) => <CatalogCard font={f} />}
          empty={
            <EmptyState
              icon={<LayersIcon />}
              title="لا خطوط منشورة بعد"
              description="تابع المسبك ليصلك إشعار حين ينشر أول خط."
            />
          }
        />
      </section>

      {designers.length > 0 && (
        <section aria-labelledby="fd-title" className="mt-14">
          <SectionHeading
            id="fd-title"
            title={
              <>
                مصمّمو المسبك{' '}
                <span dir="ltr" className="font-normal text-tertiary">
                  ({designers.length})
                </span>
              </>
            }
            description="من يصمّمون خطوط المسبك — افتح ملف أيّ منهم لترى كل أعماله."
          />
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {designers.map(({ d, own, weights }) => (
              <li key={d.id}>
                <DesignerCard
                  id={d.id}
                  href={paths.designer.getHref(d.id)}
                  name={d.nameAr}
                  initials={d.initials}
                  subtitle={`${d.role} · ${d.location.split('،')[0]}`}
                  verified={d.verified}
                  stats={{ fonts: own.length, weights, followers: d.followers }}
                  fonts={own.map((f) => f.name.replace(/\s+(Typeface|TRIAL)$/i, ''))}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
}
