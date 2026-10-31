/**
 * يلتقط فيديوهات العرض إطاراً إطاراً من promo/<comp>/index.html ويرمّزها بـffmpeg.
 *
 *   node promo/render.mjs --comp ayn                   # «عين» v2 — 1080p60 → promo/ayn/out/ayn.mp4
 *   node promo/render.mjs --comp ayn-iris              # «عين» — نسخة القزحية
 *   node promo/render.mjs --comp ayn --preview         # معاينة سريعة 960px / 30fps
 *   node promo/render.mjs --comp ayn --from 9 --to 15  # مقطع فقط
 *   node promo/render.mjs --comp ayn --stills 3.2,10.5 # صور ثابتة PNG لأزمنة محدّدة
 *   node promo/render.mjs --comp ayn --format vertical # النسخة الطولية 9:16 (1080×1920)
 *   node promo/render.mjs --comp ayn --scale 2         # 4K (3840×2160، أو 2160×3840 للطولي)
 *
 * كل تكوين يصف الكلمات والخطوط التي يحتاج مخطّطاتها في promo/<comp>/glyphs.json.
 *
 * كل إطار يُلتقط مباشرة (60fps) — لا دمج إطارات: الدمج يترك صوراً مزدوجة على العناصر السريعة.
 * الخطوط والأيقونات والشعار تُقرأ من ملفات الموقع نفسها (لا نسخ مكرّرة)، ومخطّطات الحروف
 * تُستخرج من ملفات الخطوط نفسها بـfontkit (التشكيل العربي الحقيقي) لمشهد «قراءة الحروف».
 */
import { spawn } from 'node:child_process';
import { readFileSync, mkdirSync, existsSync, statSync, createReadStream } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as fontkit from 'fontkit';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const PROMO = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(PROMO, '..');

/* ── الخيارات ── */
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i < 0 ? def : args[i + 1];
};
const flag = (name) => args.includes(`--${name}`);
const comp = opt('comp', 'ayn');
if (!/^[a-z0-9-]+$/.test(comp) || !existsSync(join(PROMO, comp, 'index.html'))) {
  console.error(`لا يوجد تكوين باسم «${comp}» في promo/`);
  process.exit(1);
}
const HERE = join(PROMO, comp);
const OUT = join(HERE, 'out');
const preview = flag('preview');
const stills = opt('stills', null);
const vertical = opt('format', 'horizontal') === 'vertical';
const [baseW, baseH] = vertical ? [1080, 1920] : [1920, 1080];
// المقياس: 2 = 4K. التخطيط يبقى بالبكسلات الأساسية، والمتصفّح يرسم كل شيء (نصوص وSVG) بدقّة أعلى
const scale = Number(opt('scale', preview ? 0.5 : 1));
const tag = `${vertical ? '-vertical' : ''}${scale === 2 ? '-4k' : ''}`;
const outFps = Number(opt('fps', preview ? 30 : 60));

/* ── الأيقونات والشعار من مصادر الموقع ── */
function readIcons() {
  const src = readFileSync(join(ROOT, 'src/components/ui/icons/icons.generated.ts'), 'utf8');
  const icons = {};
  const re = /export const (\w+) = \/\*#__PURE__\*\/ createIcon\('[^']+', '([^']+)', (.+)\);$/gm;
  for (const m of src.matchAll(re)) {
    const [outline, filled] = JSON.parse(`[${m[3]}]`);
    icons[m[1]] = { vb: m[2], outline, filled };
  }
  return icons;
}
function readLogo() {
  const src = readFileSync(join(ROOT, 'src/components/shared/harf-logo.tsx'), 'utf8');
  const svgOf = (fn) => {
    const body = src.slice(src.indexOf(`function ${fn}`));
    const vb = body.match(/viewBox="([^"]+)"/)[1];
    const inner = body.slice(body.indexOf('>', body.indexOf('<svg')) + 1, body.indexOf('</svg>'));
    return `<svg viewBox="${vb}" fill="currentColor" xmlns="http://www.w3.org/2000/svg">${inner.trim()}</svg>`;
  };
  return { lockup: svgOf('HarfLockup'), mark: svgOf('HarfMark') };
}

/* ── مخطّطات الكلمات: مسار SVG لكل محرف، الإطار، ونقاط المنحنيات ──
   الإحداثيات بوحدات الخط، والمحور الرأسي للأسفل (كـSVG)، وخط الأساس عند y=0.
   glyphs.json: إمّا { word, fonts } ← GLYPHS[font]، أو { words: { key: { text, fonts } } } ← GLYPHS[key][font] */
