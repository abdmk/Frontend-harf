import '../fonts/fonts.css';

import { useEffect, useMemo, useState } from 'react';

import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { CrossSmallIcon, LayersIcon, LockIcon, RefreshIcon } from '@/components/ui/icons';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { toast } from '@/components/ui/toast';

import { type Brief, BriefSentence } from './brief';
import { PairCard } from './pair-card';
import { PairDetail } from './pair-detail';
import { byId, FAMILIES, LANG_SETS, TIERS, USE_CASES } from '../data/catalog';
import { type Specimen, SPECIMENS } from '../data/specimens';
import { useSavedPairs } from '../hooks/use-saved-pairs';
import { cssSnippet } from '../utils/css-snippet';
import { type Combo, generate } from '../utils/pairing';

type Locked = { heading?: string; body?: string };
const ROLE_LABEL = { heading: 'العناوين', body: 'النصوص' } as const;

/**
 * «نسق»: تختار ما تصمّمه في جملة واحدة، فتقترح الأداة ستّ تركيبات خطوط عربية متناسقة معروضة
 * بخطوطها الحقيقية. «تركيبات جديدة» (أو المسافة) يعيد التوليد، والقفل يثبّت خطاً ويغيّر الباقي.
 */
export function NasaqTool() {
  const [brief, setBrief] = useState<Brief>({ useCase: 'identity', lang: 'ar', tier: 'all', fonts: 2 });
  const [seed, setSeed] = useState(1);
  const [locked, setLocked] = useState<Locked>({});
  const [custom, setCustom] = useState<Specimen | null>(null);
  const [view, setView] = useState<'suggest' | 'saved'>('suggest');
  const [open, setOpen] = useState<Combo | null>(null);
  const saved = useSavedPairs();

  const text = custom ?? SPECIMENS[brief.useCase];
  const showLatin = brief.lang === 'ar-en';
  const combos = useMemo(
    () =>
      generate(FAMILIES, {
        useCase: USE_CASES[brief.useCase],
        tiers: TIERS[brief.tier].tiers,
        scripts: LANG_SETS[brief.lang].scripts,
        fonts: brief.fonts,
        seed,
        count: 6,
        locked,
      }),
    [brief, seed, locked],
  );
  const shown = view === 'saved' ? saved.combos : combos;

  const regenerate = () => {
    setView('suggest');
    setSeed((s) => s + 1);
  };

  // المسافة تولّد تركيبات جديدة — إلا أثناء الكتابة أو داخل نافذة/قائمة
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat || open) return;
      const t = e.target as HTMLElement;
      if (t.isContentEditable || t.closest('input, textarea, button, [role="menu"], [role="dialog"]')) return;
      e.preventDefault();
      regenerate();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function changeBrief(b: Brief) {
    // تغيير الخيارات يُلغي الأقفال التي لم تعد صالحة لها
    setLocked((l) => {
      const ok = (id?: string) => {
        const f = id ? byId(id) : null;
        return (
          f &&
          TIERS[b.tier].tiers.includes(f.tier as never) &&
          LANG_SETS[b.lang].scripts.every((s) => f.scripts.includes(s))
        );
      };
      return { heading: ok(l.heading) ? l.heading : undefined, body: ok(l.body) ? l.body : undefined };
    });
    setBrief(b);
    setView('suggest');
  }

  function toggleLock(role: 'heading' | 'body', id: string) {
    setLocked((l) => ({ ...l, [role]: l[role] === id ? undefined : id }));
    setSeed((s) => s + 1);
  }

  async function copy(c: Combo) {
    try {
      await navigator.clipboard.writeText(cssSnippet(c));
      toast({ tone: 'success', title: 'نُسخ مقتطف CSS', description: 'الصقه في ملف الأنماط.' });
    } catch {
      toast({ tone: 'danger', title: 'تعذّر النسخ' });
    }
  }

  function save(c: Combo) {
    const was = saved.isSaved(c.key);
    saved.toggle(c);
    toast({ tone: 'success', title: was ? 'أُزيلت من المحفوظة' : 'حُفظت التركيبة' });
  }

  const lockEntries = (Object.keys(locked) as (keyof Locked)[]).filter((k) => locked[k]);

  return (
    <div className="flex flex-col gap-8">
      <section aria-label="ما الذي تصمّمه" className="rounded-xl border bg-card px-5 py-6 sm:px-8 sm:py-8">
        <BriefSentence value={brief} onChange={changeBrief} />
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
          <Button size="lg" onClick={regenerate}>
            <RefreshIcon />
            تركيبات جديدة
          </Button>
          <span className="text-caption text-tertiary max-sm:hidden">
            أو اضغط{' '}
            <kbd className="rounded-xs border bg-sunken px-1.5 py-0.5 font-sans text-caption text-muted-foreground">
              مسافة
            </kbd>
          </span>
          {lockEntries.map((role) => (
            <span
              key={role}
              className="inline-flex items-center gap-1.5 rounded-full bg-tint-brand py-1 ps-3 pe-1 text-caption text-primary"
            >
              <LockIcon className="size-3" />
              {byId(locked[role]!)?.nameAr} مثبّت لـ{ROLE_LABEL[role]}
              <button
                type="button"
                aria-label={`فكّ تثبيت ${byId(locked[role]!)?.nameAr}`}
                onClick={() => toggleLock(role, locked[role]!)}
                className="grid size-6 place-items-center rounded-full hover:bg-primary/10"
              >
                <CrossSmallIcon className="size-4" />
              </button>
            </span>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          label="العرض"
          value={view}
          onChange={setView}
          options={[
            { value: 'suggest', label: 'الاقتراحات' },
            { value: 'saved', label: `المحفوظة${saved.combos.length ? ` (${saved.combos.length})` : ''}` },
          ]}
        />
        <div className="flex items-center gap-3 text-caption text-tertiary">
          <span>النص قابل للتحرير — اكتب على أي بطاقة</span>
          {custom && (
            <Button variant="ghost" size="sm" onClick={() => setCustom(null)}>
              النص الافتراضي
            </Button>
          )}
        </div>
      </div>

      {shown.length ? (
        <ul key={view === 'saved' ? 'saved' : seed} className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-2">
          {shown.map((c, i) => (
            <li key={c.key} className="flex [&>*]:w-full">
              <PairCard
                combo={c}
                index={i}
                text={text}
                onText={setCustom}
                showLatin={showLatin}
                locked={locked}
                onLock={view === 'suggest' ? toggleLock : undefined}
                saved={saved.isSaved(c.key)}
                onSave={() => save(c)}
                onCopy={() => copy(c)}
                onOpen={() => setOpen(c)}
              />
            </li>
          ))}
        </ul>
      ) : view === 'saved' ? (
        <EmptyState
          icon={<LayersIcon />}
          title="لا تركيبات محفوظة بعد"
          description="احفظ ما يعجبك من الاقتراحات لتعود إليه هنا."
          action={
            <Button variant="outline" onClick={() => setView('suggest')}>
              عرض الاقتراحات
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={<LayersIcon />}
          title="لا تركيبات لهذه الخيارات"
          description="الخطوط التي تطابق كل الشروط أقلّ من أن تكوّن تركيبة. وسّع الترخيص أو اللغات."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setLocked({});
                changeBrief({ ...brief, tier: 'all', lang: 'ar' });
              }}
            >
              وسّع الخيارات
            </Button>
          }
        />
      )}

      <PairDetail
        combo={open}
        text={text}
        showLatin={showLatin}
        saved={open ? saved.isSaved(open.key) : false}
        onSave={() => open && save(open)}
        onCopy={() => open && copy(open)}
        onOpenChange={(v) => !v && setOpen(null)}
      />
    </div>
  );
}
