import { Navigate } from 'react-router';

import { PageIntro } from '@/components/layout/page-intro';
import { PageMeta } from '@/components/shared/page-meta';
import { paths } from '@/config/paths';
import { ManuscriptUpload } from '@/features/publishing/components/manuscript-upload';
import { MyManuscripts } from '@/features/publishing/components/my-manuscripts';
import { VerificationGate } from '@/features/verification/components/verification-callout';
import { requireStudio } from '@/lib/auth';
import { useMyVerification } from '@/lib/studio-verification';

/** رفع مخطوطة — داخل الاستوديو، وبوّابة التوثيق نفسها التي يمرّ بها نشر الخطوط */
export function ManuscriptUploadPage() {
  const user = requireStudio();
  const record = useMyVerification();
  if (!user) return <Navigate to={paths.login.getHref(paths.studio.getHref('manuscripts/new'))} replace />;
  const status = record?.status ?? 'none';
  if (user.role !== 'admin' && status !== 'pending' && status !== 'approved')
    return (
      <>
        <PageMeta title="رفع مخطوطة" noindex />
        <VerificationGate />
      </>
    );
  return (
    <>
      <PageMeta title="رفع مخطوطة" noindex />
      <PageIntro
        title="رفع مخطوطة"
        lead="ارفع عملك الخطّي بصيغة SVG، وبعد المراجعة يظهر في المخطوطات مجاناً لكل المصمّمين باسمك."
        className="mb-8"
      />
      <ManuscriptUpload />
      <MyManuscripts userId={user.id} />
    </>
  );
}
