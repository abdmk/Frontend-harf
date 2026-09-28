import { useId, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { CheckIcon, CopyIcon, CrossSmallIcon } from '@/components/ui/icons';
import { Textarea } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';

import { prepareArabic } from '../utils/arabic-reshape';

const EXAMPLE = 'لا إبداع حيث لا حرية\nخط «زيتون» — 5 أوزان';
const MAX = 5000;

/**
 * أداة «عكس النص»: الإدخال عربي عادي، والنتيجة جاهزة للّصق في برامج لا تدعم العربية.
 * كل شيء في المتصفّح — النص لا يُرسل لأي خادم.
 */
export function ReverseTextTool() {
  const [text, setText] = useState('');
  const [shape, setShape] = useState(true);
  const [reverse, setReverse] = useState(true);
  const [copied, setCopied] = useState(false);
  const inId = useId();
  const outId = useId();
  const result = useMemo(() => prepareArabic(text, { shape, reverse }), [text, shape, reverse]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast({ tone: 'danger', title: 'تعذّر النسخ', description: 'حدّد النتيجة وانسخها يدوياً.' });
    }
  }

  const panel = 'flex min-w-0 flex-col rounded-xl border bg-card';
  const head = 'flex min-h-14 items-center justify-between gap-3 border-b px-4 py-2 sm:px-5';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl border bg-card px-4 py-3 sm:px-5">
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <label className="flex cursor-pointer items-center gap-3 text-control">
            <Switch checked={shape} onCheckedChange={setShape} />
            وصل الحروف
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-control">
            <Switch checked={reverse} onCheckedChange={setReverse} />
            عكس الاتجاه
          </label>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setText(EXAMPLE)}>
          جرّب مثالاً
        </Button>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
        <section className={panel} aria-labelledby={`${inId}-t`}>
          <div className={head}>
            <h2 id={`${inId}-t`} className="text-control font-semibold">
              النص العربي
            </h2>
            {text && (
              <Button variant="ghost" size="sm" onClick={() => setText('')}>
                <CrossSmallIcon />
                مسح
              </Button>
            )}
          </div>
          <label htmlFor={inId} className="sr-only">
            النص العربي
          </label>
          <Textarea
            id={inId}
            dir="rtl"
            value={text}
            maxLength={MAX}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب أو الصق النص هنا…"
            className="min-h-60 flex-1 resize-y rounded-none border-0 bg-transparent px-4 py-4 text-lead leading-loose shadow-none focus-visible:shadow-none sm:px-5"
          />
          <p className="border-t px-4 py-2.5 text-caption text-tertiary sm:px-5" dir="ltr">
            {Array.from(text).length.toLocaleString('en-US')} / {MAX.toLocaleString('en-US')}
          </p>
        </section>

        <section className={panel} aria-labelledby={`${outId}-t`}>
          <div className={head}>
            <h2 id={`${outId}-t`} className="text-control font-semibold">
              النتيجة
            </h2>
            <Button size="sm" onClick={copy} disabled={!result}>
              {copied ? <CheckIcon className="animate-pop-in" /> : <CopyIcon />}
              {copied ? 'نُسخ' : 'نسخ النتيجة'}
            </Button>
          </div>
          <label htmlFor={outId} className="sr-only">
            النتيجة
          </label>
          {/* النتيجة بترتيب مرئي من اليسار لليمين — كما ستظهر في البرنامج الذي لا يدعم العربية */}
          <Textarea
            id={outId}
            dir="ltr"
            readOnly
            value={result}
            placeholder="ستظهر النتيجة هنا"
            onFocus={(e) => e.currentTarget.select()}
            className="min-h-60 flex-1 resize-y rounded-none border-0 bg-sunken/50 px-4 py-4 text-left text-lead leading-loose shadow-none [unicode-bidi:bidi-override] focus-visible:shadow-none sm:px-5"
          />
          <p aria-live="polite" className="border-t px-4 py-2.5 text-caption text-tertiary sm:px-5">
            {copied ? 'نُسخت النتيجة — الصقها في برنامجك.' : 'انقر على النتيجة لتحديدها كلها.'}
          </p>
        </section>
      </div>
    </div>
  );
}
