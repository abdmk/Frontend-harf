import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { ClockIcon, ExclamationIcon, ShieldCheckIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { cn } from '@/lib/utils';
import { type PublicStatus, useMyVerification } from '@/stores/studio-verification';

const VIEW: Record<
  Exclude<PublicStatus, 'approved'>,
  { tone: string; Icon: typeof ShieldCheckIcon; title: string; text: string; cta: string }
> = {
  none: {
    tone: 'bg-tint-brand text-primary',
    Icon: ShieldCheckIcon,
    title: 'وثّق حسابك لتبدأ البيع',
    text: 'خمس خطوات قصيرة: بياناتك، وثيقة الهوية، وسيلة استلام الأرباح، وتوقيع الاتفاقية.',
    cta: 'ابدأ التوثيق',
  },
  draft: {
    tone: 'bg-tint-brand text-primary',
    Icon: ShieldCheckIcon,
    title: 'أكمل توثيق حسابك',
    text: 'حفظنا ما أدخلته — أكمل الخطوات المتبقية وأرسل الطلب للمراجعة.',
    cta: 'أكمل التوثيق',
  },
  pending: {
    tone: 'bg-tint-warn text-warn-text',
    Icon: ClockIcon,
    title: 'طلب التوثيق قيد المراجعة',
    text: 'الخطوط المدفوعة والمبيعات تُفتح بعد اعتماد الإدارة — عادةً خلال يومي عمل.',
    cta: 'تفاصيل الطلب',
  },
  rejected: {
    tone: 'bg-tint-dgr text-dgr-text',
    Icon: ExclamationIcon,
    title: 'لم يُعتمد طلب التوثيق',
    text: 'اطّلع على ملاحظة فريق التوثيق، عدّل ما يلزم، وأعد الإرسال.',
    cta: 'عدّل الطلب',
  },
};

/** بطاقة حالة التوثيق في صفحات الاستوديو — تختفي بعد الاعتماد */
export function VerificationCallout({ className }: { className?: string }) {
  const rec = useMyVerification();
  const status: PublicStatus = rec?.status ?? 'none';
  if (status === 'approved') return null;
  const v = VIEW[status];
  return (
    <section
      aria-label="توثيق الحساب"
      className={cn(
        'flex animate-fade-up flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center',
        className,
      )}
    >
      <span className={cn('grid size-11 shrink-0 place-items-center rounded-full [&_svg]:size-5', v.tone)}>
        <v.Icon />
      </span>
      <div className="flex-1">
        <h2 className="text-control font-semibold">{v.title}</h2>
        <p className="mt-0.5 text-meta leading-relaxed text-muted-foreground">{v.text}</p>
      </div>
      <Button asChild variant={status === 'pending' ? 'secondary' : 'primary'}>
        <Link to={paths.studio.getHref('verify')}>{v.cta}</Link>
      </Button>
    </section>
  );
}

const GATE_STEPS = ['بيانات الاستوديو', 'وثائق الهوية', 'استلام الأرباح', 'توقيع الاتفاقية', 'مراجعة الإدارة'];

/** بوّابة النشر الأوّل: بدل مساحة النشر حتى يُرسَل طلب التوثيق */
export function VerificationGate() {
  const rec = useMyVerification();
  const rejected = rec?.status === 'rejected';
  const started = rec?.status === 'draft';
  return (
    <section
      aria-labelledby="gate-title"
      className="mx-auto flex max-w-2xl animate-fade-up flex-col items-center rounded-2xl border bg-card px-6 py-12 text-center sm:px-12"
    >
      <span
        className={cn(
          'grid size-16 place-items-center rounded-2xl [&_svg]:size-7',
          rejected ? 'bg-tint-dgr text-dgr-text' : 'bg-tint-brand text-primary',
        )}
      >
        {rejected ? <ExclamationIcon /> : <ShieldCheckIcon />}
      </span>
      <h1 id="gate-title" className="mt-6 text-3xl font-bold tracking-tight">
        {rejected ? 'عدّل طلب التوثيق لتنشر' : 'قبل أوّل نشر: وثّق حسابك'}
      </h1>
      <p className="mt-3 max-w-md text-control leading-relaxed text-muted-foreground">
        {rejected
          ? 'لم يُعتمد طلبك السابق. اطّلع على ملاحظة فريق التوثيق، أصلح ما يلزم، وأعد الإرسال.'
          : 'نتعرّف عليك ونتّفق على الشروط مرّة واحدة. بعد الإرسال تنشر خطوطك المجانية فوراً، والمدفوعة بعد الاعتماد.'}
      </p>
      <ol className="mt-8 flex flex-wrap justify-center gap-2" aria-label="مراحل التوثيق">
        {GATE_STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2 rounded-full bg-sunken py-1.5 ps-1.5 pe-3.5 text-meta">
            <span className="grid size-6 place-items-center rounded-full bg-card text-caption font-semibold tabular-nums">
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>
      <Button asChild size="xl" variant="primary" className="mt-10 w-full sm:w-72">
        <Link to={paths.studio.getHref('verify')}>
          {rejected ? 'عدّل الطلب' : started ? 'أكمل التوثيق' : 'ابدأ التوثيق'}
        </Link>
      </Button>
      <p className="mt-4 text-meta text-muted-foreground">نحو 5 دقائق · يُحفظ تقدّمك تلقائياً</p>
    </section>
  );
}
