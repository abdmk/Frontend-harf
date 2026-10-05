import { useEffect, useMemo, useState } from 'react';

import { EmptyState } from '@/components/shared/empty-state';
import { Reveal } from '@/components/shared/reveal';
import { Button } from '@/components/ui/button';
import { CrossSmallIcon, LayersIcon, LockIcon } from '@/components/ui/icons';
import { toast } from '@/components/ui/toast';
import { paths } from '@/config/paths';

import { NasaqToolbar } from './nasaq-toolbar';
import { PairCard } from './pair-card';
import { type Brief, DEFAULT_BRIEF, FONTS_LABEL, LANG_LABEL, TIER_LABEL, type View } from '../data/brief';
import { byId, FAMILIES, LANG_SETS, TIERS, USE_CASES } from '../data/catalog';
import { SPECIMENS } from '../data/specimens';
import { useSavedPairs } from '../hooks/use-saved-pairs';
import { type Combo, generate, pairSlug } from '../utils/pairing';

type Role = 'heading' | 'body';
type Locked = Partial<Record<Role, string>>;

const SESSION_KEY = 'harf-nasaq-session';
type Session = { brief: Brief; seed: number; locked: Locked; heading: string; view: View };
const FRESH: Session = { brief: DEFAULT_BRIEF, seed: 1, locked: {}, heading: '', view: 'suggest' };

/** حالة الأداة في هذه الجلسة — كل حقل يُتحقّق منه، وما لا يصلح يعود للافتراضي */
function readSession(): Session {
  try {
    const raw = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null') as Partial<Session> | null;
    if (!raw || typeof raw !== 'object') return FRESH;
    const b = raw.brief;
    const brief: Brief =
      b &&
      Object.hasOwn(USE_CASES, b.useCase) &&
      Object.hasOwn(LANG_SETS, b.lang) &&
      Object.hasOwn(TIERS, b.tier) &&
      (b.fonts === 2 || b.fonts === 3)
        ? b
        : DEFAULT_BRIEF;
    const ok = (id: unknown) => (typeof id === 'string' && byId(id) ? id : undefined);
    return {
      brief,
      seed: Number.isInteger(raw.seed) && raw.seed! > 0 ? raw.seed! : 1,
      locked: { heading: ok(raw.locked?.heading), body: ok(raw.locked?.body) },
      heading: typeof raw.heading === 'string' ? raw.heading.slice(0, 80) : '',
      view: raw.view === 'saved' ? 'saved' : 'suggest',
    };
  } catch {
    return FRESH;
  }
}
const ROLE_LABEL = { heading: 'العناوين', body: 'النصوص' } as const;
const BATCH = 8;

type Chip = { key: string; label: string; clear: () => void; lock?: boolean };

function countLabel(n: number) {
  if (n === 0) return 'لا تركيبات';
  if (n === 1) return 'تركيبة واحدة';
  if (n === 2) return 'تركيبتان';
  if (n <= 10) return `${n} تركيبات`;
  return `${n} تركيبة`;
}

/**
 * «نسق»: شريط أدوات فوق شبكة تركيبات موحّدة (ثمانٍ في الدفعة) بخطوطها الحقيقية.
 * «تركيبات جديدة» (أو المسافة) يعيد التوليد، والقفل يثبّت خطاً لدوره ويغيّر الباقي.
 */
