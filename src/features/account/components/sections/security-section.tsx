'use client';

import { useActionState } from 'react';

import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { LaptopIcon, TrashIcon } from '@/components/ui/icons';
import type { User } from '@/features/account/types';

import { PasswordField } from './password-field';
import { SectionCard } from './section-card';
import type { FormState } from '../../api/actions';

/** الحساب والأمان: البريد، كلمة المرور، الجلسات، وحذف الحساب */
export function SecuritySection({
  user,
  action,
}: {
  user: User;
  action: (prev: FormState, form: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const f = state?.fields ?? {};
  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="البريد الإلكتروني">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p dir="ltr" className="text-control">
            {user.email}
          </p>
          <Badge tone="success">موثّق</Badge>
        </div>
      </SectionCard>

      <SectionCard title="كلمة المرور" description="بعد التغيير تُنهى جلساتك على الأجهزة الأخرى.">
        <form action={formAction} noValidate className="grid gap-5 sm:max-w-md">
          {state?.message && <Alert tone={state.ok ? 'success' : 'danger'} title={state.message} />}
          <Field>
            <FieldLabel htmlFor="pw-current">كلمة المرور الحالية</FieldLabel>
            <PasswordField id="pw-current" name="current" autoComplete="current-password" invalid={f.current} />
            <FieldError>{f.current}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="pw-next">كلمة المرور الجديدة</FieldLabel>
            <PasswordField id="pw-next" name="next" autoComplete="new-password" invalid={f.next} />
            <FieldError>{f.next}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="pw-confirm">تأكيد كلمة المرور</FieldLabel>
            <PasswordField id="pw-confirm" name="confirm" autoComplete="new-password" invalid={f.confirm} />
            <FieldError>{f.confirm}</FieldError>
          </Field>
          <div>
            <Button type="submit" loading={pending}>
              تغيير كلمة المرور
            </Button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="الجلسات النشطة">
        <div className="flex items-center gap-4">
          <span className="grid size-10 place-items-center rounded-sm bg-sunken text-muted-foreground">
            <LaptopIcon className="size-5" />
          </span>
          <div className="flex-1">
            <p className="text-control font-medium">هذا الجهاز</p>
            <p className="text-caption text-muted-foreground">نشطة الآن</p>
          </div>
          <Badge tone="success">الحالية</Badge>
        </div>
      </SectionCard>

      <SectionCard
        title="حذف الحساب"
        description="يُحذف حسابك وبياناتك. تبقى إيصالات مشترياتك محفوظة كما يقتضي القانون."
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="danger">
              <TrashIcon />
              حذف الحساب
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>حذف حسابك نهائياً؟</DialogTitle>
              <DialogDescription>
                لا يمكن التراجع عن هذا الإجراء. سنرسل رابط تأكيد إلى بريدك قبل الحذف.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">إلغاء</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="danger">أرسل رابط التأكيد</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SectionCard>
    </div>
  );
}
