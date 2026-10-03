import { useEffect, useId, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { FieldError } from '@/components/ui/field';
import { ExclamationIcon, PencilIcon, RefreshIcon, TextIcon, TrashIcon } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Switch } from '@/components/ui/switch';

type Point = { x: number; y: number };
const W = 600;
const H = 220;

/** يرسم الخطوط على سياق بلون معيّن — للعرض بلون النصّ، وللتصدير بالأسود على أبيض */
function paint(ctx: CanvasRenderingContext2D, strokes: Point[][], color: string) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = color;
  for (const s of strokes) {
    if (!s.length) continue;
    ctx.beginPath();
    ctx.moveTo(s[0]!.x, s[0]!.y);
    // منحنيات بين منتصفات النقاط — خطّ أنعم من الخطوط المستقيمة
    for (let i = 1; i < s.length - 1; i++) {
      const mx = (s[i]!.x + s[i + 1]!.x) / 2;
      const my = (s[i]!.y + s[i + 1]!.y) / 2;
      ctx.quadraticCurveTo(s[i]!.x, s[i]!.y, mx, my);
    }
    const last = s[s.length - 1]!;
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }
}

/** التوقيع المكتوب: الاسم بخطّ الموقع المائل في وسط اللوحة */
function paintTyped(ctx: CanvasRenderingContext2D, name: string, color: string) {
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'rtl';
  const font = getComputedStyle(document.body).fontFamily;
  ctx.font = `italic 600 52px ${font}`;
  ctx.fillText(name, W / 2, H / 2, W - 60);
}

/**
 * توقيع الاتفاقية: يُرسم بالفأرة أو الإصبع، أو يُكتب الاسم لمن لا يستطيع الرسم.
 * لا يُقبل التوقيع إلا بعد تفعيل الإقرار — ورسالة واضحة إن حاول دونه.
 * الناتج صورة JPEG بالأسود على أبيض (تُفحص وتُحفظ كوثيقة).
 */
function SignatureDialogBody({
  open,
  onOpenChange,
  signer,
  onSigned,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  signer: string;
  onSigned: (jpegDataUrl: string) => void | Promise<void>;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [typed, setTyped] = useState(signer);
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const drawing = useRef(false);
  const id = useId();

  // إعادة الرسم بلون النصّ الحالي (يتبع الوضع الداكن)
  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    ctx.clearRect(0, 0, W, H);
    const color = getComputedStyle(c).color;
    if (mode === 'draw') paint(ctx, strokes, color);
    else if (typed.trim()) paintTyped(ctx, typed.trim(), color);
  }, [strokes, typed, mode, open]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  const hasSignature = mode === 'draw' ? strokes.some((s) => s.length > 1) : typed.trim().length >= 2;
  const showAgreeError = tried && !agree;

  async function sign() {
    setTried(true);
    if (!agree || !hasSignature) return;
    const out = document.createElement('canvas');
    out.width = W;
    out.height = H;
    const ctx = out.getContext('2d')!;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, W, H);
    if (mode === 'draw') paint(ctx, strokes, 'black');
    else paintTyped(ctx, typed.trim(), 'black');
    setBusy(true);
    await onSigned(out.toDataURL('image/jpeg', 0.9));
    setBusy(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-dialog-md">
        <div>
          <DialogTitle>توقيع الاتفاقية</DialogTitle>
          <DialogDescription className="mt-1 text-meta text-muted-foreground">
            يُحفظ توقيعك مع تاريخ التوقيع وإصدار الاتفاقية، ويُرسل إلى الإدارة مع طلبك.
          </DialogDescription>
        </div>

        <SegmentedControl
          label="طريقة التوقيع"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'draw', label: 'ارسم توقيعك', icon: <PencilIcon /> },
            { value: 'type', label: 'اكتب اسمك', icon: <TextIcon /> },
          ]}
        />

        <div className="rounded-xl bg-sunken p-3">
          <canvas
            ref={canvas}
            width={W}
            height={H}
            role="img"
            aria-label={hasSignature ? 'توقيعك' : 'لوحة التوقيع — ارسم توقيعك هنا'}
            className={`aspect-[600/220] w-full touch-none rounded-lg text-foreground ${mode === 'draw' ? 'cursor-crosshair' : ''}`}
            onPointerDown={(e) => {
              if (mode !== 'draw') return;
              e.currentTarget.setPointerCapture(e.pointerId);
              drawing.current = true;
              setStrokes((s) => [...s, [point(e)]]);
            }}
            onPointerMove={(e) => {
              if (!drawing.current) return;
              const p = point(e);
              setStrokes((s) => [...s.slice(0, -1), [...s[s.length - 1]!, p]]);
            }}
            onPointerUp={() => (drawing.current = false)}
            onPointerCancel={() => (drawing.current = false)}
          />
          {mode === 'draw' ? (
            <div className="mt-2 flex items-center gap-1 text-meta">
              <Button
                variant="ghost"
                size="sm"
                disabled={!strokes.length}
                onClick={() => setStrokes((s) => s.slice(0, -1))}
              >
                <RefreshIcon className="size-3.5 -scale-x-100" />
                تراجع
              </Button>
              <span aria-hidden className="h-4 w-px bg-strong" />
              <Button variant="ghost" size="sm" disabled={!strokes.length} onClick={() => setStrokes([])}>
                <TrashIcon className="size-3.5" />
                مسح
              </Button>
            </div>
          ) : (
            <Input
              aria-label="الاسم للتوقيع"
              value={typed}
              maxLength={60}
              onChange={(e) => setTyped(e.target.value)}
              className="mt-3"
            />
          )}
        </div>
        {tried && !hasSignature && <FieldError>{mode === 'draw' ? 'ارسم توقيعك أولاً.' : 'اكتب اسمك.'}</FieldError>}

        <div className={`overflow-hidden rounded-xl border ${showAgreeError ? 'border-dgr-200' : ''}`}>
          <label htmlFor={`${id}-agree`} className="flex items-start gap-3 p-4 text-meta leading-relaxed">
            <Switch
              id={`${id}-agree`}
              checked={agree}
              onCheckedChange={setAgree}
              aria-describedby={showAgreeError ? `${id}-ae` : undefined}
              className="mt-0.5"
            />
            بتوقيعي أؤكّد أني قرأت بنود اتفاقية الناشر كاملة وأوافق عليها، وأنها ملزمة لي قانونياً.
          </label>
          {showAgreeError && (
            <p
              id={`${id}-ae`}
              role="alert"
              className="flex items-center gap-2 bg-tint-dgr px-4 py-2.5 text-meta font-medium text-dgr-text"
            >
              <ExclamationIcon className="size-4 shrink-0" />
              أكّد موافقتك على البنود قبل التوقيع.
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button variant="primary" loading={busy} onClick={sign}>
            وقّع الاتفاقية
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** يُعاد التركيب عند الإغلاق — كل فتح يبدأ بلوحة فارغة وإقرار غير مفعّل */
export function SignatureDialog(props: Parameters<typeof SignatureDialogBody>[0]) {
  return <SignatureDialogBody key={props.open ? 'open' : 'closed'} {...props} />;
}
