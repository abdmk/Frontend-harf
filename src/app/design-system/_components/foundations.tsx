import * as Icons from '@/components/ui/icons';
import { cn } from '@/lib/cn';

import { DsPanel, DsSection } from './ds-section';
import { MotionDemo } from './motion-demo';

/* أسماء الأصناف مكتوبة حرفياً كي يولّدها Tailwind */
const PALETTE: [string, [string, string][]][] = [
  [
    'حرف (الأحمر)',
    [
      ['50', 'bg-harf-50'],
      ['100', 'bg-harf-100'],
      ['200', 'bg-harf-200'],
      ['300', 'bg-harf-300'],
      ['400', 'bg-harf-400'],
      ['500', 'bg-harf-500'],
      ['600', 'bg-harf-600'],
      ['700', 'bg-harf-700'],
      ['800', 'bg-harf-800'],
      ['900', 'bg-harf-900'],
    ],
  ],
  [
    'الدلالات',
    [
      ['ok-500', 'bg-ok-500'],
      ['trial-500', 'bg-trial-500'],
      ['warn-500', 'bg-warn-500'],
      ['dgr-500', 'bg-dgr-500'],
      ['ai-500', 'bg-ai-500'],
      ['gold-500', 'bg-gold-500'],
    ],
  ],
];

const ROLES: [string, string, string][] = [
  ['background', 'bg-background', 'أرضية الصفحة'],
  ['card', 'bg-card', 'البطاقات'],
  ['sunken', 'bg-sunken', 'الحقول والشرائح'],
  ['inset', 'bg-inset', 'عمق إضافي'],
  ['page-muted', 'bg-page-muted', 'منطقة المحتوى في الحساب'],
  ['ink', 'bg-ink', 'الأسطح الداكنة'],
  ['primary', 'bg-primary-fill', 'لون الفعل الوحيد'],
  ['tint-brand', 'bg-tint-brand', 'تلوين خفيف'],
  ['tint-ok', 'bg-tint-ok', 'نجاح'],
  ['tint-info', 'bg-tint-info', 'معلومة / تجريبي'],
  ['tint-warn', 'bg-tint-warn', 'تحذير'],
  ['tint-dgr', 'bg-tint-dgr', 'خطأ'],
];

const TEXT: [string, string, string][] = [
  ['foreground', 'text-foreground', 'النص الأساسي'],
  ['muted-foreground', 'text-muted-foreground', 'النص الثانوي'],
  ['tertiary', 'text-tertiary', 'التلميحات'],
  ['primary', 'text-primary', 'الروابط والفعل'],
];

const TYPE: [string, string, string][] = [
  ['display', 'text-display font-semibold', 'نحتاج خطاً خاصاً لهويتك؟'],
  ['title', 'text-title font-semibold', 'Zaetoon Typeface'],
  ['2xl', 'text-2xl font-semibold', 'الخط الحسن يجعل الحق أوضح'],
  ['xl', 'text-xl font-medium', 'الخط الحسن يجعل الحق أوضح'],
  ['base', 'text-base', 'الخط الحسن يجعل الحق أوضح'],
  ['lead · 15', 'text-lead', 'الخط الحسن يجعل الحق أوضح'],
  ['sm · 14', 'text-sm', 'الخط الحسن يجعل الحق أوضح'],
  ['control · 13', 'text-control', 'الخط الحسن يجعل الحق أوضح'],
  ['meta · 12.5', 'text-meta', 'الخط الحسن يجعل الحق أوضح'],
  ['caption · 11.5', 'text-caption', 'الخط الحسن يجعل الحق أوضح'],
  ['micro · 10', 'text-micro', 'SIL OFL · 10 أوزان'],
];

const SPACE = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20] as const;
const SPACE_W: Record<(typeof SPACE)[number], string> = {
  1: 'w-1',
  2: 'w-2',
  3: 'w-3',
  4: 'w-4',
  5: 'w-5',
  6: 'w-6',
  8: 'w-8',
  10: 'w-10',
  12: 'w-12',
  16: 'w-16',
  20: 'w-20',
};

const RADII: [string, string, string][] = [
  ['xs · 8', 'rounded-xs', 'شارة، زرّ صغير'],
  ['sm · 12', 'rounded-sm', 'زرّ، حقل'],
  ['md · 16', 'rounded-md', 'بطاقة داخلية'],
  ['lg · 22', 'rounded-lg', 'بطاقة'],
  ['xl · 28', 'rounded-xl', 'قسم، نافذة'],
  ['full', 'rounded-full', 'شريحة، صورة رمزية'],
];

const SHADOWS: [string, string, string][] = [
  ['soft', 'shadow-soft', 'بطاقة ساكنة، زرّ عائم'],
  ['float', 'shadow-float', 'قائمة منبثقة'],
  ['overlay', 'shadow-overlay', 'نافذة، ورقة جانبية'],
  ['focus', 'shadow-focus', 'تركيز الحقول'],
];

