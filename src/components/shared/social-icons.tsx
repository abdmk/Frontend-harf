/** علامات الشبكات الاجتماعية (مسارات SVG) — مشتركة بين التذييل وصفحات المسابك */
export const SOCIAL = [
  {
    label: 'LinkedIn',
    d: 'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1.6 7v8h2.3v-8H5.6zm1.2-3.7a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zM18.4 13.2c0-2.2-1.2-3.4-2.9-3.4-1.1 0-1.8.6-2.1 1.1V10H11v8h2.3v-4.2c0-1.1.5-1.8 1.4-1.8.9 0 1.4.7 1.4 1.8V18h2.3v-4.8z',
  },
  {
    label: 'Instagram',
    d: 'M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5zm0 1.8A3.2 3.2 0 0 0 4.8 8v8A3.2 3.2 0 0 0 8 19.2h8a3.2 3.2 0 0 0 3.2-3.2V8A3.2 3.2 0 0 0 16 4.8H8zm4 3.2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 1.8a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4zm5.2-3.1a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z',
  },
  {
    label: 'Telegram',
    d: 'M21.4 4.1 2.9 11.3c-1 .4-1 1.7 0 2l4.7 1.5 1.8 5.4c.2.7 1.1.9 1.6.4l2.6-2.4 4.7 3.4c.6.4 1.5.1 1.6-.6l3.2-15.7c.2-.9-.6-1.6-1.4-1.2zM9.6 14.4l8-6.6-6.5 7.8-.3 2.9-1.2-4.1z',
  },
  {
    label: 'X',
    d: 'M17.7 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.4L2 3h6.4l4.4 5.8L17.7 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11 14.5z',
  },
] as const;

export function SocialIcon({ label, className }: { label: (typeof SOCIAL)[number]['label']; className?: string }) {
  const s = SOCIAL.find((x) => x.label === label);
  if (!s) return null;
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d={s.d} />
    </svg>
  );
}
