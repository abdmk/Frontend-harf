/*
 * «عين» — فيديو تعريفي. كل إطار دالة نقية في الزمن: render(t) يضبط كل عنصر للثانية t
 * (بلا CSS animations ولا مؤقّتات)، فيخرج الإطار نفسه في كل مرّة. render.mjs يلتقط الإطارات.
 *
 * الاتجاه البصري: مرجع «LangEase» (كلمات تظهر من الضبابية، عنصر بين الكلمات، نفق واجهات،
 * شريط تقدّم ← «تم» + قصاصات، بطاقات تنزلق ثم تُعزل، زرّ ينفجر نجمةً، ملخّص بثلاث كلمات، الشعار).
 * اللغة البصرية: هوية حرف (tokens.css، Graphik Arabic، خطوط المكتبة الحقيقية، مكوّنات الموقع).
 */
(() => {
  'use strict';

  const CX = 960;
  const CY = 540;
  const DURATION = 32.6;
  const stage = document.getElementById('stage');
  const bgDawn = document.getElementById('bg-dawn');

  /* ── الحركة: منحنيات رموز التصميم (tokens.css) ───────────────────────────── */
  function bezier(x1, y1, x2, y2) {
    const cx = (u) => 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
    const cy = (u) => 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
    return (t) => {
      if (t <= 0) return 0;
      if (t >= 1) return 1;
      let lo = 0;
      let hi = 1;
      for (let i = 0; i < 28; i++) {
        const mid = (lo + hi) / 2;
        if (cx(mid) < t) lo = mid;
        else hi = mid;
      }
      return cy((lo + hi) / 2);
    };
  }
  const E = {
    quint: bezier(0.2, 0, 0, 1), // --ease-out-quint
    pop: bezier(0.34, 1.4, 0.64, 1), // --ease-pop
    io: bezier(0.65, 0, 0.35, 1), // --ease-in-out-strong
    menu: bezier(0.16, 1, 0.3, 1), // --ease-menu
    in: bezier(0.4, 0, 1, 1), // --ease-in-soft
    lin: (x) => x,
  };
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const mix = (a, b, k) => a + (b - a) * k;
  /** تقدّم مقطع [a,b] بمنحنى */
  const P = (t, a, b, e = E.quint) => e(clamp((t - a) / (b - a)));
  /** دخول ثم خروج: 0→1 في [a,b] ثم 1→0 في [c,d] */
  const inOut = (t, a, b, c, d, ei = E.quint, eo = E.in) => Math.min(P(t, a, b, ei), 1 - P(t, c, d, eo));

  /* ── عناصر المسرح ───────────────────────────────────────────────────────── */
  function mk(html, cls = 'el', parent = stage) {
    const d = document.createElement('div');
    d.className = cls;
    d.innerHTML = html;
    parent.appendChild(d);
    return d;
  }
  /** يضع العنصر بمركزه عند (x,y) — كل الحركة transform/opacity/filter */
  function set(el, o = {}) {
    const { x = CX, y = CY, z = 0, s = 1, sx = 1, sy = 1, rx = 0, ry = 0, rz = 0, op = 1, blur = 0, center = true } = o;
    if (op <= 0.003) {
      el.style.display = 'none';
      return;
    }
    el.style.display = '';
    el.style.transform =
      `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px)` +
      (center ? ' translate(-50%,-50%)' : '') +
      (rx ? ` rotateX(${rx.toFixed(3)}deg)` : '') +
      (ry ? ` rotateY(${ry.toFixed(3)}deg)` : '') +
      (rz ? ` rotateZ(${rz.toFixed(3)}deg)` : '') +
      ` scale(${(s * sx).toFixed(4)},${(s * sy).toFixed(4)})`;
    el.style.opacity = String(clamp(op));
    el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
  }
  const hide = (...els) => els.forEach((e) => (e.style.display = 'none'));

  /** مجموعة ثلاثية الأبعاد بمنظور — أطفالها يُحرَّكون حول مركزها */
  function group3d(perspective = 1400) {
    const g = mk('', 'el');
    Object.assign(g.style, {
      width: '0px',
      height: '0px',
      perspective: `${perspective}px`,
      transformStyle: 'preserve-3d',
    });
    const inner = document.createElement('div');
    Object.assign(inner.style, { position: 'absolute', left: '0', top: '0', transformStyle: 'preserve-3d' });
    g.appendChild(inner);
    return { g, inner };
  }

  /* ── أيقونات الموقع (تُقرأ من icons.generated.ts عبر render.mjs) ──────────── */
  const kebab = (k) => k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
  function icon(name, { filled = false, size = 24, color = 'currentColor' } = {}) {
    const d = (window.ICONS || {})[name];
    if (!d) return '';
    const kids = (filled && d.filled) || d.outline;
    const body = kids
      .map(
        ([tag, attrs]) =>
          `<${tag} ${Object.entries(attrs)
            .map(([k, v]) => `${kebab(k)}="${v}"`)
            .join(' ')}/>`,
      )
      .join('');
    return `<svg class="icon" viewBox="${d.vb}" style="width:${size}px;height:${size}px;color:${color}">${body}</svg>`;
  }

  /* ── الشعار: من src/components/shared/harf-logo.tsx ─────────────────────── */
  const LOGO = window.HARF_LOGO || { lockup: '', mark: '' };

  /* ── نجمة «عين» — رمز الذكاء الاصطناعي، بتدرّج هوية حرف ─────────────────── */
  let gradSeq = 0;
  function sparkle(size, { from = '#fca0a2', mid = '#ec3b3c', to = '#d22528' } = {}) {
    const id = `sg${++gradSeq}`;
    return `<svg viewBox="0 0 100 100" style="width:${size}px;height:${size}px;display:block;overflow:visible">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${from}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
      <path fill="url(#${id})" d="M50 0 C53.5 31 69 46.5 100 50 C69 53.5 53.5 69 50 100 C46.5 69 31 53.5 0 50 C31 46.5 46.5 31 50 0Z"/></svg>`;
  }

  /* ── سطر كلمات حركي (المرجع: Turn → Turn Books…) ─────────────────────────
     كل كلمة لها «حضور» 0..1: يحدّد مكانها (يتّسع السطر بنعومة) وظهورها من الضبابية. */
  class Line {
    constructor(items, size, { gap, weight = 500 } = {}) {
      this.size = size;
      this.gap = gap ?? size * 0.3;
      this.items = items.map((it) => {
        if (it.el || it.slotW) return { ...it };
        const el = mk(it.t, 'el word');
        Object.assign(el.style, {
          fontSize: `${size}px`,
          color: it.c,
          fontWeight: String(it.w ?? weight),
          fontFamily: it.font ?? 'var(--font-sans)',
        });
        return { ...it, el };
      });
      this.widths(); // يُقاس الآن وهو ظاهر — بعد الإخفاء يصير العرض صفراً
    }
    widths() {
      return this.items.map((it) => (it.width ??= it.slotW ?? it.el.offsetWidth));
    }
    /** مراكز العناصر من اليمين لليسار (RTL) */
    xs(pres, cx = CX) {
      const w = this.widths();
      const sw = w.map((x, i) => x * pres[i]);
      const total = sw.reduce((a, b) => a + b, 0) + pres.slice(1).reduce((a, p) => a + this.gap * p, 0);
      let x = cx + total / 2;
      return sw.map((s, i) => {
        if (i > 0) x -= this.gap * pres[i];
        const c = x - s / 2;
        x -= s;
        return c;
      });
    }
    /** ظهور الكلمات: الحضور يضبط المكان، والدخول من ضبابية أكبر قليلاً */
    render(pres, { cx = CX, y = CY, op = 1, blur = 0, s = 1, dx = [], skipSlots = true } = {}) {
      // المكان يُحجز أسرع من الظهور — فلا تتراكب الكلمة الداخلة مع جارتها
      const xs = this.xs(
        pres.map((p) => clamp(p * 1.7)),
        cx,
      );
      this.items.forEach((it, i) => {
        if (it.slotW && skipSlots) return;
        const a = pres[i];
        set(it.el, {
          x: cx + (xs[i] - cx) * s + (dx[i] ?? 0),
          y,
          s: s * (1 + (1 - a) * 0.22),
          op: a * op,
          blur: (1 - a) * 18 + blur,
        });
      });
      return xs;
    }
    hide() {
      this.items.forEach((it) => !it.slotW && hide(it.el));
    }
  }

  /* ── مكوّنات حرف ─────────────────────────────────────────────────────────── */
  const FONTS = {
    ghroob: { fam: "'Ghroob Arabic itf'", w: 500, name: 'Ghroob Arabic', by: 'iwantype', paid: true },
    qomra: { fam: "'Qomra Arabic itf'", w: 700, name: 'Qomra Arabic', by: 'iwantype', paid: true },
    zain: { fam: "'AM-ZAIN ORIGINAL'", w: 400, name: 'AM Zain', by: 'AM Type', paid: true },
    cairo: { fam: "'Cairo'", w: 700, name: 'Cairo', by: 'Mohamed Gaber · Google Fonts' },
    reem: { fam: "'Reem Kufi'", w: 600, name: 'Reem Kufi', by: 'Khaled Hosny' },
    messiri: { fam: "'El Messiri'", w: 600, name: 'El Messiri', by: 'Mohamed Gaber' },
    amiri: { fam: "'Amiri'", w: 700, name: 'Amiri', by: 'Khaled Hosny' },
    ruqaa: { fam: "'Aref Ruqaa'", w: 700, name: 'Aref Ruqaa', by: 'Abdullah Aref' },
    lalezar: { fam: "'Lalezar'", w: 400, name: 'Lalezar', by: 'Borna Izadpanah' },
    marhey: { fam: "'Marhey'", w: 600, name: 'Marhey', by: 'Google Fonts' },
    changa: { fam: "'Changa'", w: 700, name: 'Changa', by: 'Eduardo Tunni' },
    lyon: { fam: "'Lyon Arabic Display Web'", w: 400, name: 'Lyon Arabic', by: 'Commercial Type' },
    rakkas: { fam: "'Rakkas'", w: 400, name: 'Rakkas', by: 'Zeynep Akay' },
    markazi: { fam: "'Markazi Text'", w: 600, name: 'Markazi Text', by: 'Borna Izadpanah' },
    kufi: { fam: "'Noto Kufi Arabic'", w: 700, name: 'Noto Kufi Arabic', by: 'Google · Monotype' },
  };
  /** كل الخطوط التي يجب أن تكون محمّلة قبل الإطار الأول */
  window.REQUIRED_FONTS = [
    ...[300, 400, 500, 600].map((w) => `${w} 40px "Graphik Arabic"`),
    ...Object.values(FONTS).map((f) => `${f.w} 40px ${f.fam.replace(/'/g, '"')}`),
  ];

  const TONE = {
    ok: { label: 'تطابق عالٍ', bar: 'var(--ok-500)', text: 'var(--ok-text)' },
    warn: { label: 'تطابق متوسط', bar: 'var(--warn-500)', text: 'var(--warn-text)' },
    dgr: { label: 'تطابق ضعيف', bar: 'var(--dgr-500)', text: 'var(--dgr-text)' },
  };
  const toneOf = (s) => (s >= 75 ? 'ok' : s >= 50 ? 'warn' : 'dgr');
  const badge = (paid) =>
    paid
      ? `<span class="badge badge-paid">${icon('CrownIcon', { filled: true, size: 13 })}مدفوع</span>`
      : `<span class="badge badge-free">${icon('CheckIcon', { size: 13 })}مجاني</span>`;

  /** بطاقة النتيجة — FontCard + ResultCard كما في صفحة «عين» */
  function resultCard(key, score, word = 'عصري', extraCls = '') {
    const f = FONTS[key];
    const tone = TONE[toneOf(score)];
    return mk(
      `<div class="card rcard ${extraCls}">
        <div class="spec"><span class="w" style="font-family:${f.fam};font-weight:${f.w}">${word}</span>${badge(f.paid)}
          <span style="position:absolute;top:16px;inset-inline-start:16px;width:34px;height:34px;border-radius:999px;background:var(--card);box-shadow:var(--shadow-soft);display:grid;place-items:center;color:var(--muted-foreground);font-size:0">${icon('HeartIcon', { size: 16 })}</span></div>
        <div class="body">
          <div class="top"><span class="name">${f.name}</span><span class="score">تطابق <b class="ltr">${score}%</b></span></div>
          <div class="by">${f.by}</div>
          <div class="meter"><i style="width:${score}%;background:${tone.bar}"></i></div>
          <div class="foot"><span class="tone" style="color:${tone.text}">${tone.label}</span><span class="cmp">قارن</span></div>
        </div>
      </div>`,
    );
  }
  const meterOf = (card) => card.querySelector('.meter i');

  /** «الصورة» التي يرفعها المستخدم: لافتة كتابة عربية (بخط غروب — أعلى نتيجة) */
  function sourceImage(w, h, fs) {
    return mk(`<div class="src" style="width:${w}px;height:${h}px;border-radius:22px;position:relative;overflow:hidden;
        background:radial-gradient(120% 120% at 85% 10%, #3a1516 0%, #1b1b1b 55%, #121212 100%);box-shadow:var(--shadow-overlay)">
        <div class="src-grain" style="position:absolute;inset:0;background:radial-gradient(60% 50% at 20% 90%, rgb(236 59 60 / .28), transparent 70%)"></div>
        <div class="src-txt" style="position:absolute;inset:0;display:grid;place-items:center;font-family:'Ghroob Arabic itf';font-weight:500;font-size:${fs}px;line-height:1;color:#fff">عصري</div>
        <div class="src-iso" style="position:absolute;inset:0;display:grid;place-items:center;background:var(--sunken);clip-path:inset(0 0 0 100%);font-family:'Ghroob Arabic itf';font-weight:500;font-size:${fs}px;line-height:1;color:var(--foreground)">عصري</div>
      </div>`);
  }

  /** مؤشّر الفأرة + موجة النقر */
  function cursor() {
    const el = mk(
      `<svg width="46" height="46" viewBox="0 0 24 24" style="display:block;filter:drop-shadow(0 4px 8px rgb(22 22 22 / .22))">
        <path d="M4.5 2.8 L4.5 19.2 L8.7 15.3 L11.4 21.3 L14.1 20.1 L11.4 14.2 L17.3 14.2 Z" fill="#fff" stroke="#161616" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
      'el',
    );
    const ring = mk('', 'el');
    Object.assign(ring.style, {
      width: '70px',
      height: '70px',
      borderRadius: '999px',
      border: '3px solid var(--primary-fill)',
    });
    return { el, ring };
  }
  /** المؤشّر: المسار والنقرة. الرأس (طرف السهم) هو نقطة (x,y) */
  function renderCursor(c, t, { a, b, from, to, click, end, op = 1 }) {
    const vis = Math.min(P(t, a - 0.15, a + 0.1), 1 - P(t, end, end + 0.25));
    const k = P(t, a, b, E.io);
    const x = mix(from[0], to[0], k);
    const y = mix(from[1], to[1], k) - Math.sin(k * Math.PI) * 60;
    const press = click != null ? 1 - 0.18 * Math.sin(Math.PI * clamp((t - click) / 0.22)) : 1;
    set(c.el, { x: x + 15, y: y + 16, s: press, op: vis * op });
    if (click != null) {
      const r = clamp((t - click) / 0.45);
      set(c.ring, { x, y, s: 0.2 + r * 1.3, op: r > 0 && r < 1 ? (1 - r) * 0.8 * op : 0 });
    } else hide(c.ring);
  }

  /** قصاصات احتفال بألوان حرف — حتمية (بذرة ثابتة) */
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
     بناء المشاهد (مرّة واحدة بعد تحميل الخطوط)
     ════════════════════════════════════════════════════════════════════════ */
  const RED = 'var(--primary)';
  const RED2 = 'var(--harf-400)';
  const RED3 = 'var(--harf-300)';
  const INK = 'var(--foreground)';
  const S = {};

  function build() {
    /* — المشهد 1: الوعد — */
    S.l1 = new Line(
      [
        { t: 'ارفع', c: RED },
        { t: 'صورة', c: INK },
      ],
      104,
    );
    S.big = mk('لأيّ خط', 'el word');
    Object.assign(S.big.style, { fontSize: '210px', color: RED, fontWeight: '500' });
    S.cardSlot = { slotW: 300 };
    S.l3 = new Line([{ t: 'اعرف', c: RED }, { t: 'اسمه', c: INK }, S.cardSlot, { t: 'فوراً', c: RED2 }], 104);
    S.srcCard = sourceImage(300, 300, 104);
    S.srcLabel = mk(
      `<div style="display:flex;align-items:center;gap:8px;height:40px;padding:0 16px;border-radius:999px;background:rgb(255 255 255 / .92);box-shadow:var(--shadow-float);font-size:17px;font-weight:500;color:var(--foreground)">
        ${icon('PictureIcon', { size: 18, color: 'var(--primary)' })}<span class="ltr">poster.jpg</span></div>`,
    );
    S.cur1 = cursor();

    /* — المشهد 2: واجهة الرفع (Dropzone الخاصة بـ«عين») — */
    S.stack = [0, 1, 2].map(() => mk('', 'el panel'));
    S.stack.forEach((p, i) =>
      Object.assign(p.style, {
        width: `${1180 - i * 70}px`,
        height: `${680 - i * 40}px`,
        background: i ? 'rgb(255 255 255 / .7)' : 'var(--card)',
      }),
    );
    S.upload =
      mk(`<div class="panel" style="width:1180px;height:680px;padding:56px 72px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center">
        <div style="display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 18px;border-radius:999px;background:var(--tint-brand);color:var(--primary);font-size:16px;font-weight:500">${icon('MagicWandIcon', { size: 18 })}مطابقة الخطوط بالذكاء الاصطناعي</div>
        <div style="margin-top:22px;font-size:54px;font-weight:600;line-height:1.25">عين <span style="color:var(--primary)">تتعرّف على الخط</span></div>
        <div class="dz" style="margin-top:34px;width:100%;flex:1;border:1.5px dashed var(--primary);border-radius:24px;background:var(--tint-brand);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px">
          <div style="width:84px;height:84px;border-radius:999px;background:var(--card);color:var(--primary);display:grid;place-items:center;box-shadow:var(--shadow-soft)">${icon('CloudUploadIcon', { size: 38 })}</div>
          <div style="font-size:30px;font-weight:600;margin-top:8px">ارفع صورة الخط</div>
          <div style="font-size:19px;color:var(--muted-foreground)">أو اسحب الصورة وأفلتها هنا — حتى 10 ميغابايت</div>
          <div style="display:flex;gap:10px;margin-top:10px"><span class="chip ltr">PNG</span><span class="chip ltr">JPG</span><span class="chip ltr">WEBP</span></div>
        </div></div>`);

    /* — المشهد 3: نفق واجهات حرف — */
    const tile = (k, word) =>
      `<div style="background:var(--sunken);border-radius:18px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px">
        <span style="font-family:${FONTS[k].fam};font-weight:${FONTS[k].w};font-size:64px;line-height:1.25">${word}</span>
        <span class="ltr" style="font-size:15px;font-weight:500;color:var(--tertiary)">${FONTS[k].name}</span></div>`;
    const wall = (title, tiles) =>
      `<div class="panel" style="width:1100px;height:640px;padding:28px;box-sizing:border-box;display:flex;flex-direction:column;gap:20px">
        <div style="display:flex;align-items:center;gap:14px;height:40px">
          <div style="color:var(--primary);height:30px">${LOGO.mark.replace('<svg', '<svg style="height:30px;width:30px"')}</div>
          <span style="font-size:20px;font-weight:600">${title}</span><span style="flex:1"></span>
          <span style="width:260px;height:40px;border-radius:999px;background:var(--sunken);display:flex;align-items:center;gap:8px;padding:0 16px;color:var(--tertiary);font-size:15px">${icon('SearchIcon', { size: 16 })}ابحث عن الخط</span></div>
        <div style="flex:1;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:16px">${tiles.map(([k, w]) => tile(k, w)).join('')}</div></div>`;
    S.tunnel = group3d(1100);
    S.walls = [
      wall('خطوط عربية', [
        ['cairo', 'القاهرة'],
        ['amiri', 'أميري'],
        ['reem', 'ريم'],
        ['ruqaa', 'رقعة'],
        ['lalezar', 'لاله'],
        ['marhey', 'مرحي'],
      ]),
      wall('عين', [
        ['ghroob', 'غروب'],
        ['qomra', 'قمرة'],
        ['zain', 'زين'],
        ['lyon', 'ليون'],
        ['changa', 'تشانجا'],
        ['messiri', 'المسيري'],
      ]),
      wall('أقرب الخطوط', [
        ['rakkas', 'رقّاص'],
        ['markazi', 'مركزي'],
        ['kufi', 'كوفي'],
        ['cairo', 'هوية'],
        ['amiri', 'حرف'],
        ['ghroob', 'عصري'],
      ]),
      wall('مخطوطات', [
        ['ruqaa', 'بسم الله'],
        ['reem', 'رمضان'],
        ['amiri', 'عيد'],
        ['qomra', 'لافتة'],
        ['zain', 'شعار'],
        ['lalezar', 'غلاف'],
      ]),
    ].map((h) => mk(h, 'el', S.tunnel.inner));
    S.l4 = new Line(
      [
        { t: 'فقط', c: RED },
        { t: 'ارفع', c: RED2 },
        { t: 'واكتشف', c: INK },
      ],
      84,
    );
    S.l5 = new Line(
      [
        { t: 'لافتة.', c: RED },
        { t: 'شعار.', c: RED2 },
        { t: 'غلاف.', c: RED3 },
      ],
      84,
    );
    S.l6 = new Line(
      [
        { t: 'كل خطوط حرف', c: INK },
        { t: 'في عين واحدة', c: RED },
      ],
      84,
    );

    /* — المشهد 4: التحليل — */
    S.ribbon = mk('', 'el');
    Object.assign(S.ribbon.style, {
      width: '1100px',
      height: '64px',
      borderRadius: '999px',
      background: 'linear-gradient(270deg, var(--harf-200), var(--harf-500) 45%, var(--harf-600) 75%, var(--harf-300))',
      boxShadow: '0 18px 40px rgb(236 59 60 / .25)',
    });
    S.track = mk('', 'el');
    Object.assign(S.track.style, {
      width: '1100px',
      height: '64px',
      borderRadius: '999px',
      background: 'var(--inset)',
    });
    S.fill = mk('', 'el');
    Object.assign(S.fill.style, {
      width: '1100px',
      height: '64px',
      borderRadius: '999px',
      background:
        'linear-gradient(270deg, var(--harf-300), var(--harf-500) 40%, var(--primary-fill) 70%, var(--harf-400))',
      boxShadow: '0 14px 34px rgb(236 59 60 / .28)',
    });
    S.counter = mk(
      '<span class="ltr" style="display:inline-flex;align-items:baseline;gap:4px"><b class="n" style="font-weight:600;color:var(--primary)">0</b><span style="color:var(--strong);font-weight:400">/100</span></span>',
      'el word',
    );
    Object.assign(S.counter.style, { fontSize: '92px' });
    S.anaLabel = mk(
      `<div style="display:flex;align-items:center;gap:12px;font-size:26px;font-weight:500;color:var(--foreground)">${sparkle(30)}<span>جارٍ التحليل بالذكاء الاصطناعي…</span></div>`,
    );
    const STEPS = ['قراءة الصورة', 'عزل الحروف عن الخلفية', 'مقارنة الحروف بخطوط المكتبة', 'ترتيب النتائج'];
    S.steps = STEPS.map((s) =>
      mk(`<div style="display:flex;align-items:center;gap:10px;font-size:20px;white-space:nowrap">
          <span class="dot" style="width:26px;height:26px;border-radius:999px;display:grid;place-items:center;box-sizing:border-box"></span><span class="lbl">${s}</span></div>`),
    );
    S.anaImg = sourceImage(560, 250, 120);
    S.scan = mk('', 'el');
    Object.assign(S.scan.style, {
      width: '4px',
      height: '290px',
      borderRadius: '4px',
      background: 'var(--harf-500)',
      boxShadow: '0 0 24px 6px rgb(236 59 60 / .45)',
    });
    S.sel = mk('', 'el');
    Object.assign(S.sel.style, {
      width: '330px',
      height: '170px',
      border: '2.5px dashed var(--harf-500)',
      borderRadius: '10px',
      boxSizing: 'border-box',
    });
    S.done = mk(
      `<svg viewBox="0 0 100 100" style="width:100%;height:100%;display:block"><path class="chk" d="M30 52 L45 66 L71 37" fill="none" stroke="var(--primary-fill)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`,
      'el',
    );
    Object.assign(S.done.style, {
      width: '1100px',
      height: '64px',
      borderRadius: '999px',
      background: 'var(--card)',
      boxShadow: '0 0 0 3px var(--harf-200), var(--shadow-overlay)',
      boxSizing: 'border-box',
      overflow: 'hidden',
    });
    S.doneWord = mk('تم', 'el word');
    Object.assign(S.doneWord.style, { fontSize: '120px', color: RED, fontWeight: '500' });
    S.found = mk(
      `<div style="display:flex;align-items:center;gap:10px;height:56px;padding:0 26px;border-radius:999px;background:var(--tint-ok);color:var(--ok-text);font-size:24px;font-weight:500;box-shadow:0 0 0 1px rgb(30 133 64 / .18)">${icon('CheckIcon', { size: 22 })}تم العثور على ٣ خطوط مطابقة</div>`,
    );
    const r = rng(7);
    const COLORS = ['#ec3b3c', '#f56d70', '#d22528', '#fca0a2', '#ffd9c4', '#fbd3e5', '#f5a524', '#ffc8c9'];
    S.confetti = Array.from({ length: 110 }, () => {
      const w = 12 + r() * 30;
      const el = mk('', 'el');
      Object.assign(el.style, {
        width: `${w}px`,
        height: `${w * (0.45 + r() * 0.5)}px`,
        background: COLORS[Math.floor(r() * COLORS.length)],
        borderRadius: r() < 0.3 ? '999px' : '3px',
      });
      return {
        el,
        x0: r() * 2100 - 90,
        y0: -60 - r() * 520,
        vy: 520 + r() * 520,
        sway: 40 + r() * 90,
        ph: r() * 6.28,
        spin: (r() - 0.5) * 900,
        rx: r() * 360,
        depth: r(),
      };
    });

    /* — المشهد 5: النتائج — */
    S.row = [
      ['ghroob', 95],
      ['qomra', 60],
      ['zain', 30],
      ['cairo', 48],
      ['reem', 41],
      ['messiri', 37],
    ].map(([k, s]) => ({ k, s, el: resultCard(k, s) }));
    S.frame = mk(`<div class="panel appframe" style="display:flex;flex-direction:column">
        <div class="site-head"><div class="logo">${LOGO.lockup.replace('<svg', '<svg style="height:36px;width:auto"')}</div>
          <nav><span>خطوط مجانية</span><span>خطوط مدفوعة</span><span>مخطوطات</span><span class="on">عين</span><span>نسق</span><span>مختبر الخط</span><span>عكس النص</span></nav>
          <div class="acts"><i></i><i></i><i style="background:var(--tint-brand)"></i></div></div>
        <div style="padding:34px 56px 0;display:flex;align-items:flex-end;justify-content:space-between">
          <div><div style="font-size:30px;font-weight:600">أقرب الخطوط</div><div style="font-size:17px;color:var(--muted-foreground);margin-top:4px">أقرب 6 خطوط في مكتبة حرف، مرتّبة حسب التشابه</div></div>
          <span class="btn btn-outline" style="height:46px;font-size:17px;padding:0 20px;border-radius:12px">صورة جديدة</span></div>
        <div class="grid" style="padding:26px 56px;display:grid;grid-template-columns:repeat(3,420px);justify-content:space-between;row-gap:26px"></div></div>`);
    const grid = S.frame.querySelector('.grid');
    S.gridCards = S.row.map(({ k, s }) => {
      const c = resultCard(k, s);
      c.className = '';
      grid.appendChild(c);
      return c;
    });
    S.cur2 = cursor();
    S.hero = resultCard('ghroob', 95);
    S.hero.firstElementChild.style.boxShadow = '0 0 0 2px var(--harf-300), var(--shadow-overlay)';
    S.fan = ['هوية', 'حرف', 'تصميم', 'مرحبا'].map((w) => resultCard('ghroob', 95, w));
    S.l7 = new Line(
      [
        { t: 'جرّبه', c: RED },
        { t: 'على نصّك', c: INK },
      ],
      84,
    );

    /* — المشهد 6: من النتيجة إلى الترخيص — */
    const rowHtml = (k, s, on) => {
      const f = FONTS[k];
      const tone = TONE[toneOf(s)];
      return `<div class="lrow" style="display:flex;align-items:center;gap:22px;height:104px;padding:0 24px;border-radius:18px;border:1px solid var(--border);background:${on ? 'var(--card)' : 'var(--card)'}">
        <div style="width:150px;height:76px;border-radius:12px;background:var(--sunken);display:grid;place-items:center;font-family:${f.fam};font-weight:${f.w};font-size:40px">عصري</div>
        <div style="flex:1;display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;align-items:baseline;gap:14px"><span class="ltr" style="font-size:24px;font-weight:600">${f.name}</span><span style="font-size:16px;color:var(--muted-foreground)">تطابق <b class="ltr" style="color:var(--foreground);font-weight:500">${s}%</b></span></div>
          <div class="meter" style="width:360px"><i style="width:${s}%;background:${tone.bar}"></i></div></div>
        <span style="font-size:16px;font-weight:500;color:${tone.text}">${tone.label}</span>
        <span style="position:relative">${badge(f.paid).replace('class="badge', 'style="position:static" class="badge')}</span></div>`;
    };
    S.list = mk(`<div class="panel appframe" style="display:flex;flex-direction:column">
        <div class="site-head"><div class="logo">${LOGO.lockup.replace('<svg', '<svg style="height:36px;width:auto"')}</div>
          <nav><span>خطوط مجانية</span><span>خطوط مدفوعة</span><span>مخطوطات</span><span class="on">عين</span><span>نسق</span><span>مختبر الخط</span><span>عكس النص</span></nav>
          <div class="acts"><i></i><i></i><i style="background:var(--tint-brand)"></i></div></div>
        <div style="padding:34px 56px 18px;font-size:30px;font-weight:600">أقرب الخطوط</div>
        <div class="rows" style="padding:0 56px;display:flex;flex-direction:column;gap:14px">${S.row
          .slice(0, 5)
          .map(({ k, s }, i) => rowHtml(k, s, i === 0))
          .join('')}</div></div>`);
    S.listRow0 = S.list.querySelector('.lrow');
    S.pickRow = mk(
      `<div style="width:1240px;background:var(--card);border-radius:24px;box-shadow:var(--shadow-overlay)">${rowHtml('ghroob', 95, true)}</div>`,
    );
    S.pickRow.querySelector('.lrow').style.border = 'none';
    S.cta = mk(
      `<span class="btn btn-primary" style="height:72px;font-size:24px;padding:0 38px">${icon('CrownIcon', { size: 22 })}اختر الترخيص</span>`,
    );
    S.cur3 = cursor();

    /* — المشهد 7: الملخّص — */
    S.star = mk(sparkle(100), 'el');
    S.trail = [0, 1, 2, 3, 4].map(() => mk(sparkle(100), 'el'));
    S.l8 = new Line([{ t: 'ارفع.', c: RED }, { t: 'حلّل.', c: RED2 }, { t: 'اكتشف.', c: INK }, { slotW: 70 }], 96);

    /* — المشهد 8: الشعار — */
    S.mark = mk(
      `<div style="color:var(--primary);width:190px;height:190px">${LOGO.mark.replace('<svg', '<svg style="width:190px;height:190px;display:block"')}</div>`,
    );
    S.lockup = mk(
      `<div style="color:var(--primary);width:760px">${LOGO.lockup.replace('<svg', '<svg style="width:760px;height:auto;display:block"')}</div>`,
    );
    S.tagline = mk(
      '<div style="font-size:30px;font-weight:500;color:var(--foreground)">عين — <span style="color:var(--primary)">اكتشف أي خط عربي من صورة</span></div>',
    );
    S.url = mk(
      '<div class="ltr" style="font-size:24px;font-weight:400;color:var(--tertiary);letter-spacing:.02em">harfarabic.com</div>',
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
     المشاهد — كل دالة تضبط عناصرها للزمن t (وتخفيها خارج نطاقها)
     ════════════════════════════════════════════════════════════════════════ */

  /** 1) الوعد: «ارفع صورة» ← «لأيّ خط» ← «اعرف اسمه [الصورة] فوراً» ← نقرة ← واجهة الرفع */
  function scene1(t) {
    // «ارفع صورة»
    if (t < 1.4) {
      const out = P(t, 0.95, 1.25, E.in);
      S.l1.render([P(t, 0.05, 0.5), P(t, 0.5, 0.95)], { op: 1 - out, blur: out * 22, s: 1 + out * 0.12 });
    } else S.l1.hide();

    // «لأيّ خط» — كبيرة في المنتصف ثم تنزلق خارجة (كـ«Audio» في المرجع)
    {
      const a = P(t, 1.1, 1.5);
      const o = P(t, 1.78, 2.08, E.in);
      set(S.big, { x: CX - o * 220, y: CY, s: 1 + (1 - a) * 0.25, op: a * (1 - o), blur: (1 - a) * 30 + o * 26 });
    }

    // «اعرف اسمه [صورة] فوراً»
    if (t >= 1.9 && t < 5.4) {
      const pres = [P(t, 2.05, 2.5), P(t, 2.5, 2.95), P(t, 2.95, 3.5, E.menu), P(t, 3.2, 3.65)];
      const away = P(t, 4.55, 5.0, E.in);
      const xs = S.l3.xs(pres.map((p) => clamp(p * 1.7)));
      S.l3.items.forEach((it, i) => {
        if (it.slotW) return;
        const dir = i < 2 ? 1 : -1;
        set(it.el, {
          x: xs[i] + dir * away * 260,
          y: CY,
          s: 1 + (1 - pres[i]) * 0.22,
          op: pres[i] * (1 - away),
          blur: (1 - pres[i]) * 18 + away * 20,
        });
      });
      S.cardX = xs[2];
    } else S.l3.hide();

    // بطاقة الصورة بين الكلمات ← تكبر وتصير واجهة الرفع
    if (t >= 2.9 && t < 6.0) {
      const a = P(t, 2.95, 3.55, E.pop);
      const bob = Math.sin(t * 2.4) * 6;
      const press = 1 - 0.06 * Math.sin(Math.PI * clamp((t - 4.45) / 0.25));
      const grow = P(t, 4.6, 5.25, E.io);
      const into = P(t, 5.15, 5.55, E.in);
      const x = mix(S.cardX ?? CX, CX, grow);
      set(S.srcCard, {
        x,
        y: CY + bob * (1 - grow) - grow * 40,
        s: mix(0.35, 1, a) * press * mix(1, 1.45, grow) * (1 - into * 0.5),
        rz: (1 - a) * -14 + Math.sin(t * 1.7) * 2 * (1 - grow),
        op: a * (1 - into),
        blur: into * 10,
      });
      const la = P(t, 3.35, 3.7, E.pop) * (1 - P(t, 4.6, 4.8, E.in));
      set(S.srcLabel, { x: x, y: CY + 168 + bob, s: 0.7 + la * 0.3, op: la });
    } else hide(S.srcCard, S.srcLabel);

    renderCursor(S.cur1, t, {
      a: 3.85,
      b: 4.42,
      from: [CX - 380, CY + 520],
      to: [S.cardX ?? CX - 40, CY + 30],
      click: 4.45,
      end: 4.75,
    });

    // واجهة الرفع: طبقات زجاجية تنفتح ثم تميل وتتلاشى (المرجع 5.0–5.5)
    if (t >= 4.9 && t < 6.4) {
      const a = P(t, 4.95, 5.6, E.menu);
      const out = P(t, 5.75, 6.25, E.in);
      S.stack.forEach((p, i) => {
        set(p, {
          y: CY + 30 - i * 26 * a,
          s: mix(0.35, 1, a) * (1 - i * 0.02),
          rx: mix(38, 14, a) + out * 30,
          op: a * (1 - out) * (i ? 0.75 : 0),
          blur: out * 14,
        });
      });
      set(S.upload, {
        y: CY + 30 - out * 60,
        s: mix(0.35, 0.98, a) * (1 + out * 0.12),
        rx: mix(38, 12, a) + out * 34,
        op: a * (1 - out),
        blur: (1 - a) * 8 + out * 16,
      });
    } else hide(...S.stack, S.upload);
  }

  /** 2) النفق: «فقط ارفع واكتشف» ← «لافتة. شعار. غلاف.» ← «كل خطوط حرف في عين واحدة» */
  function scene2(t) {
    if (t < 5.7 || t > 10.6) {
      hide(S.tunnel.g);
      S.l4.hide();
      S.l5.hide();
      S.l6.hide();
      return;
    }
    // النص في القلب
    {
      const out = P(t, 7.2, 7.45, E.in);
      S.l4.render([P(t, 5.95, 6.35), P(t, 6.35, 6.75), P(t, 6.75, 7.15)], { op: 1 - out, blur: out * 18 });
      const out2 = P(t, 8.5, 8.72, E.in);
      S.l5.render([P(t, 7.4, 7.75), P(t, 7.75, 8.1), P(t, 8.1, 8.45)], { op: 1 - out2, blur: out2 * 18 });
      const out3 = P(t, 9.55, 9.85, E.in);
      S.l6.render([P(t, 8.7, 9.1), P(t, 8.95, 9.35)], { op: 1 - out3, blur: out3 * 20, s: 1 + out3 * 0.3 });
    }
    // الجدران: تأتي من العمق، تدور ببطء، ثم تندفع نحو الكاميرا
    const a = P(t, 5.85, 7.0, E.menu);
    const rush = P(t, 9.45, 10.25, E.in);
    set(S.tunnel.g, { x: CX, y: CY, op: 1, center: false });
    const spin = mix(-14, 6, P(t, 5.85, 10.2, E.lin)) + rush * 18;
    S.tunnel.inner.style.transform = `translateZ(${mix(-2600, -180, a) + rush * 1600}px) rotateZ(${spin}deg)`;
    const R = 600;
    const geo = [
      { x: -R - 170, y: 0, ry: 78, rx: 0 }, // يسار
      { x: R + 170, y: 0, ry: -78, rx: 0 }, // يمين
      { x: 0, y: -R + 60, ry: 0, rx: -76 }, // أعلى
      { x: 0, y: R - 60, ry: 0, rx: 76 }, // أسفل
    ];
    S.walls.forEach((w, i) => {
      const g = geo[i];
      const drift = Math.sin(t * 0.9 + i) * 30;
      w.style.display = '';
      w.style.opacity = String(a * (1 - rush));
      w.style.filter = rush > 0.05 ? `blur(${(rush * 10).toFixed(1)}px)` : 'none';
      w.style.transform = `translate3d(${g.x}px,${g.y + drift}px,0) translate(-50%,-50%) rotateY(${g.ry}deg) rotateX(${g.rx}deg)`;
    });
  }

  /** 3) التحليل: شريط أحمر ← تقدّم 0→100 مع خطوات «عين» ← «تم» + قصاصات */
  function scene3(t) {
    if (t < 9.8 || t > 14.6) {
      hide(
        S.ribbon,
        S.track,
        S.fill,
        S.counter,
        S.anaLabel,
        ...S.steps,
        S.anaImg,
        S.scan,
        S.sel,
        S.done,
        S.doneWord,
        S.found,
        bgDawn,
      );
      S.confetti.forEach((c) => hide(c.el));
      return;
    }
    const BAR_Y = CY + 150;
    // الشريط يعبر الشاشة عريضاً ثم ينضغط إلى شريط تقدّم (المرجع 10.0–11.0)
    const sweep = P(t, 9.85, 10.45, E.io);
    const squeeze = P(t, 10.3, 10.85, E.menu);
    const ribbonOut = P(t, 10.75, 11.0, E.lin);
    set(S.ribbon, {
      x: mix(CX + 1600, CX, sweep),
      y: mix(CY, BAR_Y, squeeze),
      sx: mix(2.3, 1, squeeze),
      sy: mix(9, 1, squeeze),
      op: 1 - ribbonOut,
      blur: (1 - squeeze) * 18,
    });

    const prog = P(t, 10.9, 12.65, bezier(0.45, 0, 0.25, 1));
    const ui = P(t, 10.75, 11.1);
    const toDone = P(t, 12.7, 13.15, E.io);
    const uiOut = P(t, 12.6, 12.85, E.in);
    set(S.track, { y: BAR_Y, op: ui * (1 - toDone) });
    // تعبئة من اليمين لليسار (RTL)
    S.fill.style.clipPath = `inset(0 0 0 ${((1 - prog) * 100).toFixed(2)}% round 999px)`;
    set(S.fill, { y: BAR_Y, op: ui * (1 - toDone) });
    const n = Math.round(prog * 100);
    S.counter.querySelector('.n').textContent = String(n);
    const headX = CX + 550 - prog * 1100;
    set(S.counter, {
      x: Math.max(CX - 470, Math.min(CX + 470, headX)),
      y: BAR_Y - 112,
      op: ui * (1 - uiOut),
      blur: (1 - ui) * 12 + uiOut * 10,
    });

    // الخطوات تحت الشريط
    const thresholds = [0.08, 0.22, 0.86, 0.98];
    const stepXs = [CX + 420, CX + 125, CX - 190, CX - 470];
    S.steps.forEach((el, i) => {
      const doneK = clamp((prog - thresholds[i]) / 0.04);
      const current = !doneK && (i === 0 || prog >= thresholds[i - 1]);
      const dot = el.querySelector('.dot');
      const lbl = el.querySelector('.lbl');
      dot.style.background = doneK > 0.5 ? 'var(--ok-700)' : 'transparent';
      dot.style.border = doneK > 0.5 ? 'none' : current ? '2.5px solid var(--primary)' : '1.5px solid var(--strong)';
      dot.innerHTML = doneK > 0.5 ? icon('CheckIcon', { size: 15, color: '#fff' }) : '';
      lbl.style.color = doneK > 0.5 || current ? 'var(--foreground)' : 'var(--tertiary)';
      lbl.style.fontWeight = current ? '500' : '400';
      set(el, { x: stepXs[i], y: BAR_Y + 86, op: P(t, 10.95 + i * 0.08, 11.3 + i * 0.08) * (1 - uiOut) });
    });

    // الصورة فوق الشريط: خطّ مسح يعزل الحروف (قراءة ← عزل)
    const imgIn = P(t, 10.65, 11.15, E.pop);
    const imgY = CY - 210;
    set(S.anaImg, { x: CX + 290, y: imgY, s: mix(0.6, 1, imgIn), op: imgIn * (1 - uiOut), blur: uiOut * 12 });
    set(S.anaLabel, { x: CX - 330, y: imgY, op: P(t, 11.0, 11.4) * (1 - uiOut), blur: uiOut * 10 });
    const scanK = P(t, 11.15, 12.15, E.io);
    set(S.scan, { x: CX + 290 + 280 - scanK * 560, y: imgY, op: inOut(t, 11.1, 11.25, 12.1, 12.3) * (1 - uiOut) });
    // ما يتجاوزه خطّ المسح يصير حروفاً معزولة على أرضية فاتحة (من اليمين لليسار)
    S.anaImg.querySelector('.src-iso').style.clipPath = `inset(0 ${((1 - scanK) * 100).toFixed(2)}% 0 0)`;
    set(S.sel, { x: CX + 290, y: imgY + 4, s: mix(1.25, 1, P(t, 11.9, 12.3)), op: P(t, 11.9, 12.2) * (1 - uiOut) });

    // الشريط ينكمش إلى دائرة «تم» (المرجع 12.5–13.0)
    if (t >= 12.65) {
      const k = toDone;
      const size = mix(1100, 190, k);
      const h = mix(64, 190, k);
      Object.assign(S.done.style, {
        width: `${size}px`,
        height: `${h}px`,
        // الشريط الأحمر يذوب إلى دائرة بيضاء وهو ينكمش — بلا قفزة
        background: `linear-gradient(rgb(255 255 255 / ${k.toFixed(3)}), rgb(255 255 255 / ${k.toFixed(3)})), linear-gradient(270deg, var(--harf-300), var(--harf-500) 40%, var(--primary-fill) 70%, var(--harf-400))`,
      });
      const exit = P(t, 14.15, 14.5, E.in);
      set(S.done, { y: mix(BAR_Y, CY + 70, k) - exit * 80, op: 1 - exit, blur: exit * 16 });
      S.done.querySelector('.chk').setAttribute('stroke-dashoffset', String(1 - P(t, 13.05, 13.4)));
      const w = P(t, 12.95, 13.35);
      set(S.doneWord, {
        y: CY - 130 - exit * 80,
        s: 1 + (1 - w) * 0.25,
        op: w * (1 - exit),
        blur: (1 - w) * 18 + exit * 16,
      });
      const f = P(t, 13.45, 13.85, E.pop);
      set(S.found, { y: CY + 245 - exit * 80, s: mix(0.8, 1, f), op: f * (1 - exit), blur: exit * 12 });
    } else hide(S.done, S.doneWord, S.found);

    // لحظة التدرّج الوحيدة («فجر») + القصاصات
    bgDawn.style.display = '';
    bgDawn.style.opacity = String(inOut(t, 12.9, 13.4, 14.1, 14.55) * 0.85);
    S.confetti.forEach((c) => {
      const tt = t - 13.0;
      if (tt <= 0 || tt > 1.7) return hide(c.el);
      const y = c.y0 + c.vy * tt + 260 * tt * tt;
      const x = c.x0 + Math.sin(c.ph + tt * 3) * c.sway;
      set(c.el, {
        x,
        y,
        rz: c.ph * 57 + c.spin * tt,
        rx: c.rx + tt * 280,
        s: 0.6 + c.depth * 0.8,
        op: 1 - P(t, 14.25, 14.6, E.lin),
        blur: c.depth > 0.82 ? 6 : c.depth < 0.15 ? 3 : 0,
      });
    });
  }

  /** 4) النتائج: بطاقات تنزلق ← صفحة النتائج ← نقرة تعزل «غروب» ← نسخ بنصوص أخرى */
  function scene4(t) {
    // الشريط: البطاقات تنزلق أفقياً (المرجع 14.5–15.5)
    if (t >= 14.2 && t < 16.6) {
      const a = P(t, 14.3, 15.9, bezier(0.25, 0.1, 0.1, 1));
      const out = P(t, 15.75, 16.35, E.io);
      const GAP = 460;
      S.row.forEach(({ el }, i) => {
        // RTL: الأولى يميناً — السطر يتحرّك نحو اليمين حتى تستقرّ «غروب» قرب المنتصف
        const x = mix(-1400, CX + 480, a) - i * GAP + (CX - 480 - mix(-1400, CX + 480, a)) * out * 0;
        const dist = Math.abs(x - CX) / 900;
        const enter = clamp((x + 300) / 700);
        meterOf(el).style.transform = `scaleX(${clamp(enter * 1.2).toFixed(3)})`;
        set(el, {
          x: mix(x, CX + (x - CX) * 0.45, out),
          y: CY + out * 40,
          s: mix(1, 0.62, out),
          op: (1 - Math.max(0, dist - 0.55) * 1.6) * (1 - out),
          blur: Math.max(0, dist - 0.6) * 10 + out * 6,
        });
      });
    } else S.row.forEach(({ el }) => hide(el));

    // صفحة النتائج داخل إطار الموقع — تميل ثم تستوي (المرجع 16.0–17.0)
    if (t >= 15.8 && t < 18.2) {
      const a = P(t, 15.85, 16.75, E.menu);
      const out = P(t, 17.45, 17.95, E.in);
      set(S.frame, {
        y: CY + 20,
        s: mix(1.25, 0.78, a) * (1 + out * 0.08),
        rx: mix(26, 6, a),
        ry: mix(-18, -4, a),
        op: a * (1 - out),
        blur: (1 - a) * 10 + out * 14,
      });
      S.gridCards.forEach((c, i) => {
        const k = P(t, 16.05 + i * 0.07, 16.6 + i * 0.07);
        meterOf(c).style.transform = `scaleX(${k.toFixed(3)})`;
        c.style.boxShadow = i === 0 && t > 17.25 ? '0 0 0 2px var(--harf-300), var(--shadow-float)' : '';
      });
    } else hide(S.frame);

    // «غروب» في الإطار: أول بطاقة يميناً في الصف الأعلى
    const pickX = CX + 452;
    const pickY = CY - 77;
    renderCursor(S.cur2, t, {
      a: 16.6,
      b: 17.2,
      from: [CX - 200, CY + 560],
      to: [pickX + 60, pickY + 20],
      click: 17.25,
      end: 17.55,
    });

    // العزل والدوران ثم النسخ (المرجع 17.5–19.5)
    if (t >= 17.3 && t < 20.6) {
      const iso = P(t, 17.35, 17.95, E.menu);
      const flip = P(t, 17.95, 18.3, E.in);
      const exit = P(t, 19.85, 20.35, E.in);
      set(S.hero, {
        x: mix(pickX, CX, iso),
        y: mix(pickY, CY, iso),
        s: mix(0.78, 1.15, iso),
        ry: flip * 90,
        op: iso > 0 ? (flip < 1 ? 1 : 0) : 0,
      });
      meterOf(S.hero).style.transform = 'scaleX(1)';
      const spots = [
        [CX + 600, CY - 290, 10],
        [CX - 610, CY - 270, -12],
        [CX + 640, CY + 300, -9],
        [CX - 600, CY + 310, 13],
      ];
      S.fan.forEach((c, i) => {
        const k = P(t, 18.2 + i * 0.07, 18.8 + i * 0.07, E.menu);
        const [x, y, rz] = spots[i];
        const drift = (t - 18.2) * 14;
        meterOf(c).style.transform = 'scaleX(1)';
        set(c, {
          x: mix(CX, x, k) + (x > CX ? drift : -drift) + (x > CX ? 1 : -1) * exit * 700,
          y: mix(CY, y, k) + (y > CY ? 1 : -1) * exit * 500,
          s: mix(0.5, 0.82, k),
          rz: rz * k + exit * rz * 2,
          ry: (1 - k) * -70,
          op: k * (1 - exit),
          blur: (1 - k) * 12 + exit * 12,
        });
      });
      const out = P(t, 19.8, 20.1, E.in);
      S.l7.render([P(t, 18.55, 18.95), P(t, 18.85, 19.25)], { op: 1 - out, blur: out * 16 });
    } else {
      hide(S.hero, ...S.fan);
      S.l7.hide();
    }
  }

  /** 5) القائمة ← صف «غروب» ← «اختر الترخيص» */
  function scene5(t) {
    if (t >= 20.0 && t < 22.2) {
      const a = P(t, 20.05, 20.9, E.menu);
      const out = P(t, 21.65, 22.1, E.in);
      set(S.list, {
        y: CY + 10,
        s: mix(1.3, 0.8, a),
        rx: mix(24, 7, a),
        ry: mix(30, 10, a),
        rz: mix(-6, -1.5, a),
        op: a * (1 - out),
        blur: (1 - a) * 14 + out * 14,
      });
      S.listRow0.style.background = t > 21.1 ? 'var(--sunken)' : 'var(--card)';
      S.list
        .querySelectorAll('.meter i')
        .forEach((m, i) => (m.style.transform = `scaleX(${P(t, 20.4 + i * 0.06, 20.9 + i * 0.06).toFixed(3)})`));
    } else hide(S.list);
    renderCursor(S.cur3, t, {
      a: 20.75,
      b: 21.3,
      from: [CX - 300, CY + 560],
      to: [CX + 120, CY - 150],
      click: 21.45,
      end: 21.7,
    });

    if (t >= 21.6 && t < 24.4) {
      const iso = P(t, 21.65, 22.25, E.menu);
      const shift = P(t, 22.45, 22.95, E.io);
      const away = P(t, 23.55, 23.95, E.in);
      S.pickRow.querySelector('.meter i').style.transform = 'scaleX(1)';
      set(S.pickRow, {
        x: CX + shift * 190 + away * 260,
        y: mix(CY - 140, CY, iso),
        s: mix(0.82, 1, iso),
        op: iso * (1 - away),
        blur: (1 - iso) * 6 + away * 16,
      });
      // الزرّ يخرج من تحت الصف (المرجع «Distribute To Youtube»)
      const b = P(t, 22.55, 23.05, E.pop);
      const press = 1 - 0.035 * Math.sin(Math.PI * clamp((t - 23.38) / 0.2));
      const center = P(t, 23.6, 24.05, E.io);
      const glow = P(t, 23.7, 24.1);
      S.cta.firstElementChild.style.background =
        glow > 0 ? `linear-gradient(135deg, var(--harf-400), var(--primary-fill) ${mix(100, 60, glow)}%)` : '';
      S.cta.firstElementChild.style.boxShadow = `0 ${mix(6, 22, glow)}px ${mix(16, 48, glow)}px rgb(223 48 51 / ${mix(0.15, 0.35, glow)})`;
      const burst = P(t, 24.12, 24.32, E.in);
      set(S.cta, {
        x: mix(CX - 600, CX, center),
        y: CY,
        s: mix(0.6, 1, b) * press * mix(1, 1.35, center) * (1 - burst * 0.6),
        op: b * (1 - burst),
        blur: burst * 10,
      });
    } else hide(S.pickRow, S.cta);
    renderCursor((S.cur3b ??= cursor()), t, {
      a: 22.85,
      b: 23.3,
      from: [CX - 200, CY + 520],
      to: [CX - 600, CY + 12],
      click: 23.38,
      end: 23.6,
    });
  }

  /** 6) النجمة: انفجار ← طيران ← «ارفع. حلّل. اكتشف.» ← تتحوّل إلى رمز حرف */
  function starPos(t) {
    // مسار الطيران (المرجع 24.5–26.0): من المنتصف إلى أسفل اليمين ثم إلى نهاية السطر
    const k = P(t, 25.0, 25.95, E.io);
    const x = mix(CX, CX + 380, Math.sin(k * Math.PI) * 0.9) + mix(0, -250, k);
    const y = mix(CY, CY + 300, Math.sin(k * Math.PI)) * 1 + 0;
    return [x, y];
  }
  function scene6(t) {
    if (t < 24.1 || t > 29.4) {
      hide(S.star, ...S.trail);
      S.l8.hide();
      return;
    }
    const big = P(t, 24.12, 24.45, E.pop);
    const shrink = P(t, 24.5, 25.0, E.io);
    const size = mix(mix(40, 560, big), 64, shrink);
    let [x, y] = starPos(t);
    // بعد الهبوط: تلحق بنهاية السطر
    const pres = [P(t, 25.95, 26.35), P(t, 26.5, 26.9), P(t, 27.05, 27.45), 1];
    const xs = S.l8.xs(pres);
    const land = P(t, 25.75, 26.05, E.io);
    x = mix(x, xs[3], land);
    y = mix(y, CY - 4, land);
    // إلى المنتصف ثم الرمز
    const toMark = P(t, 28.05, 28.55, E.io);
    x = mix(x, CX, toMark);
    y = mix(y, CY, toMark);
    const markIn = P(t, 28.45, 28.75, E.in);
    set(S.star, {
      x,
      y,
      s: (size * mix(1, 2.6, toMark)) / 100,
      rz: t * 70 + big * 90,
      op: 1 - markIn,
      blur: markIn * 8,
    });
    S.trail.forEach((el, i) => {
      const dt = (i + 1) * 0.045;
      const [tx, ty] = starPos(t - dt);
      const vis = inOut(t, 25.0, 25.1, 25.75, 26.0) * (1 - i / 5) * 0.35;
      set(el, { x: tx, y: ty, s: (64 * (1 - i * 0.12)) / 100, rz: (t - dt) * 70, op: vis, blur: 2 + i * 2 });
    });
    const out = P(t, 28.0, 28.3, E.in);
    S.l8.render(pres, { op: 1 - out, blur: out * 18 });
  }

  /** 7) الشعار: الرمز ← «مكتبة حرف» ← السطر والرابط (ثبات ~4 ثوانٍ) */
  function scene7(t) {
    if (t < 28.3) return hide(S.mark, S.lockup, S.tagline, S.url);
    const m = P(t, 28.45, 28.9, E.pop);
    const move = P(t, 28.95, 29.45, E.io); // الرمز ينزلق إلى مكانه في الشعار
    const wipe = P(t, 29.4, 30.0, E.io); // ثم تنكشف الكلمات من خلفه
    // الرمز في القفل على يمين الشعار: إزاحته عن مركز القفل
    const W = 760;
    const markCx = ((1127.53 + 275.63) / 1678.79) * W - W / 2;
    const markScale = ((551.26 / 1678.79) * W) / 190;
    const LY = CY - 40;
    const handoff = t >= 29.42;
    set(S.mark, {
      x: mix(CX, CX + markCx, move),
      y: mix(CY, LY, move),
      s: mix(0.5, 1, m) * mix(1, markScale, move),
      op: handoff ? 0 : m,
    });
    S.lockup.style.clipPath = `inset(-2% -2% -2% ${mix(67, -2, wipe).toFixed(2)}%)`;
    set(S.lockup, { x: CX, y: LY, op: handoff ? 1 : 0 });
    const tg = P(t, 29.95, 30.4);
    set(S.tagline, { y: LY + 190, op: tg, blur: (1 - tg) * 12, s: 1 + (1 - tg) * 0.08 });
    const u = P(t, 30.25, 30.7);
    set(S.url, { y: LY + 250, op: u, blur: (1 - u) * 10 });
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
    scene1(t);
    scene2(t);
    scene3(t);
    scene4(t);
    scene5(t);
    scene6(t);
    scene7(t);
  };
})();