export function Foundations() {
  const icons = Object.entries(Icons).filter(([n]) => n.endsWith('Icon')) as [string, Icons.IconComponent][];
  return (
    <>
      <DsSection
        id="color"
        num="1.1"
        title="الألوان"
        en="Colors"
        note="الأحمر لون الفعل الوحيد. الألوان الدلالية للحالات فقط. بدّل الوضع من الترويسة لرؤية الأدوار في الداكن."
      >
        {PALETTE.map(([label, list]) => (
          <DsPanel key={label} label={label}>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {list.map(([n, cls]) => (
                <div key={n} className="flex flex-col gap-1.5">
                  <span className={cn('h-12 rounded-xs border border-black/5', cls)} />
                  <span dir="ltr" className="text-caption text-tertiary">
                    {n}
                  </span>
                </div>
              ))}
            </div>
          </DsPanel>
        ))}
        <DsPanel label="الأدوار الدلالية — تتغيّر مع الوضع">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ROLES.map(([n, cls, use]) => (
              <div key={n} className="flex items-center gap-3">
                <span className={cn('size-10 shrink-0 rounded-xs border', cls)} />
                <span className="min-w-0">
                  <span dir="ltr" className="block truncate font-mono text-caption">
                    {n}
                  </span>
                  <span className="block text-caption text-tertiary">{use}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-6">
            {TEXT.map(([n, cls, use]) => (
              <span key={n} className={cn('text-lead font-medium', cls)}>
                {use}{' '}
                <span dir="ltr" className="font-mono text-caption">
                  ({n})
                </span>
              </span>
            ))}
          </div>
        </DsPanel>
      </DsSection>

      <DsSection
        id="type"
        num="1.2"
        title="الطباعة"
        en="Typography"
        status="reference"
        note="Graphik Arabic بستة أوزان (250–600). ارتفاع السطر 1.8 للنصوص و1.3 للعناوين."
      >
        <DsPanel className="divide-y p-0">
          {TYPE.map(([n, cls, sample]) => (
            <div key={n} className="flex items-baseline gap-6 px-6 py-4">
              <span dir="ltr" className="w-28 shrink-0 font-mono text-caption text-tertiary">
                {n}
              </span>
              <span className={cn('min-w-0 truncate', cls)}>{sample}</span>
            </div>
          ))}
        </DsPanel>
      </DsSection>

      <DsSection
        id="icons"
        num="1.3"
        title="الأيقونات"
        en="Icons"
        note={`${icons.length} أيقونة من طقم UIcons، تولَّد بـpnpm icons ويُستورد منها ما يُستعمل فقط. الخطّي للواجهة، والمصمت (Filled) للحالة المفعّلة.`}
      >
        <DsPanel>
          <ul className="grid grid-cols-4 gap-2 sm:grid-cols-8 lg:grid-cols-10">
            {icons.map(([name, Icon]) => (
              <li
                key={name}
                title={name}
                className="flex flex-col items-center gap-2 rounded-sm p-3 text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground"
              >
                <Icon className="size-5" />
                <span dir="ltr" className="w-full truncate text-center text-micro">
                  {name.replace(/Icon$/, '')}
                </span>
              </li>
            ))}
          </ul>
        </DsPanel>
      </DsSection>

      <DsSection
        id="space"
        num="1.4"
        title="المسافات"
        en="Spacing"
        status="reference"
        note="سلّم 4px (سلّم Tailwind نفسه). القيم بين الخطوات مسموحة بمضاعفات 1px عند الحاجة، ويمنع pnpm lint:tokens القيم الاعتباطية."
      >
        <DsPanel>
          <div className="flex flex-col gap-2">
            {SPACE.map((n) => (
              <div key={n} className="flex items-center gap-4">
                <span dir="ltr" className="w-16 font-mono text-caption text-tertiary">
                  {n} · {n * 4}px
                </span>
                <span className={cn('h-3 rounded-full bg-harf-300', SPACE_W[n])} />
              </div>
            ))}
          </div>
        </DsPanel>
      </DsSection>

      <DsSection
        id="radius"
        num="1.5"
        title="الحواف"
        en="Radius"
        status="reference"
        note="تدرّج النعومة يحمل معنى: كلّما كبر العنصر كبرت حافته."
      >
        <DsPanel>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
            {RADII.map(([n, cls, use]) => (
              <div key={n} className="flex flex-col gap-2">
                <span className={cn('h-16 border-2 border-primary bg-tint-brand', cls)} />
                <span dir="ltr" className="font-mono text-caption">
                  {n}
                </span>
                <span className="text-caption text-tertiary">{use}</span>
              </div>
            ))}
          </div>
        </DsPanel>
      </DsSection>

      <DsSection
        id="depth"
        num="1.6"
        title="الظلال"
        en="Shadows"
        status="reference"
        note="في الداكن تصبح الظلال أعمق بدل أن تختفي."
      >
        <DsPanel className="bg-sunken">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {SHADOWS.map(([n, cls, use]) => (
              <div key={n} className={cn('rounded-md bg-card p-5', cls)}>
                <p dir="ltr" className="font-mono text-caption">
                  shadow-{n}
                </p>
                <p className="mt-1 text-caption text-tertiary">{use}</p>
              </div>
            ))}
          </div>
        </DsPanel>
      </DsSection>

      <DsSection
        id="motion"
        num="1.8"
        title="الحركة"
        en="Motion"
        note="المدد: 120 / 200 / 320 / 560ms. المنحنيات: out-quint للدخول، pop للتأكيد. عند تفعيل «تقليل الحركة» في النظام تتوقّف كل الحركات."
      >
        <MotionDemo />
      </DsSection>
    </>
  );
}
