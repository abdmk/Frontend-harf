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
import { getFoundry, getFoundryDesigners, getStudio, MOCK_STUDIO_OWNER } from '@/features/studio/api/get-studio';
import { FoundryProfile } from '@/features/studio/components/foundry-profile';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getPublicProfile, markOf, type SocialKey, socialUrl } from '@/lib/public-profile';
import { useIsVerified } from '@/lib/studio-verification';

export function FoundryPage() {
  const { id } = useParams<{ id: string }>();
  const me = useCurrentUser();
  // مسبك هذا الحساب نفسه (القائم أو الجديد) — صفحته موجودة دائماً لصاحبها، ولو لم ينشر بعد
  const mine = me?.plan === 'studio' ? getStudio(me) : null;
  const isMine = !!mine && mine.foundry.id === id;
  const found =
    getFoundry(id!) ??
    (isMine ? { foundry: mine.foundry, fonts: mine.fonts.filter((f) => f.status === 'published') } : null);
  // علامة التوثيق من اعتماد حساب صاحب المسبك، لا من البيانات الثابتة
  const ownerVerified = useIsVerified(
    isMine ? me!.id : id === getFoundry(id!)?.foundry.id ? MOCK_STUDIO_OWNER : undefined,
  );
  if (!found) return <Navigate to="/" replace />;
  // ⚠️ عرض: الملف المحفوظ في هذا المتصفّح يظهر على مسبك صاحبه وحده؛ مع الخادم يأتي من قاعدة البيانات
  const own = isMine ? getPublicProfile() : null;
  const data = own
    ? {
        ...found,
        foundry: {
          ...found.foundry,
          name: own.name || found.foundry.name,
          nameEn: own.nameEn || found.foundry.nameEn,
          location: own.location || found.foundry.location,
          mark: own.name ? markOf(own.name) : found.foundry.mark,
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
  data.foundry = { ...data.foundry, verified: ownerVerified };
  const kind = own?.kind ?? 'foundry';
  const isDesigner = kind === 'designer';
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
        kind={kind}
      />
      <section aria-labelledby="ff-title" className="mt-12">
        <SectionHeading
          id="ff-title"
          title={
            <>
              {isDesigner ? 'الخطوط' : 'خطوط المسبك'}{' '}
              <span dir="ltr" className="font-normal text-tertiary">
                ({fonts.length})
              </span>
            </>
          }
          description={
            isDesigner
              ? `كل خط نشره ${data.foundry.name}، بتراخيصه وأسعاره.`
              : 'كل خط منشور من هذا المسبك، بتراخيصه وأسعاره.'
          }
        />
        <FontGrid
          fonts={fonts}
          renderCard={(f) => <CatalogCard font={f} />}
          empty={
            <EmptyState
              icon={<LayersIcon />}
              title="لا خطوط منشورة بعد"
              description={
                isDesigner ? 'تابعه ليصلك إشعار حين ينشر أول خط.' : 'تابع المسبك ليصلك إشعار حين ينشر أول خط.'
              }
            />
          }
        />
      </section>

      {/* مصمّمو المسبك — لصفحة المسبك وحدها */}
      {!isDesigner && designers.length > 0 && (
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
