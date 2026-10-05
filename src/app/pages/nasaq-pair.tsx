import { useParams, useSearchParams } from 'react-router';

import { Container } from '@/components/layout/container';
import { PageMeta } from '@/components/shared/page-meta';
import { PairPage } from '@/features/pairing/components/pair-page';
import { FAMILIES, LANG_SETS, USE_CASES, type UseCaseKey } from '@/features/pairing/data/catalog';
import { SPECIMENS } from '@/features/pairing/data/specimens';
import { comboFromSlug } from '@/features/pairing/utils/pairing';

import { NotFoundPage } from './not-found';

const isUse = (v: string | null): v is UseCaseKey => !!v && Object.hasOwn(USE_CASES, v);

/** صفحة تركيبة «نسق» — الرابط وحده يكفي لإعادة بنائها: /tools/nasaq/<عنوان>+<متن>?use=&lang=&t= */
export function NasaqPairPage() {
  const { pair = '' } = useParams<{ pair: string }>();
  const [params] = useSearchParams();
  const use = isUse(params.get('use')) ? (params.get('use') as UseCaseKey) : 'identity';
  const lang = params.get('lang');
  const combo = comboFromSlug(FAMILIES, pair, USE_CASES[use]);
  if (!combo) return <NotFoundPage inLayout />;
  const custom = (params.get('t') ?? '').trim().slice(0, 80);
  const text = custom ? { ...SPECIMENS[use], heading: custom } : SPECIMENS[use];
  const showLatin = lang === 'ar-en' && Object.hasOwn(LANG_SETS, lang);
  const name = [combo.heading, combo.sub, combo.body].flatMap((s) => (s ? [s.font.nameAr] : [])).join(' + ');

  return (
    <Container as="main" id="main" className="py-8 sm:py-12">
      <PageMeta title={`${name} — نسق`} description={`تركيبة ${name}: ${combo.reason}`} />
      <PairPage combo={combo} text={text} showLatin={showLatin} />
    </Container>
  );
}
