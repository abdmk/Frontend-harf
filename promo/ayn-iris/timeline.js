/*
 * «عين» — نسخة القزحية. فكرة مستقلّة تماماً عن النسخة الأولى، مبنية على الموقع وهويته وحدهما:
 * «ع» حرف قبل أن تكون أداة، وشكلها عين. على أرضية الحبر (الوضع الليلي الحقيقي للموقع) وبأحمر حرف:
 *   1. «عين» تُرسم بمخطّطها الحقيقي، ثم ندخل تجويف العين فيصير قزحية.
 *   2. القزحية ترى جداراً من خطوط عربية في الحياة (بخطوط المكتبة نفسها)، تركّز على واحد وتلتقطه.
 *   3. تفكيك: حروف «حكاية» تنفصل، ويقيس الذكاء الاصطناعي كل حرف (إطار، عرض، نقاط المنحنى).
 *   4. قرص المطابقة: القزحية تصير قرصاً بأسماء خطوط حرف، يدور ويتباطأ حتى يقفل على «قمرة».
 *   5. صفحة عيّنة: الخط المكتشف كما تعرضه مكتبة حرف، وأفعاله الحقيقية.
 *   6. القزحية تنغلق كجفن حتى تصير نقطة حمراء — والنقطة تصير رمز حرف (دائرة حمراء).
 */
