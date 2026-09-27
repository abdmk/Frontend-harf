export const THEME_STORAGE_KEY = 'harf-theme';

/** يطبّق الوضع المحفوظ قبل أول رسم فلا يومض الفاتح قبل الداكن. نصّ ثابت لا يدخله أي مُدخل. */
const SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var d=document.documentElement;d.classList.toggle('dark',t==='dark');d.style.colorScheme=t}catch(e){}})()`;

/**
 * على الخادم يُرسَل كسكربت ينفَّذ أثناء تحليل HTML؛ وعلى العميل يصبح text/plain
 * فلا يحذّر React ولا يُعاد تنفيذه (النمط الموصى به في توثيق Next.js).
 */
export function ThemeScript({ nonce }: { nonce?: string }) {
  return (
    <script
      nonce={nonce}
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: SCRIPT }}
    />
  );
}
