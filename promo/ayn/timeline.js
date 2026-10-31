/*
 * «عين» — فيديو تعريفي (v2). كل إطار دالة نقية في الزمن: render(t) يضبط كل عنصر للثانية t.
 *
 * القصّة بطلها عنصر واحد متّصل: صورة فيها كتابة عربية.
 *   1. سؤال: «رأيت خطاً أعجبك؟ ولا تعرف اسمه؟» — والصورة نفسها تظهر.
 *   2. ارفع: المستخدم يسحب الصورة إلى «عين» (حالة السحب الحقيقية في الموقع).
 *   3. حلّل: الذكاء الاصطناعي يمسح الصورة، يعزل الحروف، يقرأ مخطّطاتها الحقيقية
 *      (مسارات الخط نفسه من fontkit)، ثم يقارنها بخطوط المكتبة واحداً واحداً حتى يطابق «غروب».
 *   4. اكتشف: الصورة نفسها تصير عيّنة البطاقة الأولى في نتائج «عين».
 *   5. الزرّ ← النجمة ← «ارفع. حلّل. اكتشف.» ← شعار حرف.
 * شريط المراحل (نفس شريط أداة «عين») يرافق المشاهد 2–4 فيعرف المشاهد أين هو دائماً.
 *
 * الحركة: منحنيات tokens.css وحدها — دخول out-quint، تنقّل glide، خروج in-soft قصير متداخل،
 * وارتداد خفيف (pop) لتأكيد النجاح فقط. لا اختفاء مفاجئ: كل تبديل تلاشٍ متداخل.
 */