(() => {
  'use strict';
  const {
    VERTICAL,
    SW,
    SH,
    CX,
    CY,
    E,
    bezier,
    clamp,
    mix,
    mixRGB,
    P,
    span,
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
    LOGO,
    GLYPHS,
  } = window.Engine;

  const DURATION = 25.5;
  const glow = document.getElementById('glow');

  /* ── التخطيط لكل تنسيق ── */
  const L = VERTICAL
    ? {
        aynW: 760,
        aynY: CY - 80,
        tagSize: 44,
        iris: [CX, CY - 140, 340],
        capY: CY - 140 + 340 + 130,
        capSize: 62,
        hero: [CX, CY - 80, 0.78],
        cap2Y: CY - 80 + 290 + 70,
        dial: [CX, CY - 80, 350, 0.66],
        nameOff: 86,
        specWord: [CX, CY - 470, 1.08],
        spec: { x: CX, nameY: CY - 170, align: 'center' },
        logoY: CY - 60,
      }
    : {
        aynW: 900,
        aynY: CY - 50,
        tagSize: 46,
        iris: [CX, CY - 40, 300],
        capY: CY - 40 + 300 + 110,
        capSize: 64,
        hero: [CX, CY - 10, 1],
        cap2Y: CY - 10 + 300 + 80,
        dial: [CX, CY + 10, 360, 0.82],
        nameOff: 96,
        specWord: [CX + 400, CY - 30, 0.95],
        spec: { x: CX - 380, nameY: CY - 210, align: 'right' },
        logoY: CY - 50,
      };

  const COL = {
    red: '#f25558',
    fill: '#df3033',
    ink: '#f4f4f4',
    mute: '#8e8e8e',
    line: '#3a3a3a',
    ok: '#3dce68',
  };

  /* ── الخطوط ── */
  const HIK = GLYPHS.hikaya || {};
  /** القرص: الخط الصحيح أولاً (الفهرس 0)، ونسب التشابه */
  const DIAL = [
    ['qomra', 'Qomra Arabic', 97],
    ['lalezar', 'Lalezar', 58],
    ['cairo', 'Cairo', 42],
    ['ruqaa', 'Aref Ruqaa', 36],
    ['ghroob', 'Ghroob Arabic', 71],
    ['messiri', 'El Messiri', 49],
    ['kufi', 'Noto Kufi', 39],
    ['rakkas', 'Rakkas', 55],
    ['amiri', 'Amiri', 33],
    ['changa', 'Changa', 46],
    ['reem', 'Reem Kufi', 44],
  ];
  /** خطوط الجدار (CSS، نفس @font-face في library.css) */
  const WALL_FONTS = [
    ["'Cairo'", 700],
    ["'Lalezar'", 400],
    ["'Rakkas'", 400],
    ["'Marhey'", 600],
    ["'Aref Ruqaa'", 700],
    ["'Reem Kufi'", 600],
    ["'El Messiri'", 700],
    ["'Changa'", 700],
    ["'Amiri'", 700],
    ["'Markazi Text'", 700],
    ["'Noto Kufi Arabic'", 700],
    ["'Alexandria'", 700],
    ["'Tajawal'", 800],
    ["'Almarai'", 800],
    ["'AM-ZAIN ORIGINAL'", 400],
    ["'Lyon Arabic Display Web'", 400],
    ["'Ghroob Arabic itf'", 500],
  ];
  window.REQUIRED_FONTS = [
    ...[300, 400, 500, 600].map((w) => `${w} 40px "Graphik Arabic"`),
    ...WALL_FONTS.map(([f, w]) => `${w} 40px ${f.replace(/'/g, '"')}`),
    '700 40px "Qomra Arabic itf"',
  ];

  const S = {};

  /* ════════════════════════════════════════════════════════════════════════
     البناء
     ════════════════════════════════════════════════════════════════════════ */

  /** «عين» بمخطّطها الحقيقي (أميري): حدّ يُرسم ثم امتلاء */
  function buildAyn() {
    const g = GLYPHS.ayn.amiri;
    const [x0, y0, x1, y1] = g.bbox;
    const W = L.aynW + 80;
    const H = Math.round((L.aynW * (y1 - y0)) / (x1 - x0)) + 80;
    const ft = fit(g.bbox, { w: L.aynW, cx: W / 2, cy: H / 2 });
    S.aynSize = [W, H];
    S.ayn = mk(`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="display:block;overflow:visible"></svg>`);
    const svg = S.ayn.firstElementChild;
    const grp = svgEl('g', { transform: `translate(${ft.tx} ${ft.ty}) scale(${ft.k})` }, svg);
    S.aynFill = g.paths.map((d) => svgEl('path', { d, fill: COL.ink, 'fill-opacity': 0 }, grp));
    S.aynStroke = g.paths
      .map((d) =>
        svgEl(
          'path',
          {
            d,
            fill: 'none',
            stroke: COL.red,
            'stroke-width': 3,
            'vector-effect': 'non-scaling-stroke',
            pathLength: 1,
            'stroke-dasharray': 1,
            'stroke-dashoffset': 1,
          },
          grp,
        ),
      )
      .reverse(); // من اليمين لليسار

    // نقطة الدخول: داخل تجويف «ع» (أقصى اليمين) — نقطة فارغة يحيطها الحبر من اليمين والأعلى والأسفل
    const ain = S.aynFill[S.aynFill.length - 1];
    const gb = g.glyphs[g.glyphs.length - 1].bbox;
    const pts = [];
    const pt = svg.createSVGPoint();
    const inFill = (x, y) => {
      pt.x = x;
      pt.y = y;
      return ain.isPointInFill(pt);
    };
    for (let i = 1; i < 30; i++)
      for (let j = 1; j < 30; j++) {
        const x = mix(gb[0], gb[2], i / 30);
        const y = mix(gb[1], gb[3], j / 30);
        if (inFill(x, y)) continue;
        const ray = (dx, dy) => {
          for (let k = 1; k < 40; k++)
            if (inFill(x + (dx * k * (gb[2] - gb[0])) / 40, y + (dy * k * (gb[3] - gb[1])) / 40)) return true;
          return false;
        };
        if (ray(1, 0) && ray(0, -1) && ray(0, 1)) pts.push([x, y]);
      }
    const c = pts.length
      ? pts.reduce((a, p) => [a[0] + p[0] / pts.length, a[1] + p[1] / pts.length], [0, 0])
      : [(gb[0] + gb[2]) / 2, (gb[1] + gb[3]) / 2];
    // من وحدات الخط إلى إزاحة عن مركز العنصر
    S.zoomOff = [ft.tx + ft.k * c[0] - W / 2, ft.ty + ft.k * c[1] - H / 2];

    S.tag = new Line(
      [
        { t: 'ترى', c: COL.ink },
        { t: 'الخط…', c: COL.ink },
        { t: 'وتعرف', c: COL.red },
        { t: 'اسمه', c: COL.red },
      ],
      L.tagSize,
    );
  }

  /** جدار الخطوط: نسختان متطابقتان — خافتة خارج القزحية، وحادّة داخلها */
  const TW = 380;
  const TH = 190;
  const GAP = 26;
  const COLS = 9;
  const ROWS = 7;
  const TARGET = { c: 4, r: 3 };
  function buildWall() {
    const r = rng(23);
    const words = [
      'قهوة',
      'سوق',
      'نور',
      'بيت',
      'سلام',
      'فن',
      'مكتبة',
      'ليل',
      'بحر',
      'شاي',
      'عطر',
      'ورد',
      'خبز',
      'شمس',
      'قمر',
      'مدينة',
      'سفر',
      'لقاء',
      'حلم',
      'ضيافة',
      'مطبعة',
      'رحلة',
      'زيتون',
      'نخيل',
    ];
    const kinds = ['لافتة', 'غلاف', 'شعار', 'ملصق', 'قائمة طعام', 'واجهة محل', 'تغليف'];
    const cities = ['بغداد', 'القاهرة', 'بيروت', 'الرياض', 'عمّان', 'تونس', 'مسقط'];
    const pal = [
      ['#1e1e1e', '#f4f4f4'],
      ['#711819', '#ffd9c4'],
      ['#df3033', '#ffffff'],
      ['#ffd9c4', '#711819'],
      ['#fbd3e5', '#1b1b1b'],
      ['#f4f1ec', '#1b1b1b'],
      ['#2a2929', '#fca0a2'],
    ];
    const tiles = [];
    for (let row = 0; row < ROWS; row++)
      for (let col = 0; col < COLS; col++) {
        const target = col === TARGET.c && row === TARGET.r;
        const [bg, fg] = target ? ['', '#fff4ec'] : pal[Math.floor(r() * pal.length)];
        const [fam, w] = target ? ["'Qomra Arabic itf'", 700] : WALL_FONTS[Math.floor(r() * WALL_FONTS.length)];
        const word = target ? 'حكاية' : words[Math.floor(r() * words.length)];
        const meta = `${kinds[Math.floor(r() * kinds.length)]}<span>${cities[Math.floor(r() * cities.length)]}</span>`;
        tiles.push(
          `<div class="tile" style="left:${col * (TW + GAP)}px;top:${row * (TH + GAP)}px;width:${TW}px;height:${TH}px;background:${
            target ? 'linear-gradient(135deg,#5a1314,#2a0b0c)' : bg
          };color:${fg}"><span style="font-family:${fam};font-weight:${w};font-size:${target ? 84 : 58 + Math.round(r() * 26)}px;line-height:1.2">${word}</span><small>${meta}</small></div>`,
        );
      }
    const html = `<div style="position:relative;width:${COLS * (TW + GAP)}px;height:${ROWS * (TH + GAP)}px">${tiles.join('')}</div>`;
    S.wallDim = mk(html, 'el');
    S.wallSharp = mk(html, 'el');
    S.wallSize = [COLS * (TW + GAP), ROWS * (TH + GAP)]; // أبعاد العنصر الفعلية (مع الفجوة الأخيرة)
    // مركز البلاطة الهدف نسبةً إلى مركز الجدار
    S.targetOff = [
      TARGET.c * (TW + GAP) + TW / 2 - (COLS * (TW + GAP)) / 2,
      TARGET.r * (TH + GAP) + TH / 2 - (ROWS * (TH + GAP)) / 2,
    ];
  }

  /** طبقة القزحية/القرص: حلقة، تدريج، مؤشّر، وأسماء الخطوط */
  function buildRing() {
    S.ringSvg = mk(`<svg width="${SW}" height="${SH}" style="display:block;overflow:visible"></svg>`, 'el');
    Object.assign(S.ringSvg.style, { transform: 'none', zIndex: '6' });
    const svg = S.ringSvg.firstElementChild;
    S.ringGlow = svgEl(
      'circle',
      { fill: 'none', stroke: 'rgb(236 59 60 / .25)', 'stroke-width': 18, filter: 'blur(8px)' },
      svg,
    );
    S.ring = svgEl('circle', { fill: 'none', stroke: COL.fill, 'stroke-width': 4 }, svg);
    S.ring2 = svgEl('circle', { fill: 'none', stroke: 'rgb(252 160 162 / .3)', 'stroke-width': 1.2 }, svg);
    S.ticks = svgEl('g', {}, svg);
    for (let i = 0; i < 120; i++)
      svgEl('line', { 'data-i': i, stroke: '#5a5a5a', 'stroke-width': i % 10 === 0 ? 2 : 1 }, S.ticks);
    S.notch = svgEl('path', { d: 'M -12 18 L 12 18 L 0 0 Z', fill: COL.red }, svg); // يشير إلى اسم الخط أعلى القرص
    S.dot = svgEl('circle', { fill: COL.fill }, svg);
    // أسماء القرص (HTML ليبقى النص حادّاً)
    S.dialNames = DIAL.map(([, name]) => {
      const el = mk(name, 'el word ltr');
      Object.assign(el.style, { fontSize: '24px', fontWeight: '500', zIndex: '7' });
      return el;
    });
    S.score = mk(`<div style="display:flex;flex-direction:column;align-items:center;gap:4px">
      <div class="ltr" style="font-size:66px;font-weight:600;line-height:1"><span class="n">0</span><span style="font-size:36px;color:var(--muted-foreground)">%</span></div>
      <div class="lbl" style="font-size:20px;color:var(--muted-foreground);white-space:nowrap">يقارن بخطوط مكتبة حرف</div></div>`);
    S.score.style.zIndex = '7';
  }

  /** «حكاية» — العنصر البطل من البلاطة إلى صفحة العيّنة: كل حرف مجموعة مستقلّة */
  const RIG_W = 1300;
  const RIG_H = 700;
  function buildRig() {
    const q = HIK.qomra;
    const ft = fit(q.bbox, { w: 760, cx: RIG_W / 2, cy: RIG_H / 2 + 4 });
    S.ft = ft;
    const box = (bb) => ({
      x: ft.tx + ft.k * bb[0],
      y: ft.ty + ft.k * bb[1],
      w: ft.k * (bb[2] - bb[0]),
      h: ft.k * (bb[3] - bb[1]),
    });
    S.wordBox = box(q.bbox);
    S.rig =
      mk(`<svg viewBox="0 0 ${RIG_W} ${RIG_H}" width="${RIG_W}" height="${RIG_H}" style="display:block;overflow:visible">
      <defs><linearGradient id="tileG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a1314"/><stop offset="1" stop-color="#2a0b0c"/></linearGradient></defs>
      <g class="bg"><rect x="50" y="50" width="1200" height="600" rx="40" fill="url(#tileG)"/>
        <text x="1200" y="610" text-anchor="start" direction="rtl" font-family="Graphik Arabic" font-size="26" fill="rgb(255 244 236 / .55)" letter-spacing="2">لافتة · بغداد</text></g>
      <g class="cands"></g><g class="glyphs"></g></svg>`);
    S.rig.style.zIndex = '5';
    const svg = S.rig.firstElementChild;
    S.rigBg = svg.querySelector('.bg');

    // المرشّحون: الكلمة نفسها بكل خط، بحجم مخطّط «قمرة»
    const cands = svg.querySelector('.cands');
    S.cand = {};
    for (const [key] of DIAL) {
      if (key === 'qomra' || !HIK[key]) continue;
      const c = HIK[key];
      const f = fit(c.bbox, {
        w: S.wordBox.w * 1.02,
        h: S.wordBox.h * 1.06,
        cx: S.wordBox.x + S.wordBox.w / 2,
        cy: S.wordBox.y + S.wordBox.h / 2,
      });
      const g = svgEl(
        'g',
        { transform: `translate(${f.tx} ${f.ty}) scale(${f.k})`, fill: '#9a9a9a', opacity: 0 },
        cands,
      );
      c.paths.forEach((d) => svgEl('path', { d }, g));
      S.cand[key] = g;
    }

    // الحروف: إطار، عرض، تسمية، امتلاء، حدّ، نقاط — كلها داخل مجموعة الحرف فتتحرّك معه
    const letters = ['ة', 'ي', 'ا', 'ك', 'ح']; // الترتيب المرئي من اليسار
    const host = svg.querySelector('.glyphs');
    S.glyphs = q.glyphs.map((gl, i) => {
      const b = box(gl.bbox);
      const g = svgEl('g', {}, host);
      const frame = svgEl(
        'rect',
        {
          x: b.x - 12,
          y: b.y - 12,
          width: b.w + 24,
          height: b.h + 24,
          rx: 10,
          fill: 'none',
          stroke: '#fca0a2',
          'stroke-width': 1.4,
          'stroke-dasharray': '5 5',
          opacity: 0,
        },
        g,
      );
      const dim = svgEl('g', { opacity: 0 }, g);
      svgEl(
        'line',
        { x1: b.x, x2: b.x + b.w, y1: b.y - 34, y2: b.y - 34, stroke: '#8e8e8e', 'stroke-width': 1.2 },
        dim,
      );
      for (const xx of [b.x, b.x + b.w])
        svgEl('line', { x1: xx, x2: xx, y1: b.y - 41, y2: b.y - 27, stroke: '#8e8e8e', 'stroke-width': 1.2 }, dim);
      const dimT = svgEl(
        'text',
        {
          x: b.x + b.w / 2,
          y: b.y - 44,
          'text-anchor': 'middle',
          'font-family': 'Graphik Arabic',
          'font-size': 17,
          fill: '#a3a3a3',
        },
        dim,
      );
      dimT.textContent = String(Math.round(gl.bbox[2] - gl.bbox[0]));
      const lab = svgEl(
        'text',
        {
          x: b.x + b.w / 2,
          y: b.y + b.h + 54,
          'text-anchor': 'middle',
          'font-family': 'Graphik Arabic',
          'font-size': 34,
          'font-weight': 500,
          fill: COL.red,
          opacity: 0,
        },
        g,
      );
      lab.textContent = letters[i] ?? '';
      const inner = svgEl('g', { transform: `translate(${ft.tx} ${ft.ty}) scale(${ft.k})` }, g);
      const fillP = svgEl('path', { d: gl.d, fill: '#fff4ec' }, inner);
      const stroke = svgEl(
        'path',
        {
          d: gl.d,
          fill: 'none',
          stroke: COL.red,
          'stroke-width': 2.6,
          'vector-effect': 'non-scaling-stroke',
          pathLength: 1,
          'stroke-dasharray': 1,
          'stroke-dashoffset': 1,
        },
        inner,
      );
      const nodes = svgEl('g', { opacity: 0 }, g);
      gl.nodes.forEach(([ux, uy, on]) => {
        const x = ft.tx + ft.k * ux;
        const y = ft.ty + ft.k * uy;
        if (on) svgEl('circle', { cx: x, cy: y, r: 4.4, fill: '#100f0f', stroke: COL.red, 'stroke-width': 2 }, nodes);
        else svgEl('circle', { cx: x, cy: y, r: 2.4, fill: '#fca0a2' }, nodes);
      });
      return { g, frame, dim, lab, fillP, stroke, nodes, c: [b.x + b.w / 2, b.y + b.h / 2] };
    });
  }

  function buildUI() {
    // تعليقات حركية (سطر لكل جملة)
    const cap = (items, size = L.capSize) => new Line(items, size);
    S.caps = [
      cap([
        { t: 'على', c: COL.ink },
        { t: 'لافتة.', c: COL.red },
      ]),
      cap([
        { t: 'على', c: COL.ink },
        { t: 'غلاف.', c: COL.red },
      ]),
      cap([
        { t: 'في', c: COL.ink },
        { t: 'شعار.', c: COL.red },
      ]),
      cap([
        { t: 'خطٌّ', c: COL.ink },
        { t: 'أعجبك؟', c: COL.ink },
        { t: 'ما', c: COL.red },
        { t: 'اسمه؟', c: COL.red },
      ]),
      cap([{ t: 'التقطه.', c: COL.red }]),
    ];
    S.upload = mk(
      `<div class="chip" style="height:52px;padding:0 22px;font-size:21px;background:var(--tint-brand);color:#fca0a2;box-shadow:0 0 0 1px rgb(242 85 88 / .3)">${icon('CloudUploadIcon', { size: 22 })}رُفعت الصورة إلى عين</div>`,
    );
    const status = (html) =>
      mk(
        `<div style="display:flex;align-items:center;gap:12px;font-size:28px;font-weight:500;white-space:nowrap">${html}</div>`,
      );
    S.status = [
      status(`${sparkle(28)}<span>الذكاء الاصطناعي يفكّك الحروف</span>`),
      status(`${sparkle(28)}<span>ويقيس شكل كل حرف</span>`),
    ];

    // صفحة العيّنة
    const al = L.spec.align;
    const col = (html, w = 760) =>
      mk(
        `<div style="width:${w}px;text-align:${al};display:flex;flex-direction:column;align-items:${al === 'center' ? 'center' : 'flex-start'}">${html}</div>`,
      );
    S.sp = {
      kicker: col(`<div style="font-size:21px;color:var(--muted-foreground)">أقرب خط في مكتبة حرف — من صورتك</div>`),
      name: col(
        `<div class="ltr" style="font-size:${VERTICAL ? 84 : 80}px;font-weight:600;letter-spacing:-.015em;line-height:1.1">Qomra Arabic</div>`,
      ),
      sub: col(
        `<div style="font-size:28px;color:var(--muted-foreground)">قمرة · <span class="ltr">iwantype</span></div>`,
      ),
      chips: col(`<div style="display:flex;gap:10px;justify-content:${al === 'center' ? 'center' : 'flex-start'}">
          <span class="chip" style="background:rgb(61 206 104 / .14);color:var(--ok-text)">${icon('CheckIcon', { size: 17 })}تطابق <b class="ltr" style="font-weight:600">97%</b></span>
          <span class="chip" style="background:var(--gold-500);color:var(--gold-foreground)">${icon('CrownIcon', { filled: true, size: 16 })}مدفوع</span>
          <span class="chip" style="background:var(--sunken);color:var(--muted-foreground);box-shadow:inset 0 0 0 1px var(--border)">عناوين · وزن 700</span></div>`),
      abc: col(
        `<div style="font-family:'Qomra Arabic itf';font-weight:700;font-size:${VERTICAL ? 34 : 38}px;line-height:1.5;color:#c9c9c9;word-spacing:6px">ا ب ت ث ج ح خ د ذ ر ز س ش<br>ص ض ط ظ ع غ ف ق ك ل م ن ه و ي</div>`,
        VERTICAL ? 900 : 760,
      ),
      btns: col(`<div style="display:flex;gap:14px;justify-content:${al === 'center' ? 'center' : 'flex-start'}">
          <span class="btn cta" style="background:var(--primary-fill);color:#fff">${icon('CrownIcon', { size: 20 })}اختر الترخيص</span>
          <span class="btn" style="color:var(--foreground);box-shadow:inset 0 0 0 1.5px var(--strong)">${icon('MagicWandIcon', { size: 20 })}افتحه في مختبر الخط</span></div>`),
    };
    S.ctaBtn = S.sp.btns.querySelector('.cta');
    S.cur = cursor({ dark: true });

    // الشعار
    S.mark = mk(
      `<div style="color:var(--primary);width:200px;height:200px">${LOGO.mark.replace('<svg', '<svg style="width:200px;height:200px;display:block"')}</div>`,
    );
    S.lockup = mk(
      `<div style="color:var(--primary);width:760px">${LOGO.lockup.replace('<svg', '<svg style="width:760px;height:auto;display:block"')}</div>`,
    );
    S.tagline = mk(
      `<div style="font-size:32px;font-weight:500;white-space:nowrap">عين — <span style="color:var(--primary)">اكتشف أي خط عربي من صورة</span></div>`,
    );
    S.url = mk(
      '<div class="ltr" style="font-size:24px;color:var(--tertiary);letter-spacing:.03em">harfarabic.com</div>',
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
     المشاهد
     ════════════════════════════════════════════════════════════════════════ */

  /** 1) «عين» تُرسم، ثم ندخل تجويف العين */
  function sceneAyn(t) {
    if (t > 3.6) {
      hide(S.ayn);
      S.tag.hide();
      return;
    }
    S.aynStroke.forEach((p, i) =>
      p.setAttribute('stroke-dashoffset', f2(1 - P(t, 0.15 + i * 0.22, 1.25 + i * 0.22, E.move))),
    );
    const fillK = P(t, 1.15, 1.75, E.sine);
    S.aynFill.forEach((p) => p.setAttribute('fill-opacity', f2(fillK)));
    S.aynStroke.forEach((p) => p.setAttribute('opacity', f2(1 - P(t, 1.5, 1.95, E.sine))));
    // الدخول: تكبير متسارع حول تجويف «ع» حتى يملأ الظلام الشاشة
    const z = P(t, 2.55, 3.45, E.in);
    const s = Math.pow(9, z);
    const [ox, oy] = S.zoomOff;
    set(S.ayn, { x: CX - ox * (s - 1), y: L.aynY - oy * (s - 1), s, op: 1 - P(t, 2.65, 3.1, E.sine) });
    const tagOut = P(t, 2.35, 2.6, E.in);
    S.tag.render(stagger(t, 1.55, 4, 0.14), {
      y: L.aynY + (S.aynSize[1] / 2) * 0.82 + 40,
      op: 1 - tagOut,
      blur: tagOut * 10,
    });
  }

  /** الحلقة: قزحية ← تتّسع وتختفي ← قرص ← جفن */
  function ringState(t) {
    const [ix, iy, R] = L.iris;
    const [dx, dy, D] = L.dial;
    // ظهور القزحية من الظلام بعد الدخول
    let r = mix(R * 2.4, R, P(t, 3.15, 3.9, E.move));
    let x = ix;
    let y = iy;
    let op = P(t, 3.1, 3.6, E.sine);
    // نبضة الالتقاط
    r *= 1 - 0.07 * Math.sin(Math.PI * clamp((t - 7.05) / 0.32));
    // تتّسع وتذوب مع تكبير البلاطة
    const away = P(t, 7.45, 8.25, E.move);
    r = mix(r, Math.max(SW, SH), away);
    op *= 1 - away;
    // تعود قرصاً حول الكلمة
    const back = P(t, 11.7, 12.5, E.move);
    r = mix(r, D, back);
    x = mix(x, dx, back);
    y = mix(y, dy, back);
    op = Math.max(op, back);
    // تتّسع قليلاً وتختفي مع صفحة العيّنة
    const out = P(t, 15.9, 16.5, E.in);
    r = mix(r, D * 1.25, out);
    op *= 1 - out;
    // الجفن: تعود كبيرة ثم تنغلق حتى نقطة
    const lidIn = P(t, 19.7, 20.15);
    const close = P(t, 20.1, 21.0, E.move);
    if (lidIn > 0) {
      const R2 = Math.max(SW, SH) * 0.55;
      r = mix(R2, 0, close);
      x = CX;
      y = CY;
      op = lidIn;
    }
    return { x, y, r, op, close, back, out };
  }

  function sceneRing(t) {
    const st = ringState(t);
    const vis = st.op > 0.003 && t > 3.1 && t < 21.4;
    S.ringSvg.style.display = vis ? '' : 'none';
    const dial = st.back * (1 - st.out);
    S.dialNames.forEach((el) => (dial > 0.01 ? null : hide(el)));
    if (!vis) {
      hide(S.score);
      return;
    }
    const strokeW = mix(4, 26, st.close); // الجفن يثقل وهو ينغلق
    for (const c of [S.ring, S.ring2, S.ringGlow]) {
      c.setAttribute('cx', f2(st.x));
      c.setAttribute('cy', f2(st.y));
    }
    S.ring.setAttribute('r', f2(Math.max(0.1, st.r)));
    S.ring.setAttribute('stroke-width', f2(strokeW));
    S.ring.setAttribute('opacity', f2(st.op));
    S.ringGlow.setAttribute('r', f2(Math.max(0.1, st.r)));
    S.ringGlow.setAttribute('opacity', f2(st.op * (0.6 + 0.4 * Math.sin(t * 3))));
    S.ring2.setAttribute('r', f2(st.r + 22));
    S.ring2.setAttribute('opacity', f2(st.op * (1 - st.close)));
    // التدريج: يدور ببطء (عدسة) ويسرع مع القرص
    const rot = dialRot(t);
    const tickOp = st.op * (1 - st.close);
    S.ticks.setAttribute('opacity', f2(tickOp));
    [...S.ticks.children].forEach((ln, i) => {
      const a = ((i * 3 + (t < 11.7 ? t * 6 : rot)) * Math.PI) / 180;
      const r0 = st.r + 34;
      const r1 = st.r + (i % 10 === 0 ? 50 : 42);
      ln.setAttribute('x1', f2(st.x + Math.sin(a) * r0));
      ln.setAttribute('y1', f2(st.y - Math.cos(a) * r0));
      ln.setAttribute('x2', f2(st.x + Math.sin(a) * r1));
      ln.setAttribute('y2', f2(st.y - Math.cos(a) * r1));
    });
    // المؤشّر أعلى القرص
    S.notch.setAttribute('transform', `translate(${f2(st.x)} ${f2(st.y - st.r - 72)})`);
    S.notch.setAttribute('opacity', f2(dial));
    // نقطة الجفن الأخيرة
    S.dot.setAttribute('cx', f2(st.x));
    S.dot.setAttribute('cy', f2(st.y));
    S.dot.setAttribute('r', f2(14 * P(t, 20.75, 21.0, E.out)));

    // أسماء الخطوط على القرص (قائمة) — الأقرب إلى المؤشّر يضيء
    if (dial > 0.01) {
      const step = 360 / DIAL.length;
      DIAL.forEach((_, i) => {
        const a = wrap(i * step - rot);
        const rad = (a * Math.PI) / 180;
        const near = clamp(1 - Math.abs(a) / step);
        const rr = st.r + L.nameOff;
        const el = S.dialNames[i];
        el.style.color = mixRGB([110, 110, 112], [244, 244, 244], near);
        set(el, {
          x: st.x + Math.sin(rad) * rr,
          y: st.y - Math.cos(rad) * rr,
          s: 1 + near * 0.25,
          op: dial * mix(0.75, 1, near),
        });
      });
    }
  }
  const wrap = (a) => ((((a + 180) % 360) + 360) % 360) - 180;
  /** دوران القرص: من 430° إلى 720° (قمرة أعلى عند الإقفال) — يتسارع قليلاً ثم يتباطأ طويلاً */
  const LOCK = 15.0;
  const DIAL_EASE = bezier(0.35, 0, 0.12, 1);
  const dialRot = (t) => mix(-430, 720, P(t, 11.9, LOCK, DIAL_EASE));

  /** 2) القزحية والجدار والتقاط الصورة */
  function sceneWall(t) {
    if (t < 3.1 || t > 8.4) {
      hide(S.wallDim, S.wallSharp, S.upload);
      S.caps.forEach((c) => c.hide());
      return;
    }
    const st = ringState(t);
    // الجدار ينساب حتى تستقرّ البلاطة الهدف في القزحية
    const k = P(t, 3.15, 7.0, E.move);
    const [ix, iy] = L.iris;
    const ox = mix(620, 0, k) + Math.sin(t * 0.7) * 10 * (1 - k);
    const oy = mix(-380, 0, k);
    const wx = ix - S.targetOff[0] + ox;
    const wy = iy - S.targetOff[1] + oy;
    const fade = P(t, 7.25, 7.8, E.sine);
    set(S.wallDim, { x: wx, y: wy, op: P(t, 3.1, 3.9, E.sine) * 0.17 * (1 - P(t, 6.8, 7.4, E.sine)), blur: 1.5 });
    S.wallSharp.style.clipPath = `circle(${f2(Math.max(0, st.r - 2))}px at ${f2(st.x - (wx - S.wallSize[0] / 2))}px ${f2(st.y - (wy - S.wallSize[1] / 2))}px)`;
    set(S.wallSharp, { x: wx, y: wy, op: P(t, 3.1, 3.75, E.sine) * (1 - fade) });
    // ومضة الغالق
    const flash = clamp(1 - Math.abs(t - 7.08) / 0.14);
    S.wallSharp.style.filter = flash > 0 ? `brightness(${f2(1 + flash * 0.9)})` : 'none';

    // التعليقات
    const windows = [
      [3.85, 4.45],
      [4.5, 5.1],
      [5.15, 5.75],
      [5.85, 6.85],
      [6.95, 7.6],
    ];
    S.caps.forEach((c, i) => {
      const [a, b] = windows[i];
      if (t < a - 0.35 || t > b + 0.3) return c.hide();
      const out = P(t, b, b + 0.25, E.in);
      c.render(stagger(t, a, c.items.length, 0.12, 0.45), { y: L.capY, op: 1 - out, blur: out * 10, dy: -out * 12 });
    });
    const u = span(t, 7.45, 7.8, 8.05, 8.35);
    set(S.upload, { y: L.capY + (1 - P(t, 7.45, 7.8)) * 14, op: u, blur: (1 - u) * 4 });
  }

  /** حالة «حكاية» عبر الزمن: من البلاطة ← البطل ← القرص ← العيّنة */
  function rigState(t) {
    const [ix, iy] = L.iris;
    const tileS = TW / 1200;
    let x = ix;
    let y = iy;
    let s = tileS;
    const grow = P(t, 7.45, 8.4, E.move);
    x = mix(x, L.hero[0], grow);
    y = mix(y, L.hero[1], grow);
    s = mix(s, L.hero[2], grow);
    const toDial = P(t, 11.6, 12.5, E.move);
    x = mix(x, L.dial[0], toDial);
    y = mix(y, L.dial[1] - 10, toDial);
    s = mix(s, L.dial[3], toDial);
    const toSpec = P(t, 15.9, 16.9, E.move);
    x = mix(x, L.specWord[0], toSpec);
    y = mix(y, L.specWord[1], toSpec);
    s = mix(s, L.specWord[2], toSpec);
    const out = P(t, 19.7, 20.2, E.in);
    return { x, y, s, op: P(t, 7.2, 7.42, E.sine) * (1 - out), blur: out * 12 };
  }

  /** 3–4) التفكيك والقرص */
  function sceneRig(t) {
    if (t < 7.2 || t > 20.3) {
      hide(S.rig, S.score, ...S.status);
      return;
    }
    const st = rigState(t);
    set(S.rig, st);
    // البلاطة تذوب: الحروف وحدها على الحبر (عزل)
    const iso = P(t, 8.45, 9.1, E.sine);
    S.rigBg.setAttribute('opacity', f2(1 - iso));

    // التفكيك: الحروف تنفصل وتطفو، ثم تعود
    const ex = P(t, 9.0, 9.9, E.move) * (1 - P(t, 11.0, 11.8, E.move));
    const n = S.glyphs.length;
    const DY = [-22, 16, -12, 20, -16];
    const lockK = P(t, LOCK, LOCK + 0.4, E.sine);
    S.glyphs.forEach((g, i) => {
      const dx = (i - (n - 1) / 2) * 120 * ex;
      const dy = DY[i % DY.length] * ex;
      const sc = 1 - 0.08 * ex;
      g.g.setAttribute(
        'transform',
        `translate(${f2(dx + g.c[0])} ${f2(dy + g.c[1])}) scale(${sc.toFixed(4)}) translate(${f2(-g.c[0])} ${f2(-g.c[1])})`,
      );
      const ann = P(t, 9.55 + (n - 1 - i) * 0.08, 9.95 + (n - 1 - i) * 0.08) * (1 - P(t, 10.85, 11.25, E.in));
      g.frame.setAttribute('opacity', f2(ann));
      g.dim.setAttribute('opacity', f2(ann));
      g.lab.setAttribute('opacity', f2(ann));
      // الحدّ والنقاط: يُرسمان على كل حرف من اليمين لليسار
      const tr = P(t, 9.7 + (n - 1 - i) * 0.12, 10.5 + (n - 1 - i) * 0.12, E.move);
      g.stroke.setAttribute('stroke-dashoffset', f2(1 - tr));
      g.stroke.setAttribute('opacity', f2(1 - lockK));
      g.nodes.setAttribute(
        'opacity',
        f2(P(t, 9.95 + (n - 1 - i) * 0.12, 10.35 + (n - 1 - i) * 0.12) * (1 - P(t, 14.6, 15.0, E.in))),
      );
    });
    // الامتلاء: يخفت إلى بصمة، يضيء حين يمرّ «قمرة» بالمؤشّر، ويعود كاملاً عند الإقفال
    const rot = dialRot(t);
    const step = 360 / DIAL.length;
    const dialIn = P(t, 11.9, 12.45, E.sine);
    const near = DIAL.map((_, i) => dialIn * clamp(1 - Math.abs(wrap(i * step - rot)) / step));
    const ghost = P(t, 10.6, 11.2, E.sine) * (1 - lockK);
    const fillOp = 1 - ghost * (1 - 0.1 - near[0] * 0.65);
    const fillCol = mixRGB([154, 154, 154], [255, 244, 236], 1 - ghost * (1 - lockK));
    S.glyphs.forEach((g) => {
      g.fillP.setAttribute('fill-opacity', f2(fillOp));
      g.fillP.setAttribute('fill', fillCol);
    });
    DIAL.forEach(([key], i) => {
      if (S.cand[key]) S.cand[key].setAttribute('opacity', f2(near[i] * 0.8 * (1 - lockK)));
    });

    // قراءة النسبة داخل القرص
    const dialVis = P(t, 12.2, 12.6) * (1 - P(t, 15.75, 16.1, E.in));
    if (dialVis > 0) {
      const wsum = near.reduce((a, b) => a + b, 0) || 1;
      const sc = Math.round(DIAL.reduce((a, [, , s], i) => a + s * near[i], 0) / wsum);
      S.score.querySelector('.n').textContent = String(sc);
      S.score.querySelector('.n').style.color = lockK > 0.5 ? COL.ok : COL.ink;
      S.score.querySelector('.lbl').textContent = lockK > 0.5 ? 'تطابق — وجدناه' : 'يقارن بخطوط مكتبة حرف';
      set(S.score, {
        x: L.dial[0],
        y: L.dial[1] + 175 * L.dial[3],
        op: dialVis,
        s: 1 + 0.08 * Math.sin(Math.PI * clamp((t - LOCK) / 0.45)),
      });
    } else hide(S.score);
    glow.style.opacity = f2(span(t, LOCK - 0.05, LOCK + 0.45, 15.7, 16.4) * 0.95);

    // سطر الحالة أثناء التفكيك
    const W2 = [
      [8.5, 8.85, 10.2, 10.45],
      [10.4, 10.75, 11.45, 11.7],
    ];
    S.status.forEach((el, i) => {
      const [a, b, c, d] = W2[i];
      if (t < a || t > d) return hide(el);
      const k = P(t, a, b);
      const o = P(t, c, d, E.in);
      set(el, { y: L.cap2Y + (1 - k) * 14 - o * 10, op: k * (1 - o), blur: (1 - k) * 8 + o * 8 });
    });
  }

  /** 5) صفحة العيّنة + النقر على «اختر الترخيص» */
  function sceneSpec(t) {
    const keys = ['kicker', 'name', 'sub', 'chips', 'abc', 'btns'];
    if (t < 16.2 || t > 20.4) {
      keys.forEach((k) => hide(S.sp[k]));
      hide(S.cur.el, S.cur.ring);
      return;
    }
    const out = P(t, 19.7, 20.15, E.in);
    const ys = VERTICAL ? [-40, 40, 125, 205, 300, 420] : [-40, 40, 120, 195, 290, 400];
    keys.forEach((k, i) => {
      const a = 16.45 + i * 0.09;
      const kk = P(t, a, a + 0.6);
      set(S.sp[k], {
        x: L.spec.x + (L.spec.align === 'center' ? 0 : (1 - kk) * -30),
        y: L.spec.nameY + ys[i] + (L.spec.align === 'center' ? (1 - kk) * 24 : 0),
        op: kk * (1 - out),
        blur: (1 - kk) * 8 + out * 10,
      });
    });
    // المؤشّر يتّجه إلى «اختر الترخيص»
    const r = S.ctaBtn.getBoundingClientRect();
    const target = [r.left + r.width * 0.45, r.top + r.height * 0.55];
    const reach = P(t, 18.2, 18.95, E.move);
    const start = [target[0] - 260, SH + 60];
    const pos = [mix(start[0], target[0], reach), mix(start[1], target[1], E.sine(reach))];
    drawCursor(S.cur, t, { pos, vis: P(t, 18.15, 18.35) * (1 - P(t, 19.55, 19.75, E.in)), click: 19.2 });
    const hov = P(t, 18.85, 19.05, E.sine);
    S.ctaBtn.style.background = mixRGB([223, 48, 51], [236, 59, 60], hov);
    S.ctaBtn.style.boxShadow = `0 ${f2(hov * 14)}px ${f2(hov * 36)}px rgb(236 59 60 / ${f2(hov * 0.45)})`;
  }

  /** 6) الجفن ← النقطة ← رمز حرف ← الشعار */
  function sceneLogo(t) {
    if (t < 20.85) return hide(S.mark, S.lockup, S.tagline, S.url);
    const m = P(t, 20.95, 21.45, E.move);
    const move = P(t, 21.6, 22.15, E.move);
    const wipe = P(t, 22.1, 22.8, E.move);
    const W = 760;
    const markCx = ((1127.53 + 275.63) / 1678.79) * W - W / 2;
    const markScale = ((551.26 / 1678.79) * W) / 200;
    const LY = L.logoY;
    const handoff = t >= 22.13;
    // النقطة (قطرها 28) تكبر حتى تصير الرمز (200)
    set(S.mark, {
      x: mix(CX, CX + markCx, move),
      y: mix(CY, LY, move),
      s: mix(28 / 200, 1, m) * mix(1, markScale, move),
      op: handoff ? 0 : P(t, 20.85, 21.0, E.lin),
    });
    S.lockup.style.clipPath = `inset(-2% -2% -2% ${f2(mix(67, -2, wipe))}%)`;
    set(S.lockup, { x: CX, y: LY, op: handoff ? 1 : 0 });
    const tg = P(t, 22.7, 23.25);
    set(S.tagline, { y: LY + 200 + (1 - tg) * 14, op: tg, blur: (1 - tg) * 8, s: VERTICAL ? 0.86 : 1 });
    const u = P(t, 23.0, 23.55);
    set(S.url, { y: LY + 262 + (1 - u) * 12, op: u, blur: (1 - u) * 6 });
  }

  /* ════════════════════════════════════════════════════════════════════════ */
  let built = false;
  window.init = () => {
    if (built) return;
    buildAyn();
    buildWall();
    buildRig();
    buildRing();
    buildUI();
    built = true;
    window.render(0);
  };
  window.DURATION = DURATION;
  window.render = (t) => {
    if (!built) window.init();
    sceneAyn(t);
    sceneWall(t);
    sceneRing(t);
    sceneRig(t);
    sceneSpec(t);
    sceneLogo(t);
  };
})();
