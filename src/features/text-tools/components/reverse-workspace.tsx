import { useId, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { CheckIcon, CopyIcon, CrossSmallIcon, DownloadIcon } from '@/components/ui/icons';
import { Textarea } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';

import { prepareArabic } from '../utils/arabic-reshape';

const EXAMPLE = 'حرفٌ يصنع الهوية\nخط «زيتون» — 5 أوزان';
const MAX = 5000;

const OPTIONS = [
  { key: 'shape', label: 'وصل الحروف', hint: 'أشكال الحروف حسب موقعها في الكلمة' },
  { key: 'reverse', label: 'عكس الاتجاه', hint: 'للبرامج التي ترسم من اليسار لليمين' },
  { key: 'strip', label: 'إزالة التشكيل', hint: 'إن ظهرت الحركات في غير مكانها' },
] as const;
type OptionKey = (typeof OPTIONS)[number]['key'];

/**
 * أداة «عكس النص» — بطاقة واحدة: الخيارات في رأسها، النص والنتيجة جنباً إلى جنب، والأفعال في ذيلها.
 * كل ما يخصّ التحويل في مكان واحد بدل صناديق متفرّقة. كل شيء في المتصفّح؛ النص لا يُرسل ولا يُحفظ.
 */
export function ReverseWorkspace() {
  const [text, setText] = useState('');
  const [opts, setOpts] = useState<Record<OptionKey, boolean>>({ shape: true, reverse: true, strip: false });
  const [copied, setCopied] = useState(false);
  const inId = useId();
  const outId = useId();
  const result = useMemo(() => prepareArabic(text, opts), [text, opts]);
  const chars = Array.from(text).length;
  const lines = text ? text.split('\n').length : 0;

  async function copy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast({ tone: 'danger', title: 'تعذّر النسخ', description: 'حدّد النتيجة وانسخها يدوياً.' });
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([result], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'harf-reversed.txt';
    a.click();
    // بعد أن يلتقط المتصفّح الرابط
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const pane = 'flex min-w-0 flex-col';
  const paneHead =
    'flex h-11 items-center justify-between gap-2 px-4 text-caption font-medium text-muted-foreground sm:px-5';
  const area =
    'min-h-56 flex-1 resize-y rounded-none border-0 bg-transparent px-4 pt-1 pb-4 text-lead leading-loose shadow-none focus-visible:shadow-none sm:min-h-64 sm:px-5';

  return (
    <section aria-label="أداة عكس النص" className="overflow-hidden rounded-2xl border bg-card shadow-soft">
      {/* الخيارات — مرتبطة بالأداة، في رأسها */}
      <fieldset className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b px-4 py-3.5 sm:px-5">
        <legend className="sr-only">خيارات التحويل</legend>
        {OPTIONS.map((o) => (
          <label key={o.key} className="flex cursor-pointer items-center gap-2.5 text-control" title={o.hint}>
            <Switch checked={opts[o.key]} onCheckedChange={(v) => setOpts((p) => ({ ...p, [o.key]: v }))} />
            {o.label}
          </label>
        ))}
      </fieldset>

      <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-2">
        {/* النص */}
        <div className={pane}>
          <div className={paneHead}>
            <label htmlFor={inId}>نصّك بالعربية</label>
            {text ? (
              <Button variant="ghost" size="sm" className="-me-2" onClick={() => setText('')}>
                <CrossSmallIcon />
                مسح
              </Button>
            ) : (
              <Button variant="ghost" size="sm" className="-me-2" onClick={() => setText(EXAMPLE)}>
                جرّب مثالاً
              </Button>
            )}
          </div>
          <Textarea
            id={inId}
            dir="rtl"
            value={text}
            maxLength={MAX}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void copy();
              }
            }}
            placeholder="اكتب أو الصق النص هنا…"
            className={area}
          />
        </div>

        {/* النتيجة — بترتيب مرئي من اليسار لليمين، كما ستظهر في البرنامج الذي لا يدعم العربية */}
        <div className={`${pane} border-t bg-sunken/40 lg:border-s lg:border-t-0`}>
          <div className={paneHead}>
            <label htmlFor={outId}>النتيجة — جاهزة للّصق</label>
          </div>
          <Textarea
            id={outId}
            dir="ltr"
            readOnly
            value={result}
            placeholder="ستظهر النتيجة هنا"
            onFocus={(e) => e.currentTarget.select()}
            className={`${area} text-left [unicode-bidi:bidi-override]`}
          />
        </div>
      </div>

      {/* الأفعال — في ذيل الأداة، النسخ هو الفعل الرئيسي */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 sm:px-5">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-tertiary" aria-live="polite">
          {copied ? (
            <span className="font-medium text-ok-text">نُسخت النتيجة — الصقها في برنامجك.</span>
          ) : (
            <>
              <span dir="ltr" className="tabular-nums">
                {chars.toLocaleString('en-US')} / {MAX.toLocaleString('en-US')}
              </span>
              {lines > 1 && <span className="tabular-nums">{lines} أسطر</span>}
              <span className="max-sm:hidden">
                <kbd className="rounded-xs border px-1.5 py-0.5 font-sans" dir="ltr">
                  Ctrl + Enter
                </kbd>{' '}
                للنسخ
              </span>
            </>
          )}
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={download} disabled={!result}>
            <DownloadIcon />
            <span>
              تنزيل <span dir="ltr">.txt</span>
            </span>
          </Button>
          <Button size="sm" onClick={copy} disabled={!result}>
            {copied ? <CheckIcon className="animate-pop-in" /> : <CopyIcon />}
            {copied ? 'نُسخ' : 'نسخ النتيجة'}
          </Button>
        </div>
      </div>
    </section>
  );
}
