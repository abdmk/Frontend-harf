import { ThemePreference } from '@/components/shared/theme-preference';
import { Switch } from '@/components/ui/switch';

import { SectionCard } from './section-card';

const NOTIFY = [
  ['orders', 'الإيصالات والتراخيص', 'تصلك دائماً — لا يمكن إيقافها', true, true],
  ['updates', 'تحديثات خطوط مكتبتك', 'حين يصدر وزن أو إصدار جديد', true, false],
  ['news', 'جديد حرف', 'خطوط مختارة وعروض، مرّة في الشهر على الأكثر', false, false],
] as const;

/** التفضيلات: المظهر، اللغة، وإشعارات البريد (إعدادات البريد تُحفظ على الخادم عند الربط) */
export function PreferencesSection() {
  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="المظهر" description="يُحفظ في هذا المتصفّح.">
        <ThemePreference />
      </SectionCard>
      <SectionCard title="اللغة">
        <p className="text-control">العربية</p>
        <p className="mt-1 text-caption text-tertiary">لغات الواجهة الأخرى غير متاحة بعد.</p>
      </SectionCard>
      <SectionCard title="إشعارات البريد">
        <ul className="flex flex-col divide-y">
          {NOTIFY.map(([id, label, hint, on, locked]) => (
            <li key={id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <label htmlFor={`n-${id}`} className="min-w-0">
                <span className="block text-control font-medium">{label}</span>
                <span className="block text-caption text-muted-foreground">{hint}</span>
              </label>
              <Switch id={`n-${id}`} defaultChecked={on} disabled={locked} />
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
