import { useEffect, useState } from 'react';

import { RadioGroup, RadioOption } from '@/components/ui/radio-group';

const THEME_STORAGE_KEY = 'harf-theme';

type Mode = 'light' | 'dark' | 'system';

function apply(mode: Mode) {
  const root = document.documentElement;
  const dark = mode === 'dark' || (mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', dark);
  root.style.colorScheme = dark ? 'dark' : 'light';
  try {
    if (mode === 'system') localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* التخزين غير متاح */
  }
}

/** اختيار المظهر: فاتح، داكن، أو حسب النظام — يُحفظ في هذا المتصفّح */
export function ThemePreference() {
  const [mode, setMode] = useState<Mode>('system');
  useEffect(() => {
    try {
      const v = localStorage.getItem(THEME_STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- قراءة التخزين بعد الترطيب فقط
      setMode(v === 'light' || v === 'dark' ? v : 'system');
    } catch {
      /* يبقى «حسب النظام» */
    }
  }, []);
  return (
    <RadioGroup
      aria-label="المظهر"
      value={mode}
      onValueChange={(v) => {
        setMode(v as Mode);
        apply(v as Mode);
      }}
      className="flex flex-wrap gap-6"
    >
      <RadioOption value="light" label="فاتح" />
      <RadioOption value="dark" label="داكن" />
      <RadioOption value="system" label="حسب النظام" />
    </RadioGroup>
  );
}
