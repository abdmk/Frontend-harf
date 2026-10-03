import { useEffect, useRef, useSyncExternalStore } from 'react';

import { cn } from '@/lib/cn';
import { useToastPosition } from '@/lib/toast-position';

import { Alert, AlertAction, type AlertProps } from './alert';

/**
 * إشعارات عابرة (Toasts). الاستعمال من أي مكوّن عميل:
 *   toast({ tone: 'success', title: 'أُضيف إلى السلة', action: { label: 'عرض السلة', onClick } })
 * تختفي بعد 5 ثوانٍ (تتوقّف عند المرور أو التركيز)، وتُعلَن لقارئ الشاشة.
 */
type ToastInput = Pick<AlertProps, 'tone' | 'title' | 'description'> & {
  action?: { label: string; onClick: () => void };
  duration?: number;
};
type ToastItem = ToastInput & { id: number; leaving?: boolean };

/** مدّة حركة الخروج — يُحذف الإشعار بعدها كي لا يختفي فجأة */
const EXIT_MS = 180;

let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function toast(input: ToastInput) {
  const id = nextId++;
  items = [...items.slice(-2), { ...input, id }]; // ثلاثة على الأكثر
  emit();
  return id;
}

export function dismissToast(id: number) {
  if (!items.some((t) => t.id === id && !t.leaving)) return;
  items = items.map((t) => (t.id === id ? { ...t, leaving: true } : t));
  emit();
  setTimeout(() => {
    items = items.filter((t) => t.id !== id);
    emit();
  }, EXIT_MS);
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const EMPTY: ToastItem[] = [];

export function Toaster() {
  const list = useSyncExternalStore(
    subscribe,
    () => items,
    () => EMPTY,
  );
  const pos = useToastPosition();
  return (
    <section
      aria-label="الإشعارات العابرة"
      data-position={pos}
      className={cn(
        'pointer-events-none fixed inset-x-4 bottom-4 z-100 mx-auto flex max-w-95 flex-col items-center gap-2 sm:bottom-6',
        // على الجوال دائماً في الوسط؛ الموضع المختار من الشاشات الأوسع
        pos === 'start' && 'sm:start-6 sm:end-auto sm:mx-0 sm:w-95',
        pos === 'end' && 'sm:start-auto sm:end-6 sm:mx-0 sm:w-95',
      )}
    >
      {list.map((t) => (
        <ToastCard key={t.id} item={t} />
      ))}
    </section>
  );
}

function ToastCard({ item }: { item: ToastItem }) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const start = () => {
    timer.current = setTimeout(() => dismissToast(item.id), item.duration ?? 5000);
  };
  const stop = () => clearTimeout(timer.current);
  useEffect(() => {
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- يبدأ المؤقّت مرّة واحدة لكل إشعار
  }, []);

  return (
    <div
      className={cn('pointer-events-auto w-full', item.leaving ? 'animate-toast-out' : 'animate-fade-up')}
      onMouseEnter={stop}
      onMouseLeave={start}
      onFocus={stop}
      onBlur={start}
    >
      <Alert
        tone={item.tone}
        title={item.title}
        description={item.description}
        className="shadow-float"
        onDismiss={() => dismissToast(item.id)}
        actions={
          item.action && (
            <AlertAction
              onClick={() => {
                item.action?.onClick();
                dismissToast(item.id);
              }}
            >
              {item.action.label}
            </AlertAction>
          )
        }
      />
    </div>
  );
}
