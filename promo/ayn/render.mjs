/**
 * يلتقط فيديو «عين» إطاراً إطاراً من index.html ويرمّزه بـffmpeg.
 *
 *   node promo/ayn/render.mjs                       # الفيديو كاملاً 1080p30 → promo/ayn/out/ayn.mp4
 *   node promo/ayn/render.mjs --preview             # معاينة سريعة 960px / 15fps
 *   node promo/ayn/render.mjs --from 9 --to 15      # مقطع فقط
 *   node promo/ayn/render.mjs --stills 3.2,10.5     # صور ثابتة PNG لأزمنة محدّدة
 *
 * يُلتقط بـ30 إطاراً مباشرة. ‎--blend يلتقط بـ60 ويدمج كل إطارين — لكنه يترك صوراً مزدوجة على
 * العناصر السريعة (العدّاد، البطاقات المنزلقة)، فلا يُستعمل افتراضياً؛ الضبابية مرسومة في المشاهد نفسها.
 * الخطوط والأيقونات والشعار تُقرأ من ملفات الموقع نفسها (لا نسخ مكرّرة).
 */
import { spawn } from 'node:child_process';
import { readFileSync, mkdirSync, existsSync, statSync, createReadStream } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const OUT = join(HERE, 'out');

/* ── الخيارات ── */
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i < 0 ? def : args[i + 1];
};
const flag = (name) => args.includes(`--${name}`);
const preview = flag('preview');
const stills = opt('stills', null);
const width = Number(opt('width', preview ? 960 : 1920));
const outFps = Number(opt('fps', preview ? 15 : 30));
const blend = !preview && flag('blend');
const captureFps = blend ? outFps * 2 : outFps;

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
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: width / 1920 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.addInitScript(
  ([icons, logo]) => {
    window.ICONS = icons;
    window.HARF_LOGO = logo;
  },
  [readIcons(), readLogo()],
);
await page.goto(`http://127.0.0.1:${port}/promo/ayn/index.html`, { waitUntil: 'networkidle' });

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
    const file = join(OUT, `still-${t.toFixed(2)}.png`);
    await page.evaluate((x) => window.render(x), t);
    await page.screenshot({ path: file });
    console.log(file);
  }
} else {
  const from = Number(opt('from', 0));
  const to = Math.min(Number(opt('to', duration)), duration);
  const name = opt(
    'out',
    preview ? 'preview.mp4' : from === 0 && to === duration ? 'ayn.mp4' : `ayn-${from}-${to}.mp4`,
  );
  const file = join(OUT, name);
  const vf = [blend ? `tmix=frames=2:weights='1 1',fps=${outFps}` : null, 'format=yuv420p'].filter(Boolean).join(',');
  const ff = spawn(
    'ffmpeg',
    [
      '-y',
      '-loglevel',
      'error',
      '-f',
      'image2pipe',
      '-framerate',
      String(captureFps),
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
  const frames = Math.round((to - from) * captureFps);
  const started = Date.now();
  for (let i = 0; i < frames; i++) {
    const buf = await shot(from + i / captureFps);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 120 === 0) console.log(`إطار ${i}/${frames} (${((Date.now() - started) / 1000).toFixed(0)}ث)`);
  }
  ff.stdin.end();
  await new Promise((r, j) => ff.on('close', (c) => (c === 0 ? r() : j(new Error(`ffmpeg ${c}`)))));
  console.log(file);
}

if (errors.length) console.error('أخطاء في الصفحة:', errors);
await browser.close();
server.close();