export function NasaqTool() {
  const [initial] = useState(readSession);
  const [brief, setBrief] = useState<Brief>(initial.brief);
  const [seed, setSeed] = useState(initial.seed);
  const [locked, setLocked] = useState<Locked>(initial.locked);
  const [heading, setHeading] = useState(initial.heading);
  const [view, setView] = useState<View>(initial.view);
  const saved = useSavedPairs();

  // الرجوع من صفحة تركيبة يعيد ما تركه المستخدم: نصّه وخياراته والتركيبات نفسها (البذرة)
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ brief, seed, locked, heading, view }));
    } catch {
      /* التخزين غير متاح — تبدأ الأداة من جديد */
    }
  }, [brief, seed, locked, heading, view]);

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
      if (e.code !== 'Space' || e.repeat) return;
      const t = e.target as HTMLElement;
      if (t.isContentEditable || t.closest('input, textarea, button, a, [role="menu"], [role="dialog"]')) return;
      e.preventDefault();
      regenerate();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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

  function save(c: Combo) {
    const was = saved.isSaved(c.key);
    saved.toggle(c);
    toast({ tone: 'success', title: was ? 'أُزيلت من المحفوظة' : 'حُفظت التركيبة' });
  }

  const lockEntries = (Object.keys(locked) as Role[]).filter((k) => locked[k]);
  const chips: Chip[] = [
    ...(brief.useCase !== DEFAULT_BRIEF.useCase
      ? [
          {
            key: 'useCase',
            label: USE_CASES[brief.useCase].label,
            clear: () => changeBrief({ ...brief, useCase: DEFAULT_BRIEF.useCase }),
          },
        ]
      : []),
    ...(brief.lang !== DEFAULT_BRIEF.lang
      ? [
          {
            key: 'lang',
            label: LANG_LABEL[brief.lang],
            clear: () => changeBrief({ ...brief, lang: DEFAULT_BRIEF.lang }),
          },
        ]
      : []),
    ...(brief.tier !== DEFAULT_BRIEF.tier
      ? [
          {
            key: 'tier',
            label: TIER_LABEL[brief.tier],
            clear: () => changeBrief({ ...brief, tier: DEFAULT_BRIEF.tier }),
          },
        ]
      : []),
    ...(brief.fonts !== DEFAULT_BRIEF.fonts
      ? [
          {
            key: 'fonts',
            label: FONTS_LABEL[brief.fonts],
            clear: () => changeBrief({ ...brief, fonts: DEFAULT_BRIEF.fonts }),
          },
        ]
      : []),
    ...lockEntries.map((role) => ({
      key: role,
      lock: true,
      label: `${byId(locked[role]!)?.nameAr} لـ${ROLE_LABEL[role]}`,
      clear: () => toggleLock(role, locked[role]!),
    })),
  ];

  return (
    <div className="flex flex-col gap-5">
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

      {/* سطر الحالة كسطر «N نتيجة» في المكتبة: العدد + شرائح ما تغيّر (تُزال بنقرة) + «مسح الكل» */}
      <div
        aria-live="polite"
        className="-mt-1 flex min-h-7 flex-wrap items-center gap-2 text-meta text-muted-foreground"
      >
        <span className="font-medium text-foreground">{countLabel(shown.length)}</span>
        {view === 'suggest' &&
          chips.map((c) => (
            <button
              key={c.key}
              type="button"
              aria-label={`إزالة ${c.label}`}
              onClick={c.clear}
              className="group/fc inline-flex h-6 animate-pop-in items-center gap-1 rounded-full bg-tint-brand ps-2 pe-1 text-caption leading-none text-primary"
            >
              {c.lock && <LockIcon className="size-3" />}
              <span>{c.label}</span>
              <span className="grid size-4 place-items-center rounded-full bg-primary/15 transition-colors group-hover/fc:bg-primary-fill group-hover/fc:text-white">
                <CrossSmallIcon className="size-3" />
              </span>
            </button>
          ))}
        {view === 'suggest' && chips.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setLocked({});
              changeBrief(DEFAULT_BRIEF);
            }}
            className="px-1 text-caption underline underline-offset-4 transition-colors hover:text-foreground"
          >
            مسح الكل
          </button>
        )}
      </div>

      {shown.length ? (
        <ul
          key={view === 'saved' ? 'saved' : seed}
          aria-label={view === 'saved' ? 'التركيبات المحفوظة' : 'التركيبات المقترحة'}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {shown.map((c, i) => (
            <Reveal as="li" key={c.key} index={i} className="flex [&>*]:w-full">
              <PairCard
                combo={c}
                text={text}
                showLatin={showLatin}
                locked={locked}
                onLock={view === 'suggest' ? toggleLock : undefined}
                saved={saved.isSaved(c.key)}
                onSave={() => save(c)}
                href={paths.tools.nasaqPair.getHref(pairSlug(c), {
                  use: brief.useCase,
                  lang: brief.lang,
                  text: heading.trim(),
                })}
              />
            </Reveal>
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
    </div>
  );
}
