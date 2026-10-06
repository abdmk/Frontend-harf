import { type CSSProperties, useMemo } from 'react';

import { ExclamationIcon } from '@/components/ui/icons';

import { LAYOUT, missingChars, PARAGRAPHS, type Specimen, TESTS } from '../data/specimens';
import { useLab } from '../hooks/lab-context';

/**
 * نمط النص بإعدادات اللوحة كلها — الحجم يُمرَّر لأن لكل سياق سلّمه:
 * العنوان بالحجم المختار، والمتن بنسبة منه، فيبقى المنزلق ذا معنى في كل سياق.
 */
function useTextStyle() {
  const { active, settings: s, specimen } = useLab();
  return (fontSize: number, extra?: CSSProperties) =>
    specimen(active, {
      fontSize,
      lineHeight: s.lineHeight,
      letterSpacing: s.letterSpacing,
      wordSpacing: s.wordSpacing,
      textAlign: s.align,
      color: s.color || undefined,
      ...extra,
    });
}

/** حجم المتن من حجم العنوان — بين 14 و32 */
const bodySize = (size: number) => Math.round(Math.min(32, Math.max(14, size * 0.42)));

function useCodepoints() {
  const { active } = useLab();
  return useMemo(() => new Set(active?.codepoints ?? []), [active]);
}

/** بطاقة نص: ماذا تختبر، وما لا يدعمه الخط منها — بالاسم، لا بخط بديل صامت */
function SpecimenCard({ sp, size }: { sp: Specimen; size: number }) {
  const { settings: s } = useLab();
  const style = useTextStyle();
  const cps = useCodepoints();
  const missing = missingChars(sp.text, cps);
  const titleId = `sp-${sp.key}`;
  return (
    <article
      aria-labelledby={titleId}
      className="rounded-2xl border bg-card"
      style={{ background: s.background || undefined }}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 pt-4">
        <h3 id={titleId} className="text-control font-semibold">
          {sp.label}
          <span className="ms-2 font-normal text-tertiary">{sp.tests}</span>
        </h3>
        {missing.length > 0 ? (
          <p className="inline-flex items-center gap-1.5 text-caption text-warn-text">
            <ExclamationIcon className="size-3.5" />
            غير موجود في الخط: <bdi className="tracking-wide">{missing.slice(0, 12).join(' ')}</bdi>
            {missing.length > 12 && ` +${missing.length - 12}`}
          </p>
        ) : (
          <p className="text-caption text-tertiary">كل الحروف موجودة</p>
        )}
      </header>
      <p
        dir={sp.dir ?? 'rtl'}
        lang={sp.lang ?? (s.lang || undefined)}
        className="px-5 pt-3 pb-5 break-words"
        style={style(size, sp.dir === 'ltr' ? { textAlign: s.align === 'justify' ? 'justify' : 'left' } : undefined)}
      >
        {sp.text}
      </p>
    </article>
  );
}

/** «اختبارات» — بالحجم المختار (بسقف 72 حتى تبقى البطاقة مقروءة كاملة) */
export function TestsContext() {
  const { settings: s } = useLab();
  const size = Math.min(72, s.size);
  return (
    <div className="flex flex-col gap-3">
      {TESTS.map((sp) => (
        <SpecimenCard key={sp.key} sp={sp} size={size} />
      ))}
    </div>
  );
}

/** «فقرات» — نصوص قراءة بحجم المتن */
export function ParagraphsContext() {
  const { settings: s } = useLab();
  const size = bodySize(s.size);
  return (
    <div className="gap-3 xl:columns-2 [&>*]:mb-3 [&>*]:break-inside-avoid">
      {PARAGRAPHS.map((sp) => (
        <SpecimenCard key={sp.key} sp={sp} size={size} />
      ))}
    </div>
  );
}

/** «تخطيط» — صفحة مقال: العنوان بالحجم المختار، المقدّمة والمتن بنسب منه، والمتن بأعمدة */
export function LayoutContext() {
  const { settings: s } = useLab();
  const style = useTextStyle();
  const body = bodySize(s.size);
  const lead = Math.round(Math.min(48, Math.max(18, s.size * 0.62)));
  return (
    <article
      aria-label="تخطيط صفحة"
      lang={s.lang || undefined}
      className="rounded-2xl border bg-card p-6 sm:p-10"
      style={{ background: s.background || undefined }}
    >
      <h3 className="break-words" style={style(s.size, { lineHeight: Math.min(s.lineHeight, 1.4) })}>
        {LAYOUT.title}
      </h3>
      <p className="mt-4 max-w-[38em] break-words" style={style(lead)}>
        {LAYOUT.lead}
      </p>
      <hr className="my-8" />
      <p
        className="break-words sm:columns-2 sm:gap-10 lg:columns-3"
        style={style(body, { textAlign: s.align === 'justify' ? 'justify' : s.align })}
      >
        {LAYOUT.body}
      </p>
      <p dir="ltr" className="mt-6 text-caption text-tertiary tabular-nums">
        {s.size}px / {lead}px / {body}px
      </p>
    </article>
  );
}
