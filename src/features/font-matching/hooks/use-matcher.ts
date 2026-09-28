import { useCallback, useEffect, useRef, useState } from 'react';

import { type Candidate, getCandidates } from '../api/candidates';
import { cropPixels, ImageError, type LoadedImage, loadImage, renderMask } from '../utils/browser';
import { binarize, inkBounds, inkMask, type Mask, type Polarity, type Rect, toGray } from '../utils/image';
import { type Breakdown, compare, signature, similarity } from '../utils/score';

export type StepKey = 'read' | 'isolate' | 'compare' | 'rank';
export const STEPS: Record<StepKey, string> = {
  read: 'قراءة الصورة',
  isolate: 'عزل الحروف عن الخلفية',
  compare: 'رسم النص بخطوط المكتبة ومقارنته',
  rank: 'ترتيب النتائج',
};

export type Match = { font: Candidate; weight: number; score: number; breakdown: Breakdown; mask: Mask };
export type Options = { includePaid: boolean; polarity: Polarity };

type State =
  | { phase: 'empty'; error?: string }
  | { phase: 'ready'; image: LoadedImage; auto: Rect | null; lightInk: boolean; error?: string }
  | { phase: 'running'; image: LoadedImage; auto: Rect | null; lightInk: boolean; done: StepKey[]; progress: number }
  | {
      phase: 'done';
      image: LoadedImage;
      auto: Rect | null;
      lightInk: boolean;
      source: Mask;
      matches: Match[];
      total: number;
    };

const TOP = 6;
const tick = () => new Promise((r) => setTimeout(r, 0));

/** حدود الحبر في الصورة كلها — التحديد الافتراضي حول الكتابة، مع هامش صغير */
function autoRect(image: LoadedImage): { rect: Rect | null; lightInk: boolean } {
  const { pixels } = image;
  const { mask, lightInk } = binarize(toGray(pixels), pixels.width, pixels.height);
  const box = inkBounds(mask, Math.max(1, Math.round(Math.min(pixels.width, pixels.height) / 300)));
  if (!box) return { rect: null, lightInk };
  const pad = Math.round(Math.max(box.w, box.h) * 0.04);
  const x = Math.max(0, box.x - pad);
  const y = Math.max(0, box.y - pad);
  return {
    rect: { x, y, w: Math.min(pixels.width - x, box.w + pad * 2), h: Math.min(pixels.height - y, box.h + pad * 2) },
    lightInk,
  };
}

/**
 * حالة «مطابقة الخطوط» كلها: الصورة ← التحديد والنص ← المقارنة ← النتائج.
 * المعالجة على الجهاز، على دفعات قصيرة حتى تبقى الواجهة سلسة، وقابلة للإلغاء.
 */
export function useMatcher() {
  const [state, setState] = useState<State>({ phase: 'empty' });
  const run = useRef(0);
  const urlRef = useRef<string | null>(null);

  const revoke = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
  };
  useEffect(() => revoke, []);

  const open = useCallback(async (file: File) => {
    run.current++;
    try {
      const image = await loadImage(file);
      revoke();
      urlRef.current = image.url;
      const { rect, lightInk } = autoRect(image);
      setState({ phase: 'ready', image, auto: rect, lightInk });
    } catch (e) {
      const message = e instanceof ImageError ? e.message : 'تعذّرت قراءة الصورة — جرّب ملفاً آخر.';
      setState((s) => (s.phase === 'empty' ? { phase: 'empty', error: message } : { ...s, error: message }));
    }
  }, []);

  const reset = useCallback(() => {
    run.current++;
    revoke();
    setState({ phase: 'empty' });
  }, []);

  const cancel = useCallback(() => {
    run.current++;
    setState((s) =>
      s.phase === 'running' ? { phase: 'ready', image: s.image, auto: s.auto, lightInk: s.lightInk } : s,
    );
  }, []);

  const match = useCallback(
    async (text: string, rect: Rect | null, opts: Options) => {
      if (state.phase === 'empty' || state.phase === 'running') return;
      const { image, auto, lightInk } = state;
      const id = ++run.current;
      const alive = () => run.current === id;
      const done: StepKey[] = [];
      const set = (progress: number) =>
        alive() && setState({ phase: 'running', image, auto, lightInk, done: [...done], progress });

      set(0);
      await tick();
      const region = cropPixels(image.pixels, rect ?? auto ?? { x: 0, y: 0, w: image.width, h: image.height });
      done.push('read');
      set(0.08);
      await tick();

      const ink = inkMask(region, opts.polarity);
      if (!ink) {
        if (alive())
          setState({
            phase: 'ready',
            image,
            auto,
            lightInk,
            error: 'لم نجد كتابة واضحة في التحديد — وسّع التحديد أو جرّب صورة بتباين أعلى.',
          });
        return;
      }
      const source = ink.mask;
      const sig = signature(source);
      done.push('isolate');
      set(0.15);

      const fonts = getCandidates({ includePaid: opts.includePaid });
      const jobs = fonts.flatMap((font) => font.face.weights.map((weight) => ({ font, weight })));
      const best = new Map<string, Match>();
      for (let i = 0; i < jobs.length; i++) {
        if (!alive()) return;
        const { font, weight } = jobs[i]!;
        const mask = await renderMask(text, font.face.family, weight);
        if (mask) {
          const other = signature(mask);
          const score = similarity(sig, other);
          const prev = best.get(font.id);
          if (!prev || score > prev.score)
            best.set(font.id, { font, weight, score, breakdown: compare(sig, other), mask });
        }
        set(0.15 + (0.8 * (i + 1)) / jobs.length);
        if (i % 3 === 2) await tick();
      }
      done.push('compare');
      set(0.97);
      await tick();

      const matches = [...best.values()].sort((a, b) => b.score - a.score).slice(0, TOP);
      done.push('rank');
      if (!alive()) return;
      setState({ phase: 'done', image, auto, lightInk, source, matches, total: best.size });
    },
    [state],
  );

  return { state, open, reset, cancel, match };
}
