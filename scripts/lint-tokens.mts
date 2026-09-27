// يفحص أنّ المكوّنات تستعمل رموز التصميم بدل القيم الثابتة.
// الاستعمال:  pnpm lint:tokens
// الاستثناء لسطر بعينه: أضف التعليق  tokens-ignore  مع سبب واضح.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src');
const SKIP = [/^src\/design-system\//, /^src\/mocks\//, /icons\.generated\.ts$/, /\.test\.tsx?$/];

const RADII = new Set(['8', '12', '16', '22', '28']);
const RULES: { re: RegExp; message: (m: RegExpExecArray) => string | null }[] = [
  {
    // ألوان hex مباشرة
    re: /#[0-9a-fA-F]{3,8}(?![\w-])/g,
    message: (m) => `لون ثابت ${m[0]} — استعمل رمزاً من tokens.css`,
  },
  {
    re: /\b(?:rgba?|hsla?|oklch)\(/g,
    message: () => 'لون بدالة ثابتة — استعمل رمزاً من tokens.css',
  },
  {
    // أحجام خطّ عشوائية
    re: /\btext-\[(?:[\d.]+px|clamp)[^\]]*\]/g,
    message: (m) => `حجم خطّ عشوائي ${m[0]} — استعمل text-micro/caption/meta/control/lead…`,
  },
  {
    // مسافات وأحجام بالبكسل لها مقابل في سلّم المسافات (كل 1px = 0.25)
    re: /\b(?:size|h|w|min-w|min-h|max-h|max-w|p[xytbse]?|m[xytbse]?|gap(?:-[xy])?|top|bottom|start|end|inset)-\[(\d+)px\]/g,
    message: (m) => `${m[0]} — استعمل ${m[0].split('-[')[0]}-${Number(m[1]) / 4}`,
  },
  {
    re: /\brounded(?:-[a-z]+)?-\[(\d+)px\]/g,
    message: (m) => (RADII.has(m[1]) ? `${m[0]} — استعمل رمز الحافة المقابل (xs/sm/md/lg/xl)` : null),
  },
];

function* walk(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (/\.(tsx?|css)$/.test(name)) yield p;
  }
}

let problems = 0;
for (const file of walk(SRC)) {
  const rel = relative(ROOT, file);
  if (SKIP.some((r) => r.test(rel))) continue;
  // globals.css يحتوي أساسات الصفحة فقط؛ الألوان فيه يجب أن تكون متغيّرات أيضاً
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (line.includes('tokens-ignore')) return;
      for (const { re, message } of RULES) {
        for (const m of line.matchAll(re)) {
          const msg = message(m as RegExpExecArray);
          if (!msg) continue;
          problems++;
          console.log(`${rel}:${i + 1}  ${msg}`);
        }
      }
    });
}

if (problems) {
  console.log(`\n✖ ${problems} مخالفة لرموز التصميم`);
  process.exit(1);
}
console.log('✓ لا قيم ثابتة خارج رموز التصميم');
