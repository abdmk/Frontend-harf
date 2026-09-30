import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { MailIcon, RefreshIcon } from '@/components/ui/icons';
import { toast } from '@/components/ui/toast';
import { markWelcomePending, setDemoSession } from '@/lib/auth';

const COOLDOWN = 60;

/**
 * بعد إنشاء الحساب: صندوق «تحقّق من بريدك» — أين أُرسل الرابط، ماذا يفعل الزائر الآن،
 * إعادة الإرسال (بمهلة دقيقة تمنع الإغراق)، وتغيير البريد إن كُتب خطأ.
 */
export function VerifyEmail({ email, onEdit }: { email: string; onEdit: () => void }) {
  const [wait, setWait] = useState(COOLDOWN);
  const navigate = useNavigate();

  useEffect(() => {
    if (wait <= 0) return;
    const t = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => window.clearTimeout(t);
  }, [wait]);

  return (
    <div role="status" className="animate-fade-up overflow-hidden rounded-xl border bg-card text-start">
      <div className="flex flex-col items-center gap-3 border-b bg-sunken/60 px-6 pt-7 pb-6 text-center">
        <span className="grid size-13 place-items-center rounded-full bg-card text-primary shadow-soft">
          <MailIcon className="size-6" />
        </span>
        <h2 className="text-lg font-semibold">تحقّق من بريدك</h2>
        <p className="text-meta text-muted-foreground">أرسلنا رابط التفعيل إلى</p>
        <bdi dir="ltr" className="max-w-full truncate rounded-full border bg-card px-3.5 py-1 text-control font-medium">
          {email}
        </bdi>
      </div>

      <ol className="flex flex-col gap-3 px-6 py-5 text-meta text-muted-foreground">
        {[
          'افتح الرسالة من «حرف» في بريدك.',
          'اضغط «تفعيل الحساب» — يعمل الرابط لمدّة 24 ساعة.',
          'تعود إلى حرف مسجَّل الدخول مباشرة.',
        ].map((t, i) => (
          <li key={t} className="flex items-start gap-3">
            <span
              dir="ltr"
              className="grid size-5.5 shrink-0 place-items-center rounded-full bg-sunken text-caption font-semibold text-foreground tabular-nums"
            >
              {i + 1}
            </span>
            {t}
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-2 border-t px-6 py-4">
        <p className="text-caption text-tertiary">لم تصلك؟ تفقّد مجلد الرسائل غير المرغوب فيها أولاً.</p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            disabled={wait > 0}
            onClick={() => {
              setWait(COOLDOWN);
              toast({ tone: 'success', title: 'أُعيد الإرسال', description: email });
            }}
          >
            <RefreshIcon />
            {wait > 0 ? (
              <span>
                إعادة الإرسال بعد <span className="tabular-nums">{wait}</span>ث
              </span>
            ) : (
              'إعادة الإرسال'
            )}
          </Button>
          <Button variant="ghost" onClick={onEdit}>
            غيّر البريد
          </Button>
        </div>
      </div>

      {/* ⚠️ عرض فقط: لا بريد حقيقي بعد — يحاكي فتح رابط التفعيل. يُحذف عند ربط خدمة البريد */}
      <button
        type="button"
        onClick={() => {
          setDemoSession('free');
          markWelcomePending();
          navigate('/');
        }}
        className="w-full border-t border-dashed bg-tint-warn/50 px-6 py-3 text-caption text-warn-text transition-colors hover:bg-tint-warn"
      >
        تجربة: محاكاة فتح رابط التفعيل ←
      </button>
    </div>
  );
}
