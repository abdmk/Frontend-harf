import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import { App } from './app/app';
import './app/globals.css';
import { DEMO_MODE } from './config/demo';
import { DEMO_ACCOUNTS, type DemoAccount, setDemoSession } from './lib/auth';

/** ‎?as=‎ في الرابط يبدّل الحساب التجريبي فوراً (في التطوير والمعاينات فقط) — يُقرأ مرّة قبل أول رسم، ثم يُزال من الرابط */
const demoParam = new URLSearchParams(window.location.search).get('as');
if (demoParam) {
  if (DEMO_MODE && (DEMO_ACCOUNTS as readonly string[]).includes(demoParam)) setDemoSession(demoParam as DemoAccount);
  const url = new URL(window.location.href);
  url.searchParams.delete('as');
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
