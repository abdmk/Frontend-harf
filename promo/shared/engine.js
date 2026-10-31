/*
 * محرّك الحركة المشترك لفيديوهات العرض: كل إطار دالة نقية في الزمن، فلا مؤقّتات ولا CSS animations.
 * يوفّر: المنحنيات (من tokens.css)، وضع العناصر بمراكزها، الأسطر الحركية، الأيقونات والشعار
 * (يحقنها render.mjs من ملفات الموقع)، والتنسيقين العرضي والطولي.
 */
(() => {
  'use strict';

  /* ── التنسيق: عرضي 16:9 أو طولي 9:16 (‎?format=vertical) ── */
  const VERTICAL = new URLSearchParams(location.search).get('format') === 'vertical';
  const SW = VERTICAL ? 1080 : 1920;
  const SH = VERTICAL ? 1920 : 1080;
  const CX = SW / 2;
  const CY = SH / 2;
  const stage = document.getElementById('stage');
  for (const el of [document.body, stage]) {
    el.style.width = `${SW}px`;
    el.style.height = `${SH}px`;
  }

  /* ── المنحنيات ── */
  function bezier(x1, y1, x2, y2) {
    const bx = (u) => 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
    const by = (u) => 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
    return (t) => {
      if (t <= 0) return 0;
      if (t >= 1) return 1;
      let lo = 0;
      let hi = 1;
      for (let i = 0; i < 30; i++) {
        const mid = (lo + hi) / 2;
        if (bx(mid) < t) lo = mid;
        else hi = mid;
      }
      return by((lo + hi) / 2);
    };
  }
  const E = {
    out: bezier(0.2, 0, 0, 1), // --ease-out-quint: كل دخول
    move: bezier(0.42, 0, 0.32, 1), // حركة كبيرة: ذروة سرعة منخفضة — لا وميض
    sine: bezier(0.37, 0, 0.63, 1), // تبديلات متماثلة ناعمة
    pop: bezier(0.34, 1.4, 0.64, 1), // --ease-pop: تأكيد فقط
    in: bezier(0.4, 0, 1, 1), // --ease-in-soft: كل خروج
    lin: (x) => x,
  };
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const mix = (a, b, k) => a + (b - a) * k;
  const mixRGB = (a, b, k) => `rgb(${a.map((v, i) => Math.round(mix(v, b[i], clamp(k)))).join(' ')})`;
  const P = (t, a, b, e = E.out) => e(clamp((t - a) / (b - a)));
  const span = (t, a, b, c, d) => Math.min(P(t, a, b), 1 - P(t, c, d, E.in));
  const quad = (p0, p1, p2, k) => [
    (1 - k) * (1 - k) * p0[0] + 2 * (1 - k) * k * p1[0] + k * k * p2[0],
    (1 - k) * (1 - k) * p0[1] + 2 * (1 - k) * k * p1[1] + k * k * p2[1],
  ];
  const f2 = (n) => n.toFixed(2);

  /* ── العناصر ── */
  function mk(html, cls = 'el', parent = stage) {
    const d = document.createElement('div');
    d.className = cls;
    d.innerHTML = html;
    parent.appendChild(d);
    return d;
  }
  /** يضع العنصر بمركزه عند (x,y) — الحركة كلها transform/opacity/filter */
  function set(el, o = {}) {
    const { x = CX, y = CY, s = 1, rz = 0, op = 1, blur = 0 } = o;
    if (op <= 0.002) {
      el.style.display = 'none';
      return;
    }
    el.style.display = '';
    el.style.transform =
      `translate(${f2(x)}px,${f2(y)}px) translate(-50%,-50%)` +
      (rz ? ` rotate(${f2(rz)}deg)` : '') +
      ` scale(${s.toFixed(4)})`;
    el.style.opacity = op >= 0.999 ? '1' : op.toFixed(3);
    el.style.filter = blur > 0.08 ? `blur(${f2(blur)}px)` : 'none';
  }
  const hide = (...els) => els.forEach((e) => (e.style.display = 'none'));
  const svgEl = (tag, attrs = {}, parent) => {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
    if (parent) parent.appendChild(e);
    return e;
  };

  /* ── أيقونات الموقع والشعار ── */
  const kebab = (k) => k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
  function icon(name, { filled = false, size = 24, color = 'currentColor' } = {}) {
    const d = (window.ICONS || {})[name];
    if (!d) return '';
    const kids = (filled && d.filled) || d.outline;
    const body = kids
      .map(
        ([tag, a]) =>
          `<${tag} ${Object.entries(a)
            .map(([k, v]) => `${kebab(k)}="${v}"`)
            .join(' ')}/>`,
      )
      .join('');
    return `<svg class="icon" viewBox="${d.vb}" style="width:${size}px;height:${size}px;color:${color}">${body}</svg>`;
  }
  let gid = 0;
  /** نجمة «عين» بتدرّج حرف */
  function sparkle(size) {
    const id = `sg${++gid}`;
    return `<svg viewBox="0 0 100 100" style="width:${size}px;height:${size}px;display:block;overflow:visible">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fca0a2"/><stop offset=".55" stop-color="#ec3b3c"/><stop offset="1" stop-color="#d22528"/></linearGradient></defs>
      <path fill="url(#${id})" d="M50 0 C53.5 31 69 46.5 100 50 C69 53.5 53.5 69 50 100 C46.5 69 31 53.5 0 50 C31 46.5 46.5 31 50 0Z"/></svg>`;
  }

  /* ── سطر كلمات حركي: الظهور (pres) والمكان (pres.lay) منفصلان، فلا يقفز السطر ── */
  class Line {
    constructor(items, size, { gap } = {}) {
      this.gap = gap ?? size * 0.3;
      this.items = items.map((it) => {
        if (it.slotW) return { ...it, width: it.slotW };
        const el = mk(it.t, 'el word');
        Object.assign(el.style, {
          fontSize: `${size}px`,
          color: it.c,
          fontWeight: String(it.w ?? 500),
          ...(it.font ? { fontFamily: it.font } : {}),
        });
        return { ...it, el, width: el.offsetWidth };
      });
    }
    xs(pres, cx = CX) {
      const sw = this.items.map((it, i) => it.width * pres[i]);
      const total = sw.reduce((a, b) => a + b, 0) + pres.slice(1).reduce((a, p) => a + this.gap * p, 0);
      let x = cx + total / 2;
      return sw.map((w, i) => {
        if (i > 0) x -= this.gap * pres[i];
        const c = x - w / 2;
        x -= w;
        return c;
      });
    }
    render(pres, { cx = CX, y = CY, op = 1, blur = 0, s = 1, dy = 0 } = {}) {
      const xs = this.xs(pres.lay ?? pres, cx);
      this.items.forEach((it, i) => {
        if (!it.el) return;
        const a = pres[i];
        set(it.el, {
          x: cx + (xs[i] - cx) * s,
          y: y + dy + (1 - a) * 18 * s,
          s: s * (1 + (1 - a) * 0.12),
          op: a * op,
          blur: (1 - a) * 14 + blur,
        });
      });
      return xs.map((x) => cx + (x - cx) * s);
    }
    hide() {
      this.items.forEach((it) => it.el && hide(it.el));
    }
  }
  /** دخول كلمات متتابعة؛ ‎.lay يفسح المكان قبل الظهور بقليل */
  function stagger(t, start, n, step = 0.18, dur = 0.5) {
    const pres = Array.from({ length: n }, (_, i) => P(t, start + i * step, start + i * step + dur));
    pres.lay = Array.from({ length: n }, (_, i) => P(t, start + i * step - 0.3, start + i * step + 0.15, E.sine));
    return pres;
  }

  /** مؤشّر الفأرة + موجة النقر */
  function cursor({ dark = false } = {}) {
    const el = mk(
      `<svg width="44" height="44" viewBox="0 0 24 24" style="display:block;filter:drop-shadow(0 6px 10px rgb(0 0 0 / ${dark ? 0.5 : 0.22}))">
        <path d="M4.5 2.8 L4.5 19.2 L8.7 15.3 L11.4 21.3 L14.1 20.1 L11.4 14.2 L17.3 14.2 Z" fill="#fff" stroke="#161616" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
    );
    const ring = mk('');
    Object.assign(ring.style, {
      width: '64px',
      height: '64px',
      borderRadius: '999px',
      border: '2.5px solid #df3033',
      boxSizing: 'border-box',
    });
    el.style.zIndex = '20';
    ring.style.zIndex = '19';
    return { el, ring };
  }
  function drawCursor(c, t, { pos, vis, click }) {
    const press = click != null ? 1 - 0.14 * Math.sin(Math.PI * clamp((t - click) / 0.24)) : 1;
    set(c.el, { x: pos[0] + 14, y: pos[1] + 16, s: press, op: vis });
    const r = click != null ? clamp((t - click) / 0.5) : 0;
    if (r > 0 && r < 1) set(c.ring, { x: pos[0], y: pos[1], s: 0.3 + E.out(r) * 1.1, op: (1 - r) * 0.7 * vis });
    else hide(c.ring);
  }

  function rng(seed) {
    let t = seed >>> 0;
    return () => {
      t = (t + 0x6d2b79f5) >>> 0;
      let x = Math.imul(t ^ (t >>> 15), 1 | t);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** يحوّل وحدات الخط (إطار bb) إلى بكسلات: الكلمة بعرض w حول المركز (cx,cy) */
  function fit(bb, { w, h = Infinity, cx = 0, cy = 0 }) {
    const [x0, y0, x1, y1] = bb;
    const k = Math.min(w / (x1 - x0), h / (y1 - y0));
    return { k, tx: cx - (k * (x0 + x1)) / 2, ty: cy - (k * (y0 + y1)) / 2 };
  }

  window.Engine = {
    VERTICAL,
    SW,
    SH,
    CX,
    CY,
    stage,
    bezier,
    E,
    clamp,
    mix,
    mixRGB,
    P,
    span,
    quad,
    f2,
    mk,
    set,
    hide,
    svgEl,
    icon,
    sparkle,
    Line,
    stagger,
    cursor,
    drawCursor,
    rng,
    fit,
    LOGO: window.HARF_LOGO || { lockup: '', mark: '' },
    GLYPHS: window.GLYPHS || {},
  };
})();
