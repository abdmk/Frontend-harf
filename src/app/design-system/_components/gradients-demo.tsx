import type { CSSProperties } from 'react';

import { CheckIcon, DownloadIcon, MagicWandIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

import { DsSection } from './ds-section';

type Dir = { id: string; name: string; en: string; mood: string; use: string };

/** الاتجاه المعتمد — القيم في src/design-system/gradients.css */
const DIRS: Dir[] = [
  {
    id: 'dawn',
    name: 'فجر',
    en: 'Dawn',
    mood: 'خوخي يذوب في وردي — دافئ ومرحّب، أقرب روحاً لحرف دون أن يكون أحمرها.',
    use: 'مقدّمات الأدوات والمجموعات، صناديق التواصل، وبطاقة الرصيد في المالية — لحظة واحدة في الصفحة.',
  },
];

const bg = (id: string, sheen = false): CSSProperties => ({
  background: sheen ? `var(--grad-sheen), var(--grad-${id})` : `var(--grad-${id})`,
  borderColor: `var(--grad-${id}-edge)`,
});
const ink = (id: string): CSSProperties => ({ color: `var(--grad-${id}-ink)` });

/** عيّنات اتجاه واحد داخل وضع واحد: شريط مقدّمة، بطاقة رقم، وتنبيه بحافّة ملوّنة */
function Samples({ d, mode }: { d: Dir; mode: 'light' | 'dark' }) {
  return (
    <div className={cn(mode, 'flex flex-col gap-3 rounded-xl bg-background p-4 text-foreground')}>
      <p className="text-caption text-tertiary">{mode === 'light' ? 'Light · فاتح' : 'Dark · داكن'}</p>

      {/* شريط مقدّمة صفحة — اللون في الزاوية فقط */}
      <div className="rounded-lg border bg-card p-5" style={bg(d.id, true)}>
        <p className="text-caption font-medium" style={ink(d.id)}>
          لحظة لونية
        </p>
        <p className="mt-1 text-lg font-semibold">خطوط عربية تصنع الهوية</p>
        <p className="mt-1 text-meta text-muted-foreground">اللون يسكن الزاوية ويتلاشى قبل النص.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* بطاقة رقم — توهّج خافت خلف الأيقونة */}
        <div className="rounded-lg border bg-card p-4" style={bg(d.id)}>
          <span className="grid size-8 place-items-center rounded-full bg-card shadow-soft" style={ink(d.id)}>
            <DownloadIcon className="size-4" />
          </span>
          <p className="mt-3 text-caption text-muted-foreground">التحميلات</p>
          <p dir="ltr" className="text-right text-xl font-semibold tabular-nums">
            53,736
          </p>
        </div>
        {/* بطاقة عادية بجانبها — الـ80% الهادئة */}
        <div className="rounded-lg border bg-card p-4">
          <span className="grid size-8 place-items-center rounded-full bg-sunken text-muted-foreground">
            <MagicWandIcon className="size-4" />
          </span>
          <p className="mt-3 text-caption text-muted-foreground">بطاقة محايدة</p>
          <p dir="ltr" className="text-right text-xl font-semibold tabular-nums">
            4.8
          </p>
        </div>
      </div>

      {/* تنبيه — اللون من حافّة البداية فقط */}
      <div
        className="flex items-center gap-3 rounded-lg border bg-card p-3"
        style={{
          background: `linear-gradient(to left, var(--grad-${d.id}-edge), transparent 45%), var(--card)`,
        }}
      >
        <span className="grid size-7 place-items-center rounded-full bg-card shadow-soft" style={ink(d.id)}>
          <CheckIcon className="size-3.5" />
        </span>
        <p className="text-meta">حُفظ ملفك العام</p>
      </div>
    </div>
  );
}

/**
 * «لحظات لونية» — الاتجاه المعتمد «فجر» بوضعيه جنباً إلى جنب
 * (جزيرة ‎.light‎ و‎.dark‎)، على عناصر حقيقية وبجانبها عنصر محايد لتظهر نسبة 80/20.
 */
export function GradientsDemo() {
  return (
    <DsSection
      id="gradients"
      num="1.9"
      title="لحظات لونية"
      en="Gradient Moments"
      status="live"
      note="الاتجاه المعتمد «فجر» — يُستعمل بالصنف moment في الأماكن المذكورة فقط."
    >
      <div className="mb-8 grid gap-4 rounded-xl border bg-card p-5 text-meta leading-relaxed text-muted-foreground sm:grid-cols-3">
        <div>
          <p className="font-semibold text-foreground">80 / 20</p>
          <p className="mt-1">
            الصفحة تبقى محايدة. لحظة لونية واحدة في كل شاشة على الأكثر: مقدّمة، بطاقة مميّزة، أو حالة نجاح.
          </p>
        </div>
        <div>
          <p className="font-semibold text-foreground">الفاتح</p>
          <p className="mt-1">
            لونان باستيليّان من زاوية، يتلاشيان نحو الأبيض قبل منتصف العنصر. لمعة قطرية خفيفة اختيارية.
          </p>
        </div>
        <div>
          <p className="font-semibold text-foreground">الداكن</p>
          <p className="mt-1">
            لون واحد عميق قليل التشبّع يذوب في سطح البطاقة، مع حدّ رفيع على الزاوية المضيئة. لا توهّج خارج العنصر ولا
            نيون.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-10">
        {DIRS.map((d, i) => (
          <article key={d.id} aria-labelledby={`g-${d.id}`} className="flex flex-col gap-4">
            <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-caption text-tertiary tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <h3 id={`g-${d.id}`} className="text-lg font-semibold">
                {d.name}{' '}
                <span dir="ltr" className="font-normal text-tertiary">
                  {d.en}
                </span>
              </h3>
              <p className="w-full text-meta text-muted-foreground">{d.mood}</p>
              <p className="w-full text-caption text-tertiary">مقترح لـ: {d.use}</p>
            </header>
            <div className="grid gap-3 rounded-2xl border bg-sunken p-3 md:grid-cols-2">
              <Samples d={d} mode="light" />
              <Samples d={d} mode="dark" />
            </div>
          </article>
        ))}
      </div>
    </DsSection>
  );
}
