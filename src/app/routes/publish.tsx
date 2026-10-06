import { Navigate } from 'react-router';

import { PageMeta } from '@/components/shared/page-meta';
import { paths } from '@/config/paths';
import { submitForReview } from '@/features/publishing/api/submit';
import { PublishWorkspace } from '@/features/publishing/components/publish-workspace';
import { VerificationGate } from '@/features/verification/components/verification-callout';
import { requireStudio } from '@/lib/auth';
import { canSell, useMyVerification } from '@/stores/studio-verification';

/**
 * أوّل نشر يمرّ بتوثيق الاستوديو: قبل إرسال الطلب تظهر بوّابة التوثيق بدل مساحة النشر.
 * قيد المراجعة ← المجاني وحده؛ بعد الاعتماد ← المدفوع أيضاً. المشرف لا يحتاج توثيقاً.
 */
export function PublishPage() {
  const user = requireStudio();
  const record = useMyVerification();
  if (!user) return <Navigate to={paths.login.getHref(paths.studio.getHref('publish'))} replace />;
  const isAdmin = user.role === 'admin';
  const status = record?.status ?? 'none';
  if (!isAdmin && status !== 'pending' && status !== 'approved')
    return (
      <>
        <PageMeta title="نشر خط جديد" noindex />
        <VerificationGate />
      </>
    );
  // داخل مساحة الاستوديو: التخطيط يوفّر العمود الجانبي و<main>
  return (
    <>
      <PageMeta title="نشر خط جديد" noindex />
      <PublishWorkspace isAdmin={isAdmin} canSell={isAdmin || canSell(user.id)} onSubmit={submitForReview} />
    </>
  );
}
