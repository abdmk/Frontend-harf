import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { HarfLockup } from '@/components/shared/harf-logo';
import { MagicWandIcon, RefreshIcon, ShieldCheckIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';

const POINTS = [
  [ShieldCheckIcon, 'آلاف الخطوط العربية مرخّصة للاستخدام التجاري'],
  [MagicWandIcon, 'مطابقة الخطوط ومختبر الخط داخل المتصفّح'],
  [RefreshIcon, 'تحديثات مستمرّة تصل مكتبتك تلقائياً'],
] as const;

/**
 * صفحة الدخول (دليل التصميم 6.1 — النسخة أ): لوحة العلامة + النموذج في بطاقة واحدة.
 * على الجوال تُختصر لوحة العلامة إلى الشعار والعنوان فوق النموذج.
 */
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
  return (
    <main id="main" className="grid min-h-dvh place-items-center bg-sunken px-4 py-8 sm:px-6">
      <div className="grid w-full max-w-240 overflow-hidden rounded-xl border bg-card shadow-float lg:grid-cols-2">
        <aside className="relative isolate flex flex-col gap-6 overflow-hidden p-8 sm:p-10 lg:justify-between">
          <span aria-hidden className="absolute inset-0 -z-10 bg-(image:--grad-dawn) opacity-80" />
          <div className="flex flex-col items-start gap-6">
            <Link to={paths.home.getHref()} aria-label="مكتبة حرف — الرئيسية">
              <HarfLockup className="h-9" />
            </Link>
            <span className="rounded-full border border-harf-200 bg-card px-3 py-1 text-caption font-medium text-primary">
              {mode === 'login' ? 'مرحباً في حرف' : 'انضمّ إلى حرف'}
            </span>
            <div>
              <h1 className="text-display leading-tight font-semibold">{title}</h1>
              <p className="mt-3 text-control text-muted-foreground">{lead}</p>
            </div>
          </div>
          <ul className="hidden flex-col gap-3 lg:flex">
            {POINTS.map(([Icon, text]) => (
              <li key={text} className="flex items-center gap-3 text-control text-muted-foreground">
                <span className="grid size-8 place-items-center rounded-xs bg-card text-primary shadow-soft">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </aside>
        <section className="flex flex-col gap-6 border-t p-8 sm:p-10 lg:border-s lg:border-t-0">
          <nav aria-label="نوع الدخول" className="grid grid-cols-2 rounded-full bg-sunken p-1">
            {(
              [
                ['login', 'تسجيل الدخول', paths.login.getHref()],
                ['register', 'حساب جديد', paths.register.getHref()],
              ] as const
            ).map(([m, label, href]) => (
              <Link
                key={m}
                to={href}
                aria-current={mode === m ? 'page' : undefined}
                className={cn(
                  'grid h-10 place-items-center rounded-full text-control transition-colors',
                  mode === m ? 'bg-card font-medium shadow-soft' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
          {children}
        </section>
      </div>
    </main>
  );
}
