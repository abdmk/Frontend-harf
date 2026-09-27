import localFont from 'next/font/local';

/** خط الواجهة — Graphik Arabic مستضاف ذاتياً (بلا طلبات خارجية) */
export const graphik = localFont({
  src: [
    { path: '../assets/fonts/graphik-arabic-250.woff2', weight: '250' },
    { path: '../assets/fonts/graphik-arabic-270.woff2', weight: '270' },
    { path: '../assets/fonts/graphik-arabic-300.woff2', weight: '300' },
    { path: '../assets/fonts/graphik-arabic-400.woff2', weight: '400' },
    { path: '../assets/fonts/graphik-arabic-500.woff2', weight: '500' },
    { path: '../assets/fonts/graphik-arabic-600.woff2', weight: '600' },
  ],
  variable: '--font-graphik',
  display: 'swap',
  preload: true,
});
