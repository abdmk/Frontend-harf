import { type NextRequest, NextResponse } from 'next/server';

const DEMO_ACCOUNT_COOKIE = 'harf_demo_as';

/**
 * يعمل قبل كل صفحة:
 * 1) سياسة أمان محتوى (CSP) صارمة بـ nonce جديد لكل طلب.
 * 2) رؤوس أمان إضافية.
 * 3) (عرض فقط) ‎?as=free|basic|studio يبدّل الحساب التجريبي عبر كوكي.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    // أنماط React المضمّنة (style={...}) تحتاج style-src-attr؛ عناصر <style> مقيّدة بالـnonce
    `style-src 'self' ${isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`}`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');

  // التبديل التجريبي يجب أن يراه هذا الطلب نفسه، لا الطلب التالي فقط
  const as = request.nextUrl.searchParams.get('as');
  const demoAs = as === 'free' || as === 'basic' || as === 'studio' ? as : null;
  if (demoAs) request.cookies.set(DEMO_ACCOUNT_COOKIE, demoAs);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  if (!isDev) response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  if (demoAs) {
    response.cookies.set(DEMO_ACCOUNT_COOKIE, demoAs, {
      httpOnly: true,
      sameSite: 'lax',
      secure: !isDev,
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
