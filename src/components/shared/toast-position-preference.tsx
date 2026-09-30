import { ChoiceCards, MockWindow } from '@/components/shared/choice-cards';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';
import { setToastPosition, type ToastPosition, useToastPosition } from '@/lib/toast-position';

/** نقطة الإشعار داخل النافذة المصغّرة — في الموضع الذي يمثّله الخيار */
function Dot({ at }: { at: ToastPosition }) {
  return (
    <span
      className={cn(
        'absolute bottom-2 h-2.5 w-7 rounded-full bg-primary-fill shadow-soft',
        at === 'start' && 'start-2',
        at === 'center' && 'start-1/2 -translate-x-1/2 rtl:translate-x-1/2',
        at === 'end' && 'end-2',
      )}
    />
  );
}

/** موضع الإشعارات العابرة — على الجوال تبقى في الوسط دائماً */
export function ToastPositionPreference() {
  const pos = useToastPosition();
  return (
    <ChoiceCards
      label="موضع الإشعارات"
      value={pos}
      onChange={(v) => {
        setToastPosition(v);
        toast({ tone: 'success', title: 'هنا تظهر الإشعارات' });
      }}
      options={[
        {
          value: 'start',
          label: 'أسفل اليمين',
          preview: (
            <MockWindow tone="light">
              <Dot at="start" />
            </MockWindow>
          ),
        },
        {
          value: 'center',
          label: 'الوسط',
          preview: (
            <MockWindow tone="light">
              <Dot at="center" />
            </MockWindow>
          ),
        },
        {
          value: 'end',
          label: 'أسفل اليسار',
          preview: (
            <MockWindow tone="light">
              <Dot at="end" />
            </MockWindow>
          ),
        },
      ]}
    />
  );
}