(() => {
  'use strict';

  const CX = 960;
  const CY = 540;
  const DURATION = 27.0;
  const stage = document.getElementById('stage');
  const bgDawn = document.getElementById('bg-dawn');

  /* ── المنحنيات ───────────────────────────────────────────────────────────── */
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
    glide: bezier(0.55, 0, 0.1, 1), // تنقّل الكاميرا والعناصر بين حالتين
    pop: bezier(0.34, 1.4, 0.64, 1), // --ease-pop: تأكيد فقط
    in: bezier(0.4, 0, 1, 1), // --ease-in-soft: كل خروج
    lin: (x) => x,
  };
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const mix = (a, b, k) => a + (b - a) * k;
  const P = (t, a, b, e = E.out) => e(clamp((t - a) / (b - a)));
  /** ظهور ثم اختفاء */
  const span = (t, a, b, c, d) => Math.min(P(t, a, b), 1 - P(t, c, d, E.in));
  /** نقطة على منحنى بيزييه تربيعي — مسارات المؤشّر والنجمة */
  const quad = (p0, p1, p2, k) => [
    (1 - k) * (1 - k) * p0[0] + 2 * (1 - k) * k * p1[0] + k * k * p2[0],
    (1 - k) * (1 - k) * p0[1] + 2 * (1 - k) * k * p1[1] + k * k * p2[1],
  ];

  /* ── عناصر المسرح ───────────────────────────────────────────────────────── */
  function mk(html, cls = 'el', parent = stage) {
    const d = document.createElement('div');
    d.className = cls;
    d.innerHTML = html;
    parent.appendChild(d);
    return d;
  }
  const f2 = (n) => n.toFixed(2);
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

  /* ── أيقونات الموقع والشعار (يحقنها render.mjs من ملفات الموقع) ─────────── */
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
  const LOGO = window.HARF_LOGO || { lockup: '', mark: '' };
  const G = window.GLYPHS || {};

  /* ── نجمة «عين» ─────────────────────────────────────────────────────────── */
  let gid = 0;
  function sparkle(size) {
    const id = `sg${++gid}`;
    return `<svg viewBox="0 0 100 100" style="width:${size}px;height:${size}px;display:block;overflow:visible">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fca0a2"/><stop offset=".55" stop-color="#ec3b3c"/><stop offset="1" stop-color="#d22528"/></linearGradient></defs>
      <path fill="url(#${id})" d="M50 0 C53.5 31 69 46.5 100 50 C69 53.5 53.5 69 50 100 C46.5 69 31 53.5 0 50 C31 46.5 46.5 31 50 0Z"/></svg>`;
  }

  /* ── سطر كلمات حركي (من المرجع) ───────────────────────────────────────────
     «الحضور» 0..1 لكل كلمة: يحجز مكانها أسرع من ظهورها، فيتّسع السطر بنعومة بلا تراكب. */
  class Line {
    constructor(items, size, { gap } = {}) {
      this.gap = gap ?? size * 0.3;
      this.items = items.map((it) => {
        if (it.slotW) return { ...it, width: it.slotW };
        const el = mk(it.t, 'el word');
        Object.assign(el.style, { fontSize: `${size}px`, color: it.c, fontWeight: String(it.w ?? 500) });
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
      const xs = this.xs(
        pres.map((p) => clamp(p * 1.6)),
        cx,
      );
      this.items.forEach((it, i) => {
        if (!it.el) return;
        const a = pres[i];
        set(it.el, {
          x: cx + (xs[i] - cx) * s,
          y: y + dy + (1 - a) * 18,
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
  /** دخول كلمات متتابعة: كل كلمة 0.5ث وبينها 0.18ث */
  const stagger = (t, start, n, step = 0.18, dur = 0.5) =>
    Array.from({ length: n }, (_, i) => P(t, start + i * step, start + i * step + dur));

  /* ── بيانات الخطوط ───────────────────────────────────────────────────────── */
  const FONTS = {
    ghroob: { fam: "'Ghroob Arabic itf'", w: 500, name: 'Ghroob Arabic', ar: 'غروب', by: 'iwantype', paid: true },
    qomra: { fam: "'Qomra Arabic itf'", w: 700, name: 'Qomra Arabic', ar: 'قمرة', by: 'iwantype', paid: true },
    lalezar: { fam: "'Lalezar'", w: 400, name: 'Lalezar', ar: 'لاله‌زار', by: 'Borna Izadpanah' },
    messiri: { fam: "'El Messiri'", w: 600, name: 'El Messiri', ar: 'المسيري', by: 'Mohamed Gaber' },
    reem: { fam: "'Reem Kufi'", w: 600, name: 'Reem Kufi', ar: 'ريم كوفي', by: 'Khaled Hosny' },
    cairo: { fam: "'Cairo'", w: 700, name: 'Cairo', ar: 'القاهرة', by: 'Mohamed Gaber' },
    amiri: { name: 'Amiri', ar: 'أميري' },
    markazi: { name: 'Markazi Text', ar: 'مركزي' },
    changa: { name: 'Changa', ar: 'تشانجا' },
    kufi: { name: 'Noto Kufi Arabic', ar: 'نوتو كوفي' },
    ruqaa: { name: 'Aref Ruqaa', ar: 'عارف رقعة' },
  };
  /** نسب التشابه — نفسها في عدّاد المقارنة وفي بطاقات النتائج */
  const SCORE = {
    ghroob: 95,
    qomra: 60,
    lalezar: 52,
    messiri: 48,
    ruqaa: 46,
    reem: 44,
    cairo: 41,
    changa: 39,
    amiri: 37,
    markazi: 35,
    kufi: 33,
  };
  window.REQUIRED_FONTS = [
    ...[300, 400, 500, 600].map((w) => `${w} 40px "Graphik Arabic"`),
    ...Object.values(FONTS)
      .filter((f) => f.fam)
      .map((f) => `${f.w} 40px ${f.fam.replace(/'/g, '"')}`),
  ];
  const TONE = {
    ok: { label: 'تطابق عالٍ', bar: 'var(--ok-500)', text: 'var(--ok-text)' },
    warn: { label: 'تطابق متوسط', bar: 'var(--warn-500)', text: 'var(--warn-text)' },
    dgr: { label: 'تطابق ضعيف', bar: 'var(--dgr-500)', text: 'var(--dgr-text)' },
  };
  const toneOf = (s) => (s >= 75 ? 'ok' : s >= 50 ? 'warn' : 'dgr');

  /** بطاقة النتيجة — FontCard + ResultCard كما في صفحة «عين» */
  function resultCard(key) {
    const f = FONTS[key];
    const score = SCORE[key];
    const tone = TONE[toneOf(score)];
    const badge = f.paid
      ? `<span class="badge badge-paid">${icon('CrownIcon', { filled: true, size: 13 })}مدفوع</span>`
      : `<span class="badge badge-free">${icon('CheckIcon', { size: 13 })}مجاني</span>`;
    const cta = f.paid
      ? `<span class="qbtn">${icon('CrownIcon', { size: 15 })}اختر الترخيص</span>`
      : `<span class="qbtn">${icon('DownloadIcon', { size: 15 })}تحميل</span>`;
    return mk(`<div class="card rcard" style="box-shadow:var(--shadow-soft)">
        <div class="spec"><span class="w" style="font-family:${f.fam};font-weight:${f.w}">عصري</span>${badge}
          <span style="position:absolute;top:14px;inset-inline-start:14px;width:34px;height:34px;border-radius:999px;background:var(--card);box-shadow:var(--shadow-soft);display:grid;place-items:center;color:var(--muted-foreground)">${icon('HeartIcon', { size: 16 })}</span></div>
        <div class="body">
          <div class="top"><span class="name">${f.name}</span><span class="score">تطابق <b class="ltr">${score}%</b></span></div>
          <div class="meter"><i style="width:${score}%;background:${tone.bar}"></i></div>
          <div class="foot"><span class="tone" style="color:${tone.text}">${tone.label}</span>${cta}</div>
        </div></div>`);
  }

  /** مؤشّر الفأرة + موجة النقر */
  function cursor() {
    const el = mk(
      `<svg width="44" height="44" viewBox="0 0 24 24" style="display:block;filter:drop-shadow(0 6px 10px rgb(22 22 22 / .22))">
        <path d="M4.5 2.8 L4.5 19.2 L8.7 15.3 L11.4 21.3 L14.1 20.1 L11.4 14.2 L17.3 14.2 Z" fill="#fff" stroke="#161616" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
    );
    const ring = mk('');
    Object.assign(ring.style, {
      width: '64px',
      height: '64px',
      borderRadius: '999px',
      border: '2.5px solid var(--primary-fill)',
      boxSizing: 'border-box',
    });
    return { el, ring };
  }
  /** طرف السهم عند (x,y)؛ ضغطة قصيرة وموجة عند النقر */
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

  /* ════════════════════════════════════════════════════════════════════════
     البناء
     ════════════════════════════════════════════════════════════════════════ */
  const RED = 'var(--primary)';
  const RED2 = 'var(--harf-400)';
  const INK = 'var(--foreground)';
  const S = {};
  const IMG_W = 1200;
  const IMG_H = 600;

  /** يحوّل وحدات الخط إلى بكسلات الصورة: الكلمة بعرض 760px في منتصف الصورة */
  function fitWord(bb, target) {
    const [x0, y0, x1, y1] = bb;
    const k = target ? Math.min(target.w / (x1 - x0), target.h / (y1 - y0)) : 760 / (x1 - x0);
    const cy = target ? target.cy : IMG_H / 2 + 6;
    return { k, tx: IMG_W / 2 - (k * (x0 + x1)) / 2, ty: cy - (k * (y0 + y1)) / 2 };
  }

  function buildHero() {
    const g = G.ghroob;
    const fit = fitWord(g.bbox);
    const box = {
      x: fit.tx + fit.k * g.bbox[0],
      y: fit.ty + fit.k * g.bbox[1],
      w: fit.k * (g.bbox[2] - g.bbox[0]),
      h: fit.k * (g.bbox[3] - g.bbox[1]),
    };
    const tf = `translate(${fit.tx} ${fit.ty}) scale(${fit.k})`;
    const paths = g.paths.map((d) => `<path d="${d}"/>`).join('');

    S.hero = mk(`<div class="hero-img">
      <svg class="art" viewBox="0 0 ${IMG_W} ${IMG_H}">
        <defs>
          <radialGradient id="poster" cx="0.82" cy="0.12" r="1.05">
            <stop offset="0" stop-color="#4b1c1d"/><stop offset=".48" stop-color="#1e1717"/><stop offset="1" stop-color="#0f0d0d"/></radialGradient>
          <radialGradient id="warm" cx="0.15" cy="0.95" r="0.6">
            <stop offset="0" stop-color="rgb(236 59 60 / .35)"/><stop offset="1" stop-color="rgb(236 59 60 / 0)"/></radialGradient>
          <linearGradient id="trail" x1="0" x2="1"><stop offset="0" stop-color="rgb(236 59 60 / .22)"/><stop offset="1" stop-color="rgb(236 59 60 / 0)"/></linearGradient>
          <clipPath id="clipDark"><rect class="cd" x="0" y="0" width="${IMG_W}" height="${IMG_H}"/></clipPath>
          <clipPath id="clipLight"><rect class="cl" x="${IMG_W}" y="0" width="0" height="${IMG_H}"/></clipPath>
        </defs>
        <g clip-path="url(#clipDark)">
          <rect width="${IMG_W}" height="${IMG_H}" fill="url(#poster)"/>
          <rect width="${IMG_W}" height="${IMG_H}" fill="url(#warm)"/>
          <circle cx="1040" cy="90" r="160" fill="rgb(255 210 190 / .06)"/>
          <g transform="${tf}" fill="#fff4ec">${paths}</g>
          <text x="${IMG_W / 2}" y="${box.y + box.h + 78}" text-anchor="middle" font-family="Graphik Arabic" font-weight="300" font-size="26" fill="rgb(255 244 236 / .55)" letter-spacing="2">مقهى · بغداد · ٢٠٢٦</text>
        </g>
        <g clip-path="url(#clipLight)">
          <rect width="${IMG_W}" height="${IMG_H}" fill="#f6f6f8"/>
          <g class="metrics"></g>
          <g class="cands"></g>
          <g class="ink" transform="${tf}" fill="#161616">${paths}</g>
        </g>
        <rect class="trail" x="0" y="0" width="170" height="${IMG_H}" fill="url(#trail)" opacity="0"/>
        <rect class="scanline" x="0" y="0" width="3" height="${IMG_H}" fill="#ec3b3c" opacity="0"/>
        <g class="outline" transform="${tf}" fill="none" stroke="#df3033" stroke-width="2.6" stroke-linejoin="round"></g>
        <g class="nodes"></g>
        <rect class="lock" x="${box.x - 34}" y="${box.y - 30}" width="${box.w + 68}" height="${box.h + 60}" rx="26" fill="none" stroke="#df3033" stroke-width="3" opacity="0"/>
      </svg>
      <div class="hud" style="display:none">
        <div class="row"><span class="nm">Cairo</span><span class="pc">0%</span></div>
        <div class="row" style="margin-top:-6px"><span class="ar">القاهرة</span><span class="ar cnt"></span></div>
        <div class="meter"><i></i></div>
      </div>
    </div>`);
    const svg = S.hero.querySelector('svg');
    S.h = {
      cd: svg.querySelector('.cd'),
      cl: svg.querySelector('.cl'),
      trail: svg.querySelector('.trail'),
      scan: svg.querySelector('.scanline'),
      ink: svg.querySelector('.ink'),
      lock: svg.querySelector('.lock'),
      hud: S.hero.querySelector('.hud'),
      hudName: S.hero.querySelector('.hud .nm'),
      hudAr: S.hero.querySelector('.hud .ar'),
      hudPc: S.hero.querySelector('.hud .pc'),
      hudCnt: S.hero.querySelector('.hud .cnt'),
      hudBar: S.hero.querySelector('.hud .meter i'),
    };

    // المخطّط: مسار لكل محرف، يُرسم من اليمين لليسار (ترتيب القراءة)
    const outline = svg.querySelector('.outline');
    S.h.strokes = g.paths
      .map((d) =>
        svgEl(
          'path',
          { d, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1, 'vector-effect': 'non-scaling-stroke' },
          outline,
        ),
      )
      .reverse();

    // النقاط: على المنحنى (بيضاء بحدّ أحمر) وخارجه (نقاط تحكّم صغيرة)
    const nodes = svg.querySelector('.nodes');
    S.h.nodes = g.nodes.map(([ux, uy, on]) => {
      const x = fit.tx + fit.k * ux;
      const y = fit.ty + fit.k * uy;
      const c = on
        ? svgEl(
            'circle',
            { cx: x, cy: y, r: 4.6, fill: '#fff', stroke: '#df3033', 'stroke-width': 2, opacity: 0 },
            nodes,
          )
        : svgEl('circle', { cx: x, cy: y, r: 2.6, fill: '#fca0a2', opacity: 0 }, nodes);
      return { c, x, on };
    });

    // خطوط القياس: أعلى الحروف، خط الأساس، أسفل الحروف
    const metrics = svg.querySelector('.metrics');
    S.h.metrics = [
      [box.y, 'أعلى الحروف', '6 6'],
      [fit.ty, 'خط الأساس', ''],
      [box.y + box.h, 'أسفل الحروف', '6 6'],
    ].map(([y, label, dash]) => {
      const line = svgEl(
        'line',
        { x1: 1150, y1: y, x2: 1150, y2: y, stroke: '#fca0a2', 'stroke-width': 1.6, 'stroke-dasharray': dash },
        metrics,
      );
      const tx = svgEl(
        'text',
        {
          x: 1150,
          y: y - 10,
          'text-anchor': 'start',
          direction: 'rtl',
          'font-family': 'Graphik Arabic',
          'font-size': 17,
          'font-weight': 500,
          fill: '#d42a2c',
          opacity: 0,
        },
        metrics,
      );
      tx.textContent = label;
      return { line, tx };
    });

    // المرشّحون: «عصري» بكل خط، بحجم مخطّط الصورة نفسه ليُقارن به
    const cands = svg.querySelector('.cands');
    S.order = ['cairo', 'amiri', 'reem', 'markazi', 'lalezar', 'changa', 'messiri', 'kufi', 'ruqaa', 'qomra', 'ghroob'];
    S.h.cands = {};
    for (const key of S.order) {
      if (key === 'ghroob') continue;
      const c = G[key];
      const ft = fitWord(c.bbox, { w: box.w * 1.02, h: box.h * 1.05, cy: box.y + box.h / 2 });
      const grp = svgEl(
        'g',
        { transform: `translate(${ft.tx} ${ft.ty}) scale(${ft.k})`, fill: '#161616', opacity: 0 },
        cands,
      );
      c.paths.forEach((d) => svgEl('path', { d }, grp));
      S.h.cands[key] = grp;
    }
    // توقيت المقارنة: يبدأ سريعاً ويتباطأ حتى يستقرّ على «غروب»
    S.slots = S.order.map((_, i) => 9.85 + 2.35 * Math.pow(i / (S.order.length - 1), 1.35));
  }

  function build() {
    /* — 1. السؤال — */
    S.qa = new Line(
      [
        { t: 'رأيت', c: INK },
        { t: 'خطاً', c: RED },
        { t: 'أعجبك؟', c: INK },
      ],
      108,
    );
    S.qb = new Line(
      [
        { t: 'ولا', c: INK },
        { t: 'تعرف', c: INK },
        { t: 'اسمه؟', c: RED },
      ],
      72,
    );

    buildHero();

    /* — 2. ارفع — */
    S.file =
      mk(`<div style="display:flex;align-items:center;gap:8px;height:42px;padding:0 16px;border-radius:999px;background:var(--card);box-shadow:var(--shadow-float);font-size:18px;font-weight:500;color:var(--foreground);white-space:nowrap">
      ${icon('PictureIcon', { size: 19, color: 'var(--primary)' })}<span class="ltr">poster.jpg</span><span style="color:var(--tertiary);font-weight:400" class="ltr">2.4 MB</span></div>`);
    S.drop =
      mk(`<div class="panel" style="width:1180px;height:640px;padding:46px 64px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center">
        <div style="display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 18px;border-radius:999px;background:var(--tint-brand);color:var(--primary);font-size:17px;font-weight:500">${icon('MagicWandIcon', { size: 18 })}عين — مطابقة الخطوط بالذكاء الاصطناعي</div>
        <div class="dz" style="margin-top:30px;width:100%;flex:1;border-radius:24px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;box-sizing:border-box">
          <div class="dzi" style="width:92px;height:92px;border-radius:999px;display:grid;place-items:center;color:var(--primary)">${icon('CloudUploadIcon', { size: 42 })}</div>
          <div style="font-size:34px;font-weight:600;margin-top:10px">ارفع صورة الخط</div>
          <div style="font-size:20px;color:var(--muted-foreground)">أو اسحب الصورة وأفلتها هنا — حتى 10 ميغابايت</div>
          <div style="display:flex;gap:10px;margin-top:14px"><span class="chip ltr">PNG</span><span class="chip ltr">JPG</span><span class="chip ltr">WEBP</span></div>
        </div></div>`);
    S.dz = S.drop.querySelector('.dz');
    S.dzi = S.drop.querySelector('.dzi');
    S.cur1 = cursor();

    /* — شريط المراحل — */
    S.tracker = mk(
      `<div class="tracker">${['ارفع', 'حلّل', 'اكتشف']
        .map(
          (l, i) =>
            `<div class="st"><div class="lb"><span class="num">${'١٢٣'[i]}</span><span class="tx">${l}</span></div><div class="bar"><i></i></div></div>`,
        )
        .join('')}</div>`,
    );
    S.steps = [...S.tracker.querySelectorAll('.st')].map((st) => ({
      num: st.querySelector('.num'),
      tx: st.querySelector('.tx'),
      bar: st.querySelector('.bar i'),
    }));

    /* — 3. حلّل: سطر الحالة تحت الصورة — */
    const status = (html) =>
      mk(
        `<div style="display:flex;align-items:center;gap:12px;font-size:28px;font-weight:500;white-space:nowrap">${html}</div>`,
      );
    S.status = [
      status(`${sparkle(30)}<span>الذكاء الاصطناعي يقرأ الصورة…</span>`),
      status(`${sparkle(30)}<span>يعزل الحروف ويقرأ شكلها</span>`),
      status(`${sparkle(30)}<span>يقارن الحروف بخطوط مكتبة حرف</span>`),
      status(
        `<span style="width:34px;height:34px;border-radius:999px;background:var(--ok-700);color:#fff;display:grid;place-items:center">${icon('CheckIcon', { size: 18 })}</span><span>تعرّفنا على الخط: <b class="ltr" style="font-weight:600">Ghroob Arabic</b></span>`,
      ),
    ];
    const r = rng(11);
    S.burst = Array.from({ length: 7 }, (_, i) => {
      const a = (i / 7) * Math.PI * 2 + r() * 0.5;
      return { el: mk(sparkle(28 + r() * 26)), a, d: 380 + r() * 120, sy: 0.55 + r() * 0.15, delay: r() * 0.12 };
    });

    /* — 4. اكتشف: نتائج «عين» — */
    S.heading = mk(`<div style="width:1340px;display:flex;align-items:flex-end;justify-content:space-between">
        <div><div style="font-size:36px;font-weight:600">أقرب الخطوط</div><div style="font-size:19px;color:var(--muted-foreground);margin-top:6px">أقرب 6 خطوط في مكتبة حرف، مرتّبة حسب التشابه</div></div>
        <span style="display:inline-flex;align-items:center;gap:8px;height:48px;padding:0 20px;border-radius:12px;box-shadow:inset 0 0 0 1.5px var(--border);font-size:18px;font-weight:500">${icon('PictureIcon', { size: 18 })}صورة جديدة</span></div>`);
    S.cardKeys = ['ghroob', 'qomra', 'lalezar', 'messiri', 'reem', 'cairo'];
    S.cards = S.cardKeys.map((k) => resultCard(k));
    // قياسات البطاقة الأولى قبل أي تحويل (العنصر عند 0,0 بلا transform)
    const c1 = S.cards[0];
    const r1 = c1.getBoundingClientRect();
    const btn = c1.querySelector('.qbtn').getBoundingClientRect();
    S.cardH = r1.height;
    S.btnOff = [btn.left + btn.width / 2 - r1.width / 2, btn.top + btn.height / 2 - r1.height / 2];
    S.btnW = btn.width;
    S.qbtn = c1.querySelector('.qbtn');
    // الصورة نفسها تملأ العيّنة: البطاقة فوقها بعيّنة شفّافة، فتبقى الشارة والمفضّلة ظاهرتين
    c1.querySelector('.spec .w').style.visibility = 'hidden';
    c1.querySelector('.spec').style.background = 'transparent';
    c1.firstElementChild.style.background = 'transparent';
    c1.querySelector('.body').style.background = 'var(--card)';
    c1.style.zIndex = '6';
    S.cur2 = cursor();
    S.cta = mk(`<span class="btn">${icon('CrownIcon', { size: 26 })}اختر الترخيص</span>`);
    S.ctaW = S.cta.offsetWidth;

    /* — 5. الملخّص والشعار — */
    S.star = mk(sparkle(100));
    S.trail = [0, 1, 2, 3].map(() => mk(sparkle(100)));
    S.sum = new Line([{ t: 'ارفع.', c: RED }, { t: 'حلّل.', c: RED2 }, { t: 'اكتشف.', c: INK }, { slotW: 64 }], 104);
    S.mark = mk(
      `<div style="color:var(--primary);width:200px;height:200px">${LOGO.mark.replace('<svg', '<svg style="width:200px;height:200px;display:block"')}</div>`,
    );
    S.lockup = mk(
      `<div style="color:var(--primary);width:760px">${LOGO.lockup.replace('<svg', '<svg style="width:760px;height:auto;display:block"')}</div>`,
    );
    S.tagline = mk(
      '<div style="font-size:32px;font-weight:500;white-space:nowrap">عين — <span style="color:var(--primary)">اكتشف أي خط عربي من صورة</span></div>',
    );
    S.url = mk(
      '<div class="ltr" style="font-size:24px;color:var(--tertiary);letter-spacing:.03em">harfarabic.com</div>',
    );

    // ترتيب الطبقات: الصورة البطلة فوق واجهة الرفع والبطاقات التي تمرّ بها، والمؤشّر فوق الجميع
    S.hero.style.zIndex = '5';
    S.file.style.zIndex = '6';
    S.cta.style.zIndex = '6';
    S.tracker.style.zIndex = '8';
    for (const c of [S.cur1, S.cur2]) {
      c.el.style.zIndex = '20';
      c.ring.style.zIndex = '19';
    }
  }

  /* ════════════════════════════════════════════════════════════════════════
     هندسة النتائج: «عالم» الشبكة يُصغَّر حول نقطة — نحسب منه أماكن البطاقات على الشاشة
     ════════════════════════════════════════════════════════════════════════ */
  const SC = 0.82;
  const COLS = [CX + 460, CX, CX - 460];
  const cardWorld = (i) => [COLS[i % 3], 300 + S.cardH / 2 + Math.floor(i / 3) * (S.cardH + 30)];
  const GRID_TOP = 352; // أعلى البطاقات على الشاشة
  const toScreen = ([x, y]) => [CX + (x - CX) * SC, GRID_TOP + (y - 300) * SC];
  const LIFT = (t) => P(t, 15.55, 15.95) * (1 - P(t, 16.75, 17.1, E.in));

  /* ════════════════════════════════════════════════════════════════════════
     الحالة الكاملة للصورة البطلة عبر الزمن
     ════════════════════════════════════════════════════════════════════════ */
  function heroState(t) {
    // 1) السؤال: تصعد من الأسفل إلى المنتصف
    const rise = P(t, 1.55, 2.6, E.glide);
    let x = CX;
    let y = mix(CY + 820, CY + 10, rise);
    let s = 0.5;
    let rz = mix(9, -1.5, rise);
    // 2) ارفع: تنزوي كملف على سطح المكتب، ثم يسحبها المؤشّر
    const aside = P(t, 3.55, 4.25, E.glide);
    x = mix(x, CX - 640, aside);
    y = mix(y, CY + 300, aside);
    s = mix(s, 0.28, aside);
    rz = mix(rz, -6, aside);
    const drag = P(t, 4.95, 5.7, E.glide);
    if (drag > 0) [x, y] = quad([CX - 640, CY + 300], [CX - 380, CY - 60], [CX, CY + 70], drag);
    s = mix(s, 0.4, drag) * (1 - 0.05 * Math.sin(Math.PI * clamp((t - 4.85) / 0.3)));
    // الميلان يتبع السحب: يتأرجح أثناءه ثم يستقيم
    rz = mix(rz, 0, drag) + Math.sin(Math.PI * drag) * 7;
    s = mix(s, 0.46, P(t, 5.75, 6.15, E.pop));
    // 3) حلّل: الكاميرا تقترب حتى تملأ الصورة الشاشة
    const push = P(t, 6.1, 6.95, E.glide);
    x = mix(x, CX, push);
    y = mix(y, CY + 25, push);
    s = mix(s, 1, push);
    // 4) اكتشف: تنكمش إلى عيّنة البطاقة الأولى
    const land = P(t, 13.35, 14.4, E.glide);
    const [wx, wy] = cardWorld(0);
    const lift = LIFT(t);
    const [sx, sy] = toScreen([wx, wy - S.cardH / 2 + 105 - lift * 12]);
    x = mix(x, sx, land);
    y = mix(y, sy, land);
    s = mix(s, ((420 * SC) / IMG_W) * (1 + lift * 0.035), land);
    const out = P(t, 16.75, 17.15, E.in);
    return { x, y, s, rz, op: P(t, 1.55, 1.9) * (1 - out), blur: out * 10, land };
  }

  /* ════════════════════════════════════════════════════════════════════════
     المشاهد
     ════════════════════════════════════════════════════════════════════════ */

  /** 1) السؤال */
  function sceneQuestion(t) {
    if (t > 4.1) {
      S.qa.hide();
      S.qb.hide();
      return;
    }
    const up = P(t, 1.5, 2.45, E.glide);
    const out = P(t, 3.5, 3.85, E.in);
    S.qa.render(stagger(t, 0.2, 3), {
      y: mix(CY, 170, up),
      s: mix(1, 0.62, up),
      op: 1 - out,
      blur: out * 12,
      dy: -out * 24,
    });
    S.qb.render(stagger(t, 2.45, 3, 0.16), { y: 905, op: 1 - out, blur: out * 12, dy: out * 24 });
  }

  /** الصورة البطلة + طبقات التحليل */
  function sceneHero(t) {
    if (t < 1.5 || t > 17.3) return hide(S.hero);
    const h = heroState(t);
    // زوايا الصورة: 28 ← زوايا العيّنة العلوية (22 من البطاقة) وسفلية مربّعة
    const top = mix(28, (22 * SC) / h.s, h.land);
    const bot = mix(28, 0, h.land);
    S.hero.style.borderRadius = `${f2(top)}px ${f2(top)}px ${f2(bot)}px ${f2(bot)}px`;
    S.hero.style.boxShadow = `0 ${f2(mix(30, 0, h.land))}px ${f2(mix(70, 0, h.land))}px rgb(22 22 22 / ${f2(mix(0.22, 0, h.land))})`;
    set(S.hero, { x: h.x, y: h.y, s: h.s, rz: h.rz, op: h.op, blur: h.blur });

    // المسح من اليمين لليسار: ما خلف الخطّ صار حروفاً معزولة على أرضية فاتحة
    const scan = P(t, 7.0, 8.25, E.glide);
    const sx = IMG_W * (1 - scan);
    S.h.cd.setAttribute('width', f2(sx));
    S.h.cl.setAttribute('x', f2(sx));
    S.h.cl.setAttribute('width', f2(IMG_W - sx));
    const scanVis = span(t, 6.95, 7.1, 8.15, 8.4);
    S.h.scan.setAttribute('x', f2(sx - 1.5));
    S.h.scan.setAttribute('opacity', f2(scanVis));
    S.h.trail.setAttribute('x', f2(sx));
    S.h.trail.setAttribute('opacity', f2(scanVis));

    // قراءة الشكل: خطوط القياس ← تتبّع المخطّط ← النقاط
    const metricOut = P(t, 12.3, 12.7, E.in);
    S.h.metrics.forEach((m, i) => {
      const k = P(t, 8.25 + i * 0.1, 9.0 + i * 0.1, E.glide);
      m.line.setAttribute('x1', f2(1150 - 1100 * k));
      m.line.setAttribute('opacity', f2(1 - metricOut));
      m.tx.setAttribute('opacity', f2(P(t, 8.5 + i * 0.1, 8.9 + i * 0.1) * (1 - metricOut)));
    });
    const traceOut = P(t, 12.45, 12.95, E.in);
    S.h.strokes.forEach((p, i) => {
      const k = P(t, 8.45 + i * 0.16, 9.25 + i * 0.16, E.glide);
      p.setAttribute('stroke-dashoffset', f2(1 - k));
      p.setAttribute('opacity', f2(1 - traceOut));
    });
    // النقاط تظهر مع مرور التتبّع (من اليمين لليسار)
    const front = mix(IMG_W + 60, -60, P(t, 8.6, 9.75, E.glide));
    const nodeOut = P(t, 12.2, 12.55, E.in);
    S.h.nodes.forEach((n) => {
      const k = clamp((n.x - front) / 90);
      n.c.setAttribute('opacity', f2(E.out(k) * (n.on ? 1 : 0.8) * (1 - nodeOut)));
      n.c.setAttribute('r', f2((n.on ? 4.6 : 2.6) * (0.4 + 0.6 * E.pop(k))));
    });
    // الحبر يخفت ليصير المخطّط «بصمة» تُقارن بها الخطوط، ثم يعود عند التطابق
    const lockT = S.slots[S.slots.length - 1];
    const ghost = P(t, 9.1, 9.7) * (1 - P(t, lockT, lockT + 0.35));
    S.h.ink.setAttribute('opacity', f2(1 - ghost * 0.9));

    // المقارنة: كل خط مرشّح يظهر تحت البصمة، بتبديل متداخل قصير
    const idx = S.slots.findIndex((s, i) => t >= s && (i === S.slots.length - 1 || t < S.slots[i + 1]));
    S.order.forEach((key, i) => {
      if (key === 'ghroob') return;
      const a = S.slots[i];
      const b = S.slots[i + 1];
      const vis =
        t >= a - 0.04 && t < b + 0.04 ? Math.min(clamp((t - (a - 0.04)) / 0.08), clamp((b + 0.04 - t) / 0.08)) : 0;
      S.h.cands[key].setAttribute('opacity', f2(vis * 0.82));
    });
    const hudIn = P(t, 9.7, 10.05);
    const hudOut = P(t, 13.15, 13.4, E.in);
    if (hudIn > 0 && hudOut < 1) {
      const i = Math.max(0, idx);
      const key = S.order[i];
      const f = FONTS[key];
      const a = S.slots[i];
      const b = i < S.slots.length - 1 ? S.slots[i + 1] : a + 0.8;
      const score = Math.round(SCORE[key] * E.out(clamp((t - a) / Math.max(0.12, (b - a) * 0.7))));
      S.h.hudName.textContent = f.name;
      S.h.hudAr.textContent = f.ar;
      S.h.hudPc.textContent = `${score}%`;
      S.h.hudPc.style.color = key === 'ghroob' && score > 75 ? 'var(--ok-text)' : 'var(--foreground)';
      S.h.hudBar.style.width = `${score}%`;
      S.h.hudBar.style.background = TONE[toneOf(score)].bar;
      S.h.hudCnt.textContent = `${Math.min(24, Math.round(((i + 1) / S.order.length) * 24))} من 24`;
      const pulse = key === 'ghroob' ? Math.sin(Math.PI * clamp((t - lockT) / 0.45)) * 0.06 : 0;
      S.h.hud.style.display = '';
      S.h.hud.style.opacity = f2(hudIn * (1 - hudOut));
      S.h.hud.style.transform = `translateY(${f2((1 - hudIn) * -14)}px) scale(${f2(1 + pulse)})`;
      S.h.hud.style.boxShadow =
        key === 'ghroob'
          ? `0 0 0 ${f2(2 * P(t, lockT, lockT + 0.3))}px var(--ok-500), var(--shadow-float)`
          : 'var(--shadow-float)';
    } else S.h.hud.style.display = 'none';

    // لحظة التطابق: إطار يتّسع ويذوب
    const lk = clamp((t - lockT) / 0.7);
    S.h.lock.setAttribute('opacity', f2(lk > 0 && lk < 1 ? (1 - lk) * 0.9 : 0));
    const ls = 1 + E.out(lk) * 0.06;
    S.h.lock.setAttribute(
      'transform',
      `translate(${IMG_W / 2} ${IMG_H / 2 + 6}) scale(${ls}) translate(${-IMG_W / 2} ${-IMG_H / 2 - 6})`,
    );
  }

  /** 2) ارفع: واجهة الرفع، المؤشّر، الملف */
  function sceneUpload(t) {
    if (t < 3.6 || t > 7.0) {
      hide(S.drop, S.file, S.cur1.el, S.cur1.ring);
      return;
    }
    const a = P(t, 3.75, 4.5);
    const over = P(t, 5.2, 5.5) * (1 - P(t, 5.85, 6.05));
    const out = P(t, 6.0, 6.55, E.in);
    // حالة السحب في الموقع: إطار متقطّع أحمر، أرضية بلون العلامة، الأيقونة ترتفع وتكبر
    S.dz.style.border =
      over > 0.02 ? `1.5px dashed rgb(212 42 44 / ${f2(0.25 + 0.75 * over)})` : '1.5px solid var(--border)';
    S.dz.style.background = over > 0.02 ? `rgb(255 240 240 / ${f2(0.4 + 0.6 * over)})` : 'rgb(246 246 248 / .5)';
    S.dzi.style.transform = `translateY(${f2(-6 * over)}px) scale(${f2(1 + 0.12 * over)})`;
    S.dzi.style.background = over > 0.5 ? 'var(--card)' : 'var(--tint-brand)';
    S.dz.style.opacity = f2(1 - P(t, 5.8, 6.1, E.in));
    set(S.drop, {
      y: CY + 55 + (1 - a) * 40,
      s: mix(0.94, 1, a) * (1 + out * 0.05),
      op: a * (1 - out),
      blur: (1 - a) * 10 + out * 8,
    });

    // المؤشّر: يأتي إلى الصورة، يمسكها، يسحبها، يفلتها
    const reach = P(t, 4.3, 4.9, E.glide);
    let pos = quad([CX - 300, CY + 600], [CX - 380, CY + 420], [CX - 610, CY + 315], reach);
    const drag = P(t, 4.95, 5.7, E.glide);
    if (drag > 0) pos = quad([CX - 610, CY + 315], [CX - 350, CY - 45], [CX + 30, CY + 85], drag);
    const leave = P(t, 5.95, 6.4, E.glide);
    pos = [pos[0] + leave * 120, pos[1] + leave * 260];
    drawCursor(S.cur1, t, {
      pos,
      vis: P(t, 4.25, 4.45) * (1 - P(t, 6.0, 6.3, E.in)),
      click: t < 5.5 ? 4.88 : 5.72,
    });

    // اسم الملف يرافق الصورة أثناء السحب
    const h = heroState(t);
    const fa = P(t, 4.0, 4.35) * (1 - P(t, 5.7, 5.95, E.in));
    set(S.file, { x: h.x, y: h.y + (IMG_H * h.s) / 2 + 38, s: 0.9 + 0.1 * fa, op: fa });
  }

  /** شريط المراحل */
  function sceneTracker(t) {
    const vis = P(t, 3.9, 4.45) * (1 - P(t, 16.7, 17.05, E.in));
    if (vis <= 0) return hide(S.tracker);
    set(S.tracker, { y: 98 + (1 - vis) * -16, op: vis, blur: (1 - vis) * 6 });
    // امتلاء كل مرحلة 0..1، ومتى تُنجَز
    const prog = [P(t, 4.2, 5.85, E.glide), P(t, 6.4, 12.25, E.lin), P(t, 13.4, 14.6, E.glide)];
    const done = [t >= 5.9, t >= 12.3, t >= 14.65];
    S.steps.forEach((st, i) => {
      const current = prog[i] > 0 && !done[i];
      st.bar.style.transform = `scaleX(${f2(prog[i])})`;
      st.bar.style.background = done[i] ? 'rgb(22 22 22 / .7)' : 'var(--primary-fill)';
      st.tx.style.color = current || done[i] ? 'var(--foreground)' : 'var(--tertiary)';
      st.tx.style.fontWeight = current ? '600' : '400';
      st.num.innerHTML = done[i] ? icon('CheckIcon', { size: 16 }) : '١٢٣'[i];
      st.num.style.background = done[i] ? 'var(--ok-700)' : current ? 'var(--primary-fill)' : 'transparent';
      st.num.style.color = done[i] || current ? '#fff' : 'var(--tertiary)';
      st.num.style.boxShadow = done[i] || current ? 'none' : 'inset 0 0 0 1.5px var(--strong)';
    });
  }

  /** 3) حلّل: سطر الحالة + نجوم التطابق + لحظة التدرّج */
  function sceneAnalyze(t) {
    const windows = [
      [6.75, 7.1, 7.95, 8.15],
      [8.1, 8.4, 9.5, 9.7],
      [9.65, 9.95, 12.1, 12.3],
      [12.3, 12.65, 13.1, 13.35],
    ];
    S.status.forEach((el, i) => {
      const [a, b, c, d] = windows[i];
      if (t < a || t > d) return hide(el);
      const k = P(t, a, b);
      const o = P(t, c, d, E.in);
      set(el, { y: 902 + (1 - k) * 16 - o * 10, op: k * (1 - o), blur: (1 - k) * 8 + o * 8 });
    });
    const lockT = S.slots[S.slots.length - 1];
    S.burst.forEach((b) => {
      const k = clamp((t - lockT - b.delay) / 0.75);
      if (k <= 0 || k >= 1) return hide(b.el);
      const r = E.out(k) * b.d;
      set(b.el, {
        x: CX + Math.cos(b.a) * r,
        y: CY + 30 + Math.sin(b.a) * r * b.sy,
        s: Math.sin(Math.PI * k),
        rz: k * 120,
        op: 1 - k * k,
      });
    });
    bgDawn.style.opacity = f2(span(t, lockT - 0.05, lockT + 0.4, 13.0, 13.7) * 0.9);
  }

  /** 4) اكتشف: النتائج، التمرير، النقر */
  function sceneResults(t) {
    if (t < 13.6 || t > 17.4) {
      hide(S.heading, ...S.cards, S.cur2.el, S.cur2.ring);
      return;
    }
    const out = P(t, 16.75, 17.15, E.in);
    const hk = P(t, 13.8, 14.35);
    set(S.heading, { y: GRID_TOP - 74 + (1 - hk) * 18, s: SC, op: hk * (1 - out), blur: (1 - hk) * 8 + out * 8 });
    const lift = LIFT(t);
    S.cards.forEach((c, i) => {
      const [wx, wy] = cardWorld(i);
      const [x, y] = toScreen([wx, wy - (i === 0 ? lift * 12 : 0)]);
      if (i === 0) {
        // إطار البطاقة يظهر حول الصورة وهي تستقرّ فيها، ويرتفع عند المرور
        c.firstElementChild.style.boxShadow = `0 ${f2(2 + lift * 16)}px ${f2(10 + lift * 30)}px rgb(22 22 22 / ${f2(0.05 + lift * 0.07)})`;
        c.firstElementChild.style.borderColor = lift > 0.5 ? 'var(--strong)' : 'var(--border)';
        c.querySelector('.meter i').style.transform = `scaleX(${f2(P(t, 14.3, 14.9))})`;
        set(c, { x, y, s: SC, op: P(t, 14.05, 14.4) * (1 - out), blur: out * 10 });
        return;
      }
      const a = 13.85 + i * 0.075;
      const k = P(t, a, a + 0.6);
      c.querySelector('.meter i').style.transform = `scaleX(${f2(P(t, a + 0.3, a + 0.9))})`;
      set(c, { x, y: y + (1 - k) * 44, s: SC, op: k * (1 - out) * (1 - lift * 0.25), blur: (1 - k) * 8 + out * 10 });
    });

    // المؤشّر: إلى البطاقة الأولى (ترتفع) ثم إلى «اختر الترخيص»
    const [wx, wy] = cardWorld(0);
    const [bx, by] = toScreen([wx + S.btnOff[0], wy + S.btnOff[1] - lift * 12]);
    const reach = P(t, 14.9, 15.6, E.glide);
    let pos = quad([CX - 120, CY + 620], [CX + 180, CY + 360], [CX + 420, CY - 20], reach);
    const toBtn = P(t, 15.85, 16.4, E.glide);
    if (toBtn > 0) pos = quad([CX + 420, CY - 20], [CX + 420, by - 30], [bx + 8, by + 4], toBtn);
    drawCursor(S.cur2, t, { pos, vis: P(t, 14.85, 15.05) * (1 - P(t, 16.65, 16.85, E.in)), click: 16.48 });
    // QUIET_CTA: يمتلئ عند المرور
    const hov = P(t, 16.25, 16.4) > 0.5;
    S.qbtn.style.background = hov ? 'var(--primary-fill)' : 'var(--card)';
    S.qbtn.style.color = hov ? '#fff' : 'var(--primary)';
    S.qbtn.style.boxShadow = hov ? 'none' : 'inset 0 0 0 1px rgb(212 42 44 / .35)';
    S.qbtn.style.visibility = t >= 16.56 ? 'hidden' : 'visible';
  }

  /** 5) الزرّ ← النجمة ← الملخّص ← الشعار */
  function starPath(t) {
    const k = P(t, 18.3, 19.0, E.glide);
    return quad([CX, CY], [CX + 520, CY + 330], [S.sumEnd ?? CX - 420, CY], k);
  }
  function sceneFinale(t) {
    // الزرّ يخرج من البطاقة إلى المنتصف ويكبر
    if (t >= 16.5 && t < 18.0) {
      const [wx, wy] = cardWorld(0);
      const [bx, by] = toScreen([wx + S.btnOff[0], wy + S.btnOff[1] - 12]);
      const k = P(t, 16.55, 17.3, E.glide);
      const glow = P(t, 17.25, 17.65);
      const burst = P(t, 17.72, 17.9, E.in);
      const s0 = (S.btnW * SC) / S.ctaW;
      S.cta.firstElementChild.style.background = `linear-gradient(135deg, var(--harf-400), var(--primary-fill) ${f2(mix(100, 55, glow))}%)`;
      S.cta.firstElementChild.style.boxShadow = `0 ${f2(8 + glow * 18)}px ${f2(20 + glow * 40)}px rgb(223 48 51 / ${f2(0.18 + glow * 0.2)})`;
      set(S.cta, {
        x: mix(bx, CX, k),
        y: mix(by, CY, k),
        s: mix(s0, 1.25, k) * (1 + glow * 0.04) * (1 - burst * 0.5),
        op: P(t, 16.5, 16.6) * (1 - burst),
        blur: burst * 8,
      });
    } else hide(S.cta);

    // النجمة: تنفجر من الزرّ، تطير، وتلحق بنهاية الملخّص
    const sumPres = stagger(t, 18.8, 3, 0.32, 0.55).concat([1]);
    if (t >= 17.7 && t < 21.95) {
      const xs = S.sum.xs(sumPres.map((p) => clamp(p * 1.6)));
      S.sumEnd = xs[3];
      const big = P(t, 17.72, 18.05, E.pop);
      const shrink = P(t, 18.05, 18.45, E.glide);
      const size = mix(mix(60, 520, big), 70, shrink);
      let [x, y] = starPath(t);
      x = mix(x, xs[3], P(t, 18.9, 19.1));
      const center = P(t, 21.1, 21.6, E.glide);
      x = mix(x, CX, center);
      y = mix(y, CY, center);
      const toMark = P(t, 21.55, 21.85, E.in);
      set(S.star, {
        x,
        y,
        s: (size * mix(1, 2.85, center)) / 100,
        rz: t * 60 + big * 90,
        op: 1 - toMark,
        blur: toMark * 6,
      });
      S.trail.forEach((el, i) => {
        const dt = (i + 1) * 0.05;
        const [tx, ty] = starPath(t - dt);
        const v = span(t, 18.3, 18.45, 18.85, 19.05) * (1 - i / 4) * 0.35;
        set(el, { x: tx, y: ty, s: (70 * (1 - i * 0.15)) / 100, rz: (t - dt) * 60, op: v, blur: 1 + i * 1.5 });
      });
    } else hide(S.star, ...S.trail);

    if (t >= 18.7 && t < 21.5) {
      const out = P(t, 20.95, 21.25, E.in);
      S.sum.render(sumPres, { op: 1 - out, blur: out * 14, dy: -out * 16 });
    } else S.sum.hide();

    // الشعار: الرمز ← ينزلق إلى مكانه ← تنكشف الكلمات من خلفه
    if (t < 21.4) return hide(S.mark, S.lockup, S.tagline, S.url);
    const m = P(t, 21.5, 21.95, E.pop);
    const move = P(t, 22.05, 22.6, E.glide);
    const wipe = P(t, 22.55, 23.25, E.glide);
    const W = 760;
    const markCx = ((1127.53 + 275.63) / 1678.79) * W - W / 2;
    const markScale = ((551.26 / 1678.79) * W) / 200;
    const LY = CY - 50;
    const handoff = t >= 22.58;
    set(S.mark, {
      x: mix(CX, CX + markCx, move),
      y: mix(CY, LY, move),
      s: mix(0.55, 1, m) * mix(1, markScale, move),
      op: handoff ? 0 : m,
    });
    S.lockup.style.clipPath = `inset(-2% -2% -2% ${f2(mix(67, -2, wipe))}%)`;
    set(S.lockup, { x: CX, y: LY, op: handoff ? 1 : 0 });
    const tg = P(t, 23.15, 23.7);
    set(S.tagline, { y: LY + 200 + (1 - tg) * 14, op: tg, blur: (1 - tg) * 8 });
    const u = P(t, 23.45, 24.0);
    set(S.url, { y: LY + 262 + (1 - u) * 12, op: u, blur: (1 - u) * 6 });
  }

  /* ════════════════════════════════════════════════════════════════════════ */
  let built = false;
  window.init = () => {
    if (built) return;
    build();
    built = true;
    window.render(0);
  };
  window.DURATION = DURATION;
  window.render = (t) => {
    if (!built) window.init();
    sceneQuestion(t);
    sceneUpload(t);
    sceneHero(t);
    sceneTracker(t);
    sceneAnalyze(t);
    sceneResults(t);
    sceneFinale(t);
  };
})();