function outline(file, text) {
  // الخطوط المتغيّرة بنسختها الافتراضية — نسخ fontkit المتغيّرة لملفات woff2 تفقد cmap والمحارف
  const font = fontkit.openSync(join(ROOT, 'src/assets/fonts/library', file));
  const run = font.layout(text);
  const paths = [];
  const nodes = [];
  const glyphs = [];
  const box = [Infinity, Infinity, -Infinity, -Infinity];
  const grow = (b, p) => {
    b[0] = Math.min(b[0], p[0]);
    b[1] = Math.min(b[1], p[1]);
    b[2] = Math.max(b[2], p[0]);
    b[3] = Math.max(b[3], p[1]);
  };
  let x = 0;
  run.glyphs.forEach((g, i) => {
    const pos = run.positions[i];
    const ox = x + pos.xOffset;
    const oy = pos.yOffset;
    const P = (px, py) => [+(ox + px).toFixed(1), +(-(oy + py)).toFixed(1)];
    const gb = [Infinity, Infinity, -Infinity, -Infinity];
    const gn = [];
    let d = '';
    for (const c of g.path.commands) {
      const a = c.args;
      if (c.command === 'closePath') {
        d += 'Z';
        continue;
      }
      const pts = [];
      for (let k = 0; k < a.length; k += 2) pts.push(P(a[k], a[k + 1]));
      const cmd = { moveTo: 'M', lineTo: 'L', quadraticCurveTo: 'Q', bezierCurveTo: 'C' }[c.command];
      d += cmd + pts.map((p) => p.join(' ')).join(' ');
      pts.forEach((p, k) => {
        const n = [p[0], p[1], k === pts.length - 1 ? 1 : 0];
        nodes.push(n);
        gn.push(n);
        grow(box, p);
        grow(gb, p);
      });
    }
    if (d) {
      paths.push(d);
      glyphs.push({ d, bbox: gb, nodes: gn });
    }
    x += pos.xAdvance;
  });
  if (!paths.length) throw new Error(`لا مخطّطات لـ«${text}» في ${file}`);
  return { paths, nodes, glyphs, bbox: box, upem: font.unitsPerEm };
}
function readGlyphs() {
  const spec = JSON.parse(readFileSync(join(HERE, 'glyphs.json'), 'utf8'));
  const set = ({ text, fonts }) => Object.fromEntries(Object.entries(fonts).map(([k, f]) => [k, outline(f, text)]));
  if (spec.word) return set({ text: spec.word, fonts: spec.fonts });
  return Object.fromEntries(Object.entries(spec.words).map(([k, w]) => [k, set(w)]));
}

/* ── خادم ثابت محلي محصور في جذر المستودع ── */
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
};
function serve() {
  return new Promise((ok) => {
    const server = createServer((req, res) => {
      const path = normalize(join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
      if (!path.startsWith(ROOT + sep) || !existsSync(path) || !statSync(path).isFile()) {
        res.writeHead(404).end();
        return;
      }
      res.writeHead(200, { 'Content-Type': TYPES[extname(path)] ?? 'application/octet-stream' });
      createReadStream(path).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => ok(server));
  });
}

const server = await serve();
const port = server.address().port;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: baseW, height: baseH }, deviceScaleFactor: scale });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.addInitScript(
  ([icons, logo, glyphs]) => {
    window.ICONS = icons;
    window.HARF_LOGO = logo;
    window.GLYPHS = glyphs;
  },
  [readIcons(), readLogo(), readGlyphs()],
);
await page.goto(`http://127.0.0.1:${port}/promo/${comp}/index.html${vertical ? '?format=vertical' : ''}`, {
  waitUntil: 'networkidle',
});

// كل خط مطلوب يجب أن يُحمَّل فعلاً قبل الإطار الأول — لا إطار بخط بديل
const missing = await page.evaluate(async () => {
  const sample = 'عصري حرف ABC 0123';
  const bad = [];
  for (const f of window.REQUIRED_FONTS) {
    const faces = await document.fonts.load(f, sample);
    if (!faces.length) bad.push(f);
  }
  await document.fonts.ready;
  window.init();
  return bad;
});
if (missing.length) {
  console.error('خطوط لم تُحمَّل:', missing);
  process.exit(1);
}
if (errors.length) {
  console.error('أخطاء في الصفحة:', errors);
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
const duration = await page.evaluate(() => window.DURATION);
const shot = (t) => page.evaluate((x) => window.render(x), t).then(() => page.screenshot({ type: 'png' }));

if (stills) {
  for (const s of stills.split(',')) {
    const t = Number(s);
    const file = join(OUT, `still${tag}-${t.toFixed(2)}.png`);
    await page.evaluate((x) => window.render(x), t);
    await page.screenshot({ path: file });
    console.log(file);
  }
} else {
  const from = Number(opt('from', 0));
  const to = Math.min(Number(opt('to', duration)), duration);
  const name = opt(
    'out',
    preview
      ? `preview${tag}.mp4`
      : from === 0 && to === duration
        ? `${comp}${tag}.mp4`
        : `${comp}${tag}-${from}-${to}.mp4`,
  );
  const file = join(OUT, name);
  const vf = 'format=yuv420p';
  const ff = spawn(
    'ffmpeg',
    [
      '-y',
      '-loglevel',
      'error',
      '-f',
      'image2pipe',
      '-framerate',
      String(outFps),
      '-i',
      '-',
      '-vf',
      vf,
      '-c:v',
      'libx264',
      '-preset',
      preview ? 'veryfast' : 'slow',
      '-crf',
      preview ? '23' : '16',
      '-r',
      String(outFps),
      '-movflags',
      '+faststart',
      file,
    ],
    { stdio: ['pipe', 'inherit', 'inherit'] },
  );
  const frames = Math.round((to - from) * outFps);
  const started = Date.now();
  for (let i = 0; i < frames; i++) {
    const buf = await shot(from + i / outFps);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 240 === 0) console.log(`إطار ${i}/${frames} (${((Date.now() - started) / 1000).toFixed(0)}ث)`);
  }
  ff.stdin.end();
  await new Promise((r, j) => ff.on('close', (c) => (c === 0 ? r() : j(new Error(`ffmpeg ${c}`)))));
  console.log(file);
}

if (errors.length) console.error('أخطاء في الصفحة:', errors);
await browser.close();
server.close();
