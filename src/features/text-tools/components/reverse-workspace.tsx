import { useId, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { CheckIcon, CopyIcon, CrossSmallIcon, DownloadIcon, MagicWandIcon } from '@/components/ui/icons';
import { Textarea } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';

import { AppPreview } from './app-preview';
import { APPS, appById } from '../data/apps';
import { prepareArabic } from '../utils/arabic-reshape';

const EXAMPLE = 'حرفٌ يصنع الهوية\nخط «زيتون» — 5 أوزان';
const MAX = 5000;

const pill =
  'inline-flex h-10 shrink-0 items-center rounded-full border px-4 text-control leading-none whitespace-nowrap transition-[background-color,color,border-color,transform] duration-(--dur-fast) active:scale-[.97]';

/**
 * مساحة «عكس النص»: اختيار البرنامج، ثم النص، ثم النتيجة — إمّا للّصق مباشرة، وإمّا معاينةً
 * داخل نافذة بهيئة البرنامج «قبل» و«بعد». كل شيء في المتصفّح؛ النص لا يُرسل ولا يُحفظ.
 */
export function ReverseWorkspace() {
  const [params, setParams] = useSearchParams();
  const app = appById(params.get('app'));
  const [text, setText] = useState('');
  const [shape, setShape] = useState(true);
  const [reverse, setReverse] = useState(true);
  const [strip, setStrip] = useState(false);
  const [view, setView] = useState<'paste' | 'preview'>('paste');
  const [stage, setStage] = useState<'before' | 'after'>('after');
  const [copied, setCopied] = useState(false);
  const inId = useId();
  const outId = useId();
  const result = useMemo(() => prepareArabic(text, { shape, reverse, strip }), [text, shape, reverse, strip]);
  const chars = Array.from(text).length;
  const lines = text ? text.split('\n').length : 0;

  const pickApp = (id: string) =>
    setParams(
      (p) => {
        const n = new URLSearchParams(p);
        if (id === 'other') n.delete('app');
        else n.set('app', id);
        return n;
      },
      { replace: true },
    );

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

  const panel = 'flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card';
  const head = 'flex min-h-14 flex-wrap items-center justify-between gap-2 border-b px-4 py-2 sm:px-5';
  const foot = 'flex min-h-11 items-center gap-3 border-t px-4 py-2 text-caption text-tertiary sm:px-5';

  return (
    <div className="flex flex-col gap-4">
      {/* ١ — البرنامج والخيارات */}
      <section aria-labelledby={`${inId}-app`} className="rounded-xl border bg-card p-4 sm:p-5">
        <h2 id={`${inId}-app`} className="text-control font-semibold">
          لأي برنامج؟
        </h2>
        <div className="-mx-1 mt-3 [scrollbar-width:none] overflow-x-auto px-1 py-1 [&::-webkit-scrollbar]:hidden">
          <div role="group" aria-label="البرنامج" className="flex w-max gap-2">
            {APPS.map((a) => {
              const on = a.id === app.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => pickApp(a.id)}
                  className={cn(
                    pill,
                    on
                      ? 'border-primary bg-card font-medium text-primary dark:bg-paper dark:text-harf-600'
                      : 'border-border bg-card text-muted-foreground hover:border-strong hover:text-foreground dark:border-transparent dark:bg-sunken',
                  )}
                >
                  <span dir="auto">{a.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        <p key={app.id} className="mt-3 flex animate-fade-up gap-2 text-meta leading-relaxed text-muted-foreground">
          <MagicWandIcon className="mt-0.5 size-4 shrink-0 text-primary" />
          {app.tip}
        </p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 border-t pt-4">
          {(
            [
              ['وصل الحروف', shape, setShape],
              ['عكس الاتجاه', reverse, setReverse],
              ['إزالة التشكيل', strip, setStrip],
            ] as const
          ).map(([label, on, set]) => (
            <label key={label} className="flex cursor-pointer items-center gap-3 text-control">
              <Switch checked={on} onCheckedChange={set} />
              {label}
            </label>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
        {/* ٢ — النص */}
        <section className={panel} aria-labelledby={`${inId}-t`}>
          <div className={head}>
            <h2 id={`${inId}-t`} className="text-control font-semibold">
              النص العربي
            </h2>
            <div className="flex gap-1">
              {text ? (
                <Button variant="ghost" size="sm" onClick={() => setText('')}>
                  <CrossSmallIcon />
                  مسح
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setText(EXAMPLE)}>
                  جرّب مثالاً
                </Button>
              )}
            </div>
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void copy();
              }
            }}
            placeholder="اكتب أو الصق النص هنا…"
            className="min-h-64 flex-1 resize-y rounded-none border-0 bg-transparent px-4 py-4 text-lead leading-loose shadow-none focus-visible:shadow-none sm:px-5"
          />
          <p className={foot}>
            <span dir="ltr" className="tabular-nums">
              {chars.toLocaleString('en-US')} / {MAX.toLocaleString('en-US')}
            </span>
            {lines > 1 && <span className="tabular-nums">{lines} أسطر</span>}
            <span className="ms-auto max-sm:hidden">
              <kbd className="rounded-xs border px-1.5 py-0.5 font-sans" dir="ltr">
                Ctrl + Enter
              </kbd>{' '}
              للنسخ
            </span>
          </p>
        </section>

        {/* ٣ — النتيجة */}
        <section className={panel} aria-labelledby={`${outId}-t`}>
          <div className={head}>
            <h2 id={`${outId}-t`} className="text-control font-semibold">
              النتيجة
            </h2>
            <SegmentedControl
              label="طريقة العرض"
              value={view}
              onChange={setView}
              className="h-9"
              options={[
                { value: 'paste', label: 'للّصق' },
                { value: 'preview', label: 'معاينة في البرنامج' },
              ]}
            />
          </div>

          {view === 'paste' ? (
            <>
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
                className="min-h-64 flex-1 resize-y rounded-none border-0 bg-sunken/50 px-4 py-4 text-left text-lead leading-loose shadow-none [unicode-bidi:bidi-override] focus-visible:shadow-none sm:px-5"
              />
            </>
          ) : (
            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between gap-3 bg-sunken/50 px-4 py-2.5 sm:px-5">
                <p className="text-caption text-muted-foreground">
                  {stage === 'before' ? 'هكذا يظهر نصّك الأصلي في البرنامج.' : 'وهكذا تظهر النتيجة بعد المعالجة.'}
                </p>
                <SegmentedControl
                  label="المرحلة"
                  value={stage}
                  onChange={setStage}
                  className="h-9"
                  options={[
                    { value: 'before', label: 'قبل' },
                    { value: 'after', label: 'بعد' },
                  ]}
                />
              </div>
              <AppPreview
                appName={app.id === 'other' ? 'برنامجك' : app.name}
                text={stage === 'before' ? text : result}
                stage={stage}
                className="flex-1"
              />
            </div>
          )}

          <div className={cn(foot, 'flex-wrap justify-between py-2.5')}>
            <p aria-live="polite">
              {copied
                ? 'نُسخت النتيجة — الصقها في برنامجك.'
                : view === 'paste'
                  ? 'انقر على النتيجة لتحديدها كلها.'
                  : 'المعاينة تقريبية؛ يختلف الشكل حسب خط البرنامج.'}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={download} disabled={!result}>
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
      </div>
    </div>
  );
}
