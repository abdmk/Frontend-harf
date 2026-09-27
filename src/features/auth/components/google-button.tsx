'use client';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

/** «المتابعة بحساب Google» — يُفعَّل مع ربط مزوّد المصادقة (OAuth مع PKCE على الخادم) */
export function GoogleButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      block
      onClick={() =>
        toast({ tone: 'info', title: 'قريباً', description: 'الدخول بحساب Google يُفعَّل عند ربط المصادقة.' })
      }
    >
      <svg viewBox="0 0 24 24" aria-hidden className="size-4.5">
        <path
          className="fill-google-blue"
          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7Z"
        />
        <path
          className="fill-google-green"
          d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z"
        />
        <path className="fill-google-yellow" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
        <path
          className="fill-google-red"
          d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z"
        />
      </svg>
      المتابعة بحساب Google
    </Button>
  );
}
