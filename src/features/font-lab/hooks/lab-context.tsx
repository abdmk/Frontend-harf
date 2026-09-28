import { type CSSProperties, createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { toast } from '@/components/ui/toast';

import { featureSettings } from '../data/features';
import type { LabFont, LabSettings } from '../types';
import { loadFiles, loadLibraryPackage } from '../utils/load';

export const DEFAULT_TEXT = 'الخطُّ الحسنُ يجعل الحقَّ أكثرَ وضوحًا';

const DEFAULT_SETTINGS: LabSettings = {
  text: DEFAULT_TEXT,
  size: 44,
  weight: 400,
  lineHeight: 1.7,
  letterSpacing: 0,
  wordSpacing: 0,
  width: 100,
  align: 'start',
  color: '',
  background: '',
  features: {},
  axes: {},
};

type Lab = {
  fonts: LabFont[];
  active: LabFont | null;
  setActive: (id: string) => void;
  remove: (id: string) => void;
  add: (files: Iterable<File>) => Promise<void>;
  addFromLibrary: (id: string, url: string, name: string) => Promise<void>;
  busy: boolean;
  settings: LabSettings;
  set: (patch: Partial<LabSettings>) => void;
  resetSettings: () => void;
  /** نمط المعاينة: الخط النشط + الميزات + المحاور — يُطبَّق على كل الأدوات */
  specimen: (font?: LabFont | null, extra?: CSSProperties) => CSSProperties;
};

const Ctx = createContext<Lab | null>(null);

export function useLab() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLab خارج LabProvider');
  return v;
}

export function LabProvider({ children }: { children: ReactNode }) {
  const [fonts, setFonts] = useState<LabFont[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [settings, setSettings] = useState<LabSettings>(DEFAULT_SETTINGS);

  const active = fonts.find((f) => f.id === activeId) ?? fonts[0] ?? null;

  const accept = useCallback((report: Awaited<ReturnType<typeof loadFiles>>) => {
    if (report.fonts.length) {
      setFonts((prev) => [...prev, ...report.fonts]);
      setActiveId(report.fonts[0]!.id);
      // وزن المعاينة يبدأ من وزن الخط نفسه، والمحاور من قيمها الافتراضية
      const first = report.fonts[0]!;
      setSettings((s) => ({
        ...s,
        weight: first.weight,
        axes: Object.fromEntries(first.axes.map((a) => [a.tag, a.default])),
      }));
      toast({
        tone: 'success',
        title: report.fonts.length === 1 ? `حُمّل ${first.fullName}` : `حُمّل ${report.fonts.length} خطوط`,
      });
    }
    for (const s of report.skipped.slice(0, 3)) toast({ tone: 'danger', title: s.name, description: s.reason });
  }, []);

  const add = useCallback(
    async (files: Iterable<File>) => {
      setBusy(true);
      try {
        accept(await loadFiles(files));
      } finally {
        setBusy(false);
      }
    },
    [accept],
  );

  const addFromLibrary = useCallback(
    async (_id: string, url: string, name: string) => {
      setBusy(true);
      try {
        accept(await loadLibraryPackage(url, name));
      } catch {
        toast({ tone: 'danger', title: 'تعذّر تحميل الخط من المكتبة' });
      } finally {
        setBusy(false);
      }
    },
    [accept],
  );

  const remove = useCallback((id: string) => {
    setFonts((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const set = useCallback((patch: Partial<LabSettings>) => setSettings((s) => ({ ...s, ...patch })), []);
  const resetSettings = useCallback(
    () =>
      setSettings((s) => ({
        ...DEFAULT_SETTINGS,
        text: s.text,
        weight: active?.weight ?? 400,
        axes: Object.fromEntries((active?.axes ?? []).map((a) => [a.tag, a.default])),
      })),
    [active],
  );

  const specimen = useCallback(
    (font: LabFont | null = active, extra?: CSSProperties): CSSProperties => {
      if (!font) return extra ?? {};
      const axes = font.axes
        .filter((a) => settings.axes[a.tag] !== undefined && a.tag !== 'wght')
        .map((a) => `"${a.tag}" ${settings.axes[a.tag]}`);
      return {
        fontFamily: `'${font.css}', var(--font-sans)`,
        fontFeatureSettings: featureSettings(
          font.features.map((f) => f.tag),
          settings.features,
        ),
        fontVariationSettings: axes.length ? axes.join(', ') : undefined,
        fontWeight: font.axes.some((a) => a.tag === 'wght') ? (settings.axes.wght ?? font.weight) : font.weight,
        fontStyle: font.italic ? 'italic' : 'normal',
        ...extra,
      };
    },
    [active, settings.axes, settings.features],
  );

  const value = useMemo<Lab>(
    () => ({
      fonts,
      active,
      setActive: setActiveId,
      remove,
      add,
      addFromLibrary,
      busy,
      settings,
      set,
      resetSettings,
      specimen,
    }),
    [fonts, active, remove, add, addFromLibrary, busy, settings, set, resetSettings, specimen],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
