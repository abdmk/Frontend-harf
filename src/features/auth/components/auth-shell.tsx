import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { HarfMark } from '@/components/shared/harf-logo';
import { paths } from '@/config/paths';

const SWITCH = {
  login: ['ليس لديك حساب؟', 'أنشئ حساباً', paths.register.getHref()],
  register: ['لديك حساب؟', 'سجّل الدخول', paths.login.getHref()],
} as const;

/** صفحة الدخول/التسجيل: عمود واحد متمركز — الرمز، العنوان، النموذج، ثم رابط التبديل */
export function AuthShell({
  mode,
  title,
  lead,
  children,
}: {
  mode: 'login' | 'register';
  title: string;
  lead: string;
  children: ReactNode;
}) {
  const [question, action, href] = SWITCH[mode];
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center px-4 py-10 sm:justify-center sm:py-16">
      <div className="flex w-full max-w-sm animate-fade-up flex-col gap-8">
        <header className="flex flex-col items-center gap-5 text-center">
          <Link
            to={paths.home.getHref()}
            aria-label="مكتبة حرف — الرئيسية"
            className="rounded-full text-primary transition-transform active:scale-95"
          >
            <HarfMark className="size-11" />
          </Link>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-control text-muted-foreground">{lead}</p>
          </div>
        </header>

        {children}

        <p className="text-center text-control text-muted-foreground">
          {question}{' '}
          <Link to={href} className="font-medium text-primary hover:underline">
            {action}
          </Link>
        </p>
      </div>

      <footer className="mt-10 flex gap-3 text-caption text-tertiary sm:mt-14">
        <a href="#" className="hover:text-foreground">
          الشروط والأحكام
        </a>
        <span aria-hidden>·</span>
        <a href="#" className="hover:text-foreground">
          سياسة الخصوصية
        </a>
      </footer>
    </main>
  );
}
