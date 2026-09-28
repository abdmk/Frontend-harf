import { useEffect, useState } from 'react';

/**
 * ينتظر تحميل خطوط التركيبة قبل عرضها — معاينة بخط بديل «تكذب» على المصمّم.
 * مهلة 4 ثوانٍ: إن تعذّر التحميل تُعرض على أي حال مع علامة `failed`.
 */
export function useFontsReady(faces: { family: string; weight: number }[], sample: string) {
  const sig = faces.map((f) => `${f.weight} ${f.family}`).join('|');
  const [state, setState] = useState<{ sig: string; ready: boolean; failed: boolean }>({
    sig: '',
    ready: false,
    failed: false,
  });

  useEffect(() => {
    let alive = true;
    if (typeof document === 'undefined' || !('fonts' in document)) return;
    const loads = faces.map((f) => document.fonts.load(`${f.weight} 32px "${f.family}"`, sample || 'حرف'));
    const timeout = new Promise<'timeout'>((r) => window.setTimeout(() => r('timeout'), 4000));
    Promise.race([Promise.all(loads), timeout])
      .then((res) => {
        if (!alive) return;
        const ok = res !== 'timeout' && faces.every((f) => document.fonts.check(`${f.weight} 32px "${f.family}"`));
        setState({ sig, ready: true, failed: !ok });
      })
      .catch(() => alive && setState({ sig, ready: true, failed: true }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- التوقيع يمثّل faces
  }, [sig]);

  return state.sig === sig ? state : { ready: false, failed: false };
}
