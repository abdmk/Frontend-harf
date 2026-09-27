import { Link } from 'react-router';
import { useActionState, useEffect } from 'react';

import { UsageMeter } from '@/components/shared/usage-meter';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  ChevronLeftIcon,
  DownloadIcon,
  FolderIcon,
  HeartIcon,
  MagicWandIcon,
  ReceiptIcon,
} from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { paths } from '@/config/paths';
import type { User } from '@/features/account/types';

import type { FormState } from '../../api/actions';
import { PlanBadge } from '../plan-badge';
import { UserAvatar } from '../user-avatar';
import { SectionCard } from './section-card';

/** «الملف الشخصي» (تصميم 21-09): بطاقة المستخدم بأرقامه، الاستخدام الآن، ومعلوماتك */
export function ProfileSection({
  user,
  action,
}: {
  user: User;
  action: (prev: FormState, form: FormData) => FormState | Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const f = state?.fields ?? {};
  useEffect(() => {
    if (state?.ok) toast({ tone: 'success', title: state.message ?? 'حُفظ' });
  }, [state]);

  const stats = [
    [FolderIcon, user.stats.library, 'في مكتبتي', 'library'],
    [HeartIcon, user.stats.favorites, 'في المفضّلة', 'favorites'],
    [ReceiptIcon, user.stats.purchases, 'مشتريات', 'purchases'],
  ] as const;

  return (
    <div className="flex flex-col gap-5">
      <SectionCard bodyClassName="p-0">
        <div className="flex flex-wrap items-center gap-5 p-6">
          <UserAvatar user={user} className="size-18 text-xl" />
          <div className="min-w-40 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <p className="text-xl font-semibold">{user.name}</p>
              <PlanBadge plan={user.plan} />
            </div>
            {user.profession && <p className="mt-1 text-meta text-muted-foreground">{user.profession}</p>}
          </div>
          {/* على الجوال ينزل البريد سطراً كاملاً تحت الاسم بدل أن يضغطه */}
          <p
            dir="ltr"
            title={user.email}
            className="w-full truncate text-right text-control text-muted-foreground sm:w-auto"
          >
            {user.email}
          </p>
        </div>
        <ul className="grid grid-cols-3 border-t">
          {stats.map(([Icon, n, label, section]) => (
            <li key={section} className="border-s first:border-s-0">
              <Link
                to={paths.account.getHref(section)}
                className="flex items-center justify-center gap-3 px-3 py-5 transition-colors hover:bg-sunken"
              >
                <span className="grid size-10 place-items-center rounded-sm bg-sunken text-muted-foreground max-sm:hidden">
                  <Icon className="size-4.5" />
                </span>
                <span className="text-center sm:text-start">
                  <span dir="ltr" className="block text-xl font-semibold">
                    {n}
                  </span>
                  <span className="text-caption text-muted-foreground">{label}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard
        title="الاستخدام الآن"
        description={`الحدود تتجدّد كل يوم · التجديد القادم خلال ${user.usage.resetsInHours} ساعات`}
        action={
          <Link to={paths.account.getHref('usage')} className="inline-flex items-center gap-1 text-meta font-medium">
            التفاصيل
            <ChevronLeftIcon className="size-3.5" />
          </Link>
        }
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <UsageMeter label="تحميل الخطوط" icon={<DownloadIcon />} meter={user.usage.downloads} />
          <UsageMeter label="مطابقة الخطوط" icon={<MagicWandIcon />} meter={user.usage.matching} />
        </div>
      </SectionCard>

      <SectionCard title="معلوماتك" description="الاسم الذي يظهر على تراخيصك وفواتيرك.">
        <form action={formAction} noValidate className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="p-name">الاسم</FieldLabel>
            <Input
              id="p-name"
              name="name"
              defaultValue={state?.values?.name ?? user.name}
              maxLength={80}
              autoComplete="name"
              aria-invalid={!!f.name}
              aria-describedby="p-name-err"
            />
            <FieldError id="p-name-err">{f.name}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="p-prof">المهنة</FieldLabel>
            <Input
              id="p-prof"
              name="profession"
              defaultValue={state?.values?.profession ?? user.profession}
              maxLength={60}
              aria-invalid={!!f.profession}
            />
            <FieldError>{f.profession}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="p-loc">الموقع</FieldLabel>
            <Input
              id="p-loc"
              name="location"
              defaultValue={state?.values?.location ?? user.location}
              maxLength={60}
              aria-invalid={!!f.location}
            />
            <FieldError>{f.location}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="p-web">الموقع الإلكتروني</FieldLabel>
            <Input
              id="p-web"
              name="website"
              type="url"
              dir="ltr"
              placeholder="https://"
              defaultValue={state?.values?.website ?? user.website}
              maxLength={200}
              aria-invalid={!!f.website}
              aria-describedby="p-web-err"
            />
            <FieldError id="p-web-err">{f.website}</FieldError>
          </Field>
          <div className="flex justify-end sm:col-span-2">
            <Button type="submit" loading={pending}>
              حفظ التغييرات
            </Button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
