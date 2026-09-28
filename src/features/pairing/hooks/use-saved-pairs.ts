import { useCallback, useState } from 'react';

import { byId, type PairFont } from '../data/catalog';
import { bodyWeight, type Combo, comboKey, headingWeight } from '../utils/pairing';

const KEY = 'harf-nasaq-saved';
type Stored = { key: string; score: number; reason: string };

function read(): Stored[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]') as unknown;
    return Array.isArray(raw)
      ? raw.filter((x): x is Stored => typeof x?.key === 'string' && typeof x?.score === 'number').slice(0, 60)
      : [];
  } catch {
    return [];
  }
}

/** يعيد بناء التركيبة من المعرّفات فقط — ما لم يعد في الكتالوج يُسقط بصمت */
function rebuild(s: Stored): Combo | null {
  const [h, sub, b] = s.key.split('|');
  const hf = byId(h ?? '');
  const bf = byId(b ?? '');
  const sf = sub ? byId(sub) : null;
  if (!hf || !bf || (sub && !sf)) return null;
  const slot = (font: PairFont, weight: number, role: Combo['heading']['role']) => ({ font, weight, role });
  return {
    key: comboKey(hf.id, bf.id, sf?.id),
    score: s.score,
    reason: s.reason,
    heading: slot(hf, headingWeight(hf), 'العناوين'),
    body: slot(bf, bodyWeight(bf), 'النصوص'),
    ...(sf && { sub: slot(sf, bodyWeight(sf), 'العناوين الفرعية') }),
  };
}

/** التركيبات المحفوظة — في هذا المتصفّح (ids ودرجة فقط) */
export function useSavedPairs() {
  const [items, setItems] = useState<Stored[]>(read);
  const persist = (next: Stored[]) => {
    setItems(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* التخزين غير متاح — يبقى الحفظ لهذه الزيارة */
    }
  };
  const isSaved = useCallback((key: string) => items.some((x) => x.key === key), [items]);
  const toggle = (c: Combo) =>
    persist(
      isSaved(c.key)
        ? items.filter((x) => x.key !== c.key)
        : [{ key: c.key, score: c.score, reason: c.reason }, ...items].slice(0, 60),
    );
  const combos = items.map(rebuild).filter((c): c is Combo => !!c);
  return { combos, isSaved, toggle };
}
