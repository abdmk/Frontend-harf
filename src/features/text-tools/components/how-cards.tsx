import { cn } from '@/lib/utils';

import { prepareArabic, shapeArabic, simulateBroken } from '../utils/arabic-reshape';

const WORD = 'العربية';

/** ما يحدث للكلمة في كل خطوة — مرسوم بالمحرّك نفسه، لا بصور */
const STEPS = [
  {
    title: 'المشكلة',
    text: 'برامج كثيرة لا تعرف قواعد العربية: ترسم كل حرف منفصلاً، ومن اليسار لليمين.',
    specimen: simulateBroken(WORD),
    ltr: true,
    tone: 'text-dgr-text',
  },
  {
    title: 'الوصل',
    text: 'نعطي كل حرف شكله الصحيح حسب موقعه — أول الكلمة أو وسطها أو آخرها — من «أشكال العرض» في يونيكود.',
    specimen: Array.from(shapeArabic(WORD)).join(' '),
    ltr: false,
    tone: 'text-foreground',
  },
  {
    title: 'العكس',
    text: 'نرتّب الحروف من اليسار لليمين مسبقاً، فحين يرسمها البرنامج بطريقته تظهر الكلمة صحيحة.',
    specimen: simulateBroken(prepareArabic(WORD, { shape: true, reverse: true })),
    ltr: true,
    tone: 'text-ok-text',
  },
] as const;

/** «كيف يعمل»: ثلاث خطوات — عيّنة مرسومة بالمحرّك نفسه فوق وصف قصير */
export function HowCards() {
  return (
    <ol className="grid gap-4 md:grid-cols-3">
      {STEPS.map((s, i) => (
        <li key={s.title} className="flex flex-col gap-3.5">
          <div className="grid aspect-[5/2] place-items-center rounded-xl bg-sunken px-6">
            <p
              aria-hidden
              dir={s.ltr ? 'ltr' : 'rtl'}
              className={cn('text-4xl leading-none font-semibold', s.tone, s.ltr && '[unicode-bidi:bidi-override]')}
            >
              {s.specimen}
            </p>
          </div>
          <div className="flex gap-3">
            <span
              dir="ltr"
              className="grid size-7 shrink-0 place-items-center rounded-full border text-caption font-semibold tabular-nums"
            >
              {i + 1}
            </span>
            <div>
              <h3 className="text-lead font-semibold">{s.title}</h3>
              <p className="mt-1 text-meta leading-relaxed text-muted-foreground">{s.text}</p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
