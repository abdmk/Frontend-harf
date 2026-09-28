import { useEffect, useMemo, useState } from 'react';

import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { CrossSmallIcon, LayersIcon, LockIcon } from '@/components/ui/icons';
import { toast } from '@/components/ui/toast';

import { type Brief, NasaqToolbar, type View } from './nasaq-toolbar';
import { PairCard } from './pair-card';
import { PairDetail } from './pair-detail';
import { byId, FAMILIES, LANG_SETS, TIERS, USE_CASES } from '../data/catalog';
import { SPECIMENS } from '../data/specimens';
import { useSavedPairs } from '../hooks/use-saved-pairs';
import { cssSnippet } from '../utils/css-snippet';
import { type Combo, generate } from '../utils/pairing';

type Role = 'heading' | 'body';
type Locked = Partial<Record<Role, string>>;
const ROLE_LABEL = { heading: 'العناوين', body: 'النصوص' } as const;
const BATCH = 9;

/**
 * «نسق»: شريط أدوات فوق شبكة تركيبات موحّدة (تسع في الدفعة) بخطوطها الحقيقية.
 * «تركيبات جديدة» (أو المسافة) يعيد التوليد، والقفل يثبّت خطاً لدوره ويغيّر الباقي.
 */
export function NasaqTool() {
  const [brief, setBrief] = useState<Brief>({ useCase: 'identity', lang: 'ar', tier: 'all', fonts: 2 });
  const [seed, setSeed] = useState(1);
  const [locked, setLocked] = useState<Locked>({});
  const [heading, setHeading] = useState('');
  const [view, setView] = useState<View>('suggest');
  const [open, setOpen] = useState<Combo | null>(null);
  const saved = useSavedPairs();

  const base = SPECIMENS[brief.useCase];
  const text = heading.trim() ? { ...base, heading } : base;
  const showLatin = brief.lang === 'ar-en';
  const combos = useMemo(
    () =>
      generate(FAMILIES, {
        useCase: USE_CASES[brief.useCase],
        tiers: TIERS[brief.tier].tiers,
        scripts: LANG_SETS[brief.lang].scripts,
        fonts: brief.fonts,
        seed,
        count: BATCH,
        locked,
      }),
    [brief, seed, locked],
  );
  const shown = view === 'saved' ? saved.combos : combos;

  const regenerate = () => {
    setView('suggest');
    setSeed((s) => s + 1);
  };

  // المسافة تولّد تركيبات جديدة — إلا أثناء الكتابة أو على زرّ أو داخل نافذة/قائمة
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat || open) return;
      const t = e.target as HTMLElement;
      if (t.isContentEditable || t.closest('input, textarea, button, a, [role="menu"], [role="dialog"]')) return;
      e.preventDefault();
      regenerate();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function changeBrief(b: Brief) {
    // تغيير الخيارات يُلغي الأقفال التي لم تعد صالحة لها
    const ok = (id?: string) => {
      const f = id ? byId(id) : null;
      return (
        !!f &&
        TIERS[b.tier].tiers.includes(f.tier as never) &&
        LANG_SETS[b.lang].scripts.every((s) => f.scripts.includes(s))
      );
    };
    setLocked((l) => ({ heading: ok(l.heading) ? l.heading : undefined, body: ok(l.body) ? l.body : undefined }));
    setBrief(b);
    setView('suggest');
  }

  function toggleLock(role: Role, id: string) {
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

  const lockEntries = (Object.keys(locked) as Role[]).filter((k) => locked[k]);

  return (
    <div className="flex flex-col gap-6">
      <NasaqToolbar
        brief={brief}
        onBrief={changeBrief}
        onRegenerate={regenerate}
        heading={heading}
        placeholder={base.heading}
        onHeading={setHeading}
        view={view}
        onView={setView}
        savedCount={saved.combos.length}
      />

      {view === 'suggest' && lockEntries.length > 0 && (
        <ul aria-label="الخطوط المثبّتة" className="-mt-2 flex flex-wrap gap-2">
          {lockEntries.map((role) => (
            <li
              key={role}
              className="inline-flex animate-pop-in items-center gap-1.5 rounded-full bg-tint-brand py-1 ps-3 pe-1 text-caption text-primary"
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
            </li>
          ))}
        </ul>
      )}

      {shown.length ? (
        <ul
          key={view === 'saved' ? 'saved' : seed}
          aria-label={view === 'saved' ? 'التركيبات المحفوظة' : 'التركيبات المقترحة'}
          className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {shown.map((c, i) => (
            <li key={c.key}>
              <PairCard
                combo={c}
                index={i}
                text={text}
                showLatin={showLatin}
                locked={locked}
                onLock={view === 'suggest' ? toggleLock : undefined}
                saved={saved.isSaved(c.key)}
                onSave={() => save(c)}
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
