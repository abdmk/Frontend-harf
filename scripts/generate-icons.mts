// يولّد src/components/ui/icons/icons.generated.ts من طقم الأيقونات tools/icons/uicons.zip.
// الاستعمال:  pnpm icons   (يحتاج أداة unzip في النظام)
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

type IconNode = [tag: string, attrs: Record<string, string>];

const ZIP = new URL('../tools/icons/uicons.zip', import.meta.url).pathname;
const work = mkdtempSync(join(tmpdir(), 'harf-icons-'));
execFileSync('unzip', ['-q', ZIP, 'icons/*', '-d', work]);
const dir = join(work, 'icons');

// الاسم في الكود ← ملف الطقم. أضف هنا أي أيقونة جديدة ثم أعد التشغيل.
const MAP: Record<string, string> = {
  user: 'fi-rr-user',
  folder: 'fi-rr-folder',
  heart: 'fi-rr-heart',
  'heart-filled': 'fi-sr-heart',
  receipt: 'fi-rr-receipt',
  usage: 'fi-rr-signal-alt-2',
  crown: 'fi-rr-crown',
  apps: 'fi-rr-apps',
  sliders: 'fi-rr-settings-sliders',
  lock: 'fi-rr-lock',
  help: 'fi-rr-interrogation',
  'sign-out': 'fi-rr-sign-out-alt',
  layers: 'fi-rr-layers',
  'cloud-upload': 'fi-rr-cloud-upload',
  link: 'fi-rr-link',
  info: 'fi-rr-info',
  trash: 'fi-rr-trash',
  cross: 'fi-rr-cross',
  'cross-small': 'fi-rr-cross-small',
  check: 'fi-rr-check',
  search: 'fi-rr-search',
  filter: 'fi-rr-filter',
  flame: 'fi-rr-flame',
  'time-past': 'fi-rr-time-past',
  clock: 'fi-rr-clock',
  download: 'fi-rr-download',
  cart: 'fi-rr-shopping-cart',
  bell: 'fi-rr-bell',
  moon: 'fi-rr-moon',
  sun: 'fi-rr-sun',
  'chevron-down': 'fi-rr-angle-small-down',
  'chevron-up': 'fi-rr-angle-small-up',
  'chevron-left': 'fi-rr-angle-small-left',
  'chevron-right': 'fi-rr-angle-small-right',
  expand: 'fi-rr-expand',
  copy: 'fi-rr-copy',
  refresh: 'fi-rr-refresh',
  palette: 'fi-rr-palette',
  text: 'fi-rr-text',
  'align-left': 'fi-rr-align-left',
  'align-right': 'fi-rr-align-right',
  'align-center': 'fi-rr-align-center',
  'align-justify': 'fi-rr-align-justify',
  interlining: 'fi-rr-interlining',
  star: 'fi-rr-star',
  gem: 'fi-rr-gem',
  'chart-histogram': 'fi-rr-chart-histogram',
};

const out: Record<string, { viewBox: string; nodes: IconNode[] }> = {};
for (const [name, file] of Object.entries(MAP)) {
  const svg = readFileSync(join(dir, file + '.svg'), 'utf8');
  const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1] ?? '0 0 24 24';
  const body = svg.replace(/<defs>[\s\S]*?<\/defs>/g, '');
  const nodes: IconNode[] = [];
  for (const m of body.matchAll(/<(path|rect|circle|ellipse|polygon)\b([^>]*?)\/?>/g)) {
    const attrs: Record<string, string> = {};
    for (const a of m[2].matchAll(/([a-zA-Z-]+)="([^"]*)"/g)) {
      const k = a[1];
      if (k === 'fill' || k === 'clip-path' || k === 'xmlns') continue;
      attrs[k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = a[2];
    }
    nodes.push([m[1], attrs]);
  }
  if (!nodes.length) throw new Error('no shapes in ' + file);
  out[name] = { viewBox, nodes };
}

const pascal = (n: string) => n.replace(/(^|-)([a-z])/g, (_, __, c: string) => c.toUpperCase()) + 'Icon';
const lines = Object.entries(out).map(
  ([name, { viewBox, nodes }]) =>
    `export const ${pascal(name)} = /*#__PURE__*/ createIcon('${name}', '${viewBox}', ${JSON.stringify(nodes)});`,
);
const ts = `// ⚠️ ملف مولَّد — لا تعدّله يدوياً. المصدر: tools/icons/uicons.zip، والمولّد: scripts/generate-icons.mts
// كل أيقونة تصدير مستقلّ، فلا يدخل الحزمة إلا ما يُستعمل فعلاً.
import { createIcon } from './create-icon';

${lines.join('\n')}
`;
writeFileSync(new URL('../src/components/ui/icons/icons.generated.ts', import.meta.url), ts);
rmSync(work, { recursive: true, force: true });
console.log('icons:', Object.keys(out).length);
