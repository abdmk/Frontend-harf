// يولّد «مخطوطات» تجريبية بصيغة SVG متجهة من خطوط مكتبة حرف المجانية (SIL OFL) —
// النص يُشكَّل بـfontkit (وصل، لام-ألف، أشكال سياقية) ثم يُحوَّل إلى مسارات. الخطوط OFL تسمح
// باستعمال رسومها في الأعمال الفنية. (خطوط تعتمد الوصل curs مثل «رقّاص» لا تُستعمل: fontkit لا يطبّقه كاملاً.) هذه نماذج عرض حتى تُرفع المخطوطات الحقيقية.
// الاستعمال:  node scripts/generate-manuscripts.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

import { unzipSync } from 'fflate';
import * as fontkit from 'fontkit';

const OUT = 'public/manuscripts';
mkdirSync(OUT, { recursive: true });

/** يفتح خطاً من حزمة ZIP؛ للخطوط المتغيّرة يثبّت الوزن المطلوب */
function font(pkg, match, wght) {
  const files = unzipSync(new Uint8Array(readFileSync(`public/downloads/fonts/${pkg}.zip`)));
  const [, data] = Object.entries(files).find(([n]) => n.endsWith('.ttf') && n.includes(match));
  const f = fontkit.create(Buffer.from(data));
  return wght && Object.keys(f.variationAxes).includes('wght') ? f.getVariation({ wght }) : f;
}

const FONTS = {
  ruqaa: { f: font('aref-ruqaa', 'Bold'), name: 'عارف رقعة', id: 'aref-ruqaa' },
  kufi: { f: font('reem-kufi', 'ReemKufi', 700), name: 'ريم كوفي', id: 'reem-kufi' },
  lalezar: { f: font('lalezar', 'Lalezar'), name: 'لاله‌زار', id: 'lalezar' },
  marhey: { f: font('marhey', 'Marhey', 700), name: 'مرحي', id: 'marhey' },
  messiri: { f: font('el-messiri', 'ElMessiri', 700), name: 'المسيري', id: 'el-messiri' },
  amiri: { f: font('amiri', 'Amiri-Bold'), name: 'أميري', id: 'amiri' },
  changa: { f: font('changa', 'Changa', 800), name: 'شنقا', id: 'changa' },
  naskh: { f: font('scheherazade', 'Bold'), name: 'شهرزاد', id: 'scheherazade' },
};

/** سطر مشكَّل: مسار واحد وعرضه — الترتيب البصري من اليمين */
function line(f, text) {
  const run = f.layout(text, undefined, 'arab', undefined, 'rtl');
  // fontkit يعيد المحارف بالترتيب البصري (من اليسار) — فالقلم يتقدّم يساراً→يميناً كما هي
  // (مُتحقَّق بمقارنة مباشرة مع رسم المتصفّح للنص نفسه)
  let x = 0;
  let d = '';
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < run.glyphs.length; i++) {
    const g = run.glyphs[i];
    const p = run.positions[i];
    d += g.path.translate(x + p.xOffset, p.yOffset).toSVG();
    const bb = g.bbox;
    if (Number.isFinite(bb.minY)) {
      minY = Math.min(minY, bb.minY + p.yOffset);
      maxY = Math.max(maxY, bb.maxY + p.yOffset);
    }
    x += p.xAdvance;
  }
  const width = x;
  return { d, width, minY, maxY };
}

/**
 * تركيب: أسطر متراكبة بمقاسات مختلفة (سطر رئيسي كبير وأسطر مرافقة أصغر)، ممركزة.
 * `lines`: [text, fontKey, scale]
 */
function compose(lines, { gap = 0.18 } = {}) {
  const parts = lines.map(([text, key, scale = 1]) => ({
    ...line(FONTS[key].f, text),
    scale,
    upm: FONTS[key].f.unitsPerEm,
  }));
  const width = Math.max(...parts.map((p) => (p.width / p.upm) * 1000 * p.scale));
  let y = 0;
  const groups = [];
  for (const p of parts) {
    const k = (1000 / p.upm) * p.scale;
    const h = (p.maxY - p.minY) * k;
    const x = (width - p.width * k) / 2;
    // الإحداثيات: y للأسفل في SVG؛ نقلب رسم الخط ونضع أعلى السطر عند y
    groups.push(
      `<path transform="translate(${x.toFixed(1)} ${(y + p.maxY * k).toFixed(1)}) scale(${k.toFixed(4)} ${(-k).toFixed(4)})" d="${p.d}"/>`,
    );
    y += h + 1000 * gap * p.scale;
  }
  const height = y - 1000 * gap * parts.at(-1).scale;
  const pad = width * 0.06;
  const W = Math.round(width + pad * 2);
  const H = Math.round(height + pad * 2);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${(-pad).toFixed(0)} ${(-pad).toFixed(0)} ${W} ${H}" width="${W}" height="${H}">` +
    `<g fill="#111">${groups.join('')}</g></svg>`;
  return { svg, width: W, height: H };
}

// [id, العنوان, التصنيف, الأسطر]
const WORKS = [
  ['bismillah', 'بسم الله الرحمن الرحيم', 'islamic', [['بسم الله الرحمن الرحيم', 'amiri']]],
  [
    'ramadan-kareem',
    'رمضان كريم',
    'ramadan',
    [
      ['رمضان', 'ruqaa', 1.4],
      ['كريم', 'ruqaa', 0.9],
    ],
  ],
  ['eid-mubarak', 'عيد مبارك', 'eid', [['عيد مبارك', 'lalezar']]],
  [
    'mawlid',
    'المولد النبوي الشريف',
    'islamic',
    [
      ['المولد النبوي', 'ruqaa', 1.2],
      ['الشريف', 'messiri', 0.6],
    ],
  ],
  [
    'jumua',
    'جمعة مباركة',
    'islamic',
    [
      ['جمعة', 'kufi', 1.5],
      ['مباركة', 'kufi', 0.8],
    ],
  ],
  [
    'hijri',
    'عام هجري سعيد',
    'islamic',
    [
      ['عام هجري', 'marhey'],
      ['سعيد', 'marhey', 1.3],
    ],
  ],
  ['mabrook', 'ألف مبروك', 'greetings', [['ألف مبروك', 'lalezar']]],
  ['alhamdulillah', 'الحمد لله', 'islamic', [['الحمد لله', 'ruqaa']]],
  ['ramadan-mubarak', 'رمضان مبارك', 'ramadan', [['رمضان مبارك', 'changa']]],
  [
    'taqabbal',
    'تقبّل الله منّا ومنكم',
    'eid',
    [
      ['تقبل الله', 'amiri', 1.1],
      ['منا ومنكم', 'amiri', 0.8],
    ],
  ],
  [
    'muhammad',
    'محمد رسول الله',
    'islamic',
    [
      ['محمد', 'ruqaa', 1.8],
      ['رسول الله', 'ruqaa', 0.9],
    ],
  ],
  ['mashallah', 'ما شاء الله', 'islamic', [['ما شاء الله', 'lalezar']]],
  [
    'ahlan',
    'أهلاً وسهلاً',
    'greetings',
    [
      ['أهلاً', 'marhey', 1.4],
      ['وسهلاً', 'marhey'],
    ],
  ],
  [
    'kul-am',
    'كل عام وأنتم بخير',
    'eid',
    [
      ['كل عام', 'kufi'],
      ['وأنتم بخير', 'kufi'],
    ],
  ],
  ['tawakkalt', 'توكّلت على الله', 'islamic', [['توكّلت على الله', 'naskh']]],
  [
    'ahlan-ramadan',
    'أهلاً رمضان',
    'ramadan',
    [
      ['أهلاً', 'lalezar', 0.8],
      ['رمضان', 'lalezar', 1.5],
    ],
  ],
  ['saat-istijaba', 'ساعة استجابة', 'islamic', [['ساعة استجابة', 'ruqaa']]],
  [
    'shukran',
    'شكراً لكم',
    'greetings',
    [
      ['شكراً', 'changa', 1.5],
      ['لكم', 'changa', 0.8],
    ],
  ],
  [
    'subhan',
    'سبحان الله وبحمده',
    'islamic',
    [
      ['سبحان الله', 'amiri', 1.2],
      ['وبحمده', 'amiri', 0.9],
    ],
  ],
  [
    'national-day',
    'يوم وطني سعيد',
    'national',
    [
      ['يوم وطني', 'messiri', 1.2],
      ['سعيد', 'messiri', 0.9],
    ],
  ],
  [
    'eid-saeed',
    'عيدكم سعيد',
    'eid',
    [
      ['عيدكم', 'ruqaa', 1.3],
      ['سعيد', 'ruqaa'],
    ],
  ],
  [
    'ilm',
    'وقل ربّ زدني علماً',
    'islamic',
    [
      ['وقل ربّ', 'naskh'],
      ['زدني علماً', 'naskh', 1.2],
    ],
  ],
  ['hayyakum', 'حيّاكم الله', 'greetings', [['حيّاكم الله', 'lalezar']]],
  [
    'usr-yusr',
    'إنّ مع العسر يسراً',
    'islamic',
    [
      ['إنّ مع', 'kufi', 0.8],
      ['العسر', 'kufi', 1.3],
      ['يسراً', 'kufi', 1.3],
    ],
  ],
  [
    'teachers',
    'يوم المعلّم',
    'greetings',
    [
      ['يوم', 'marhey', 0.8],
      ['المعلّم', 'marhey', 1.4],
    ],
  ],
  [
    'talaa-albadr',
    'طلع البدر علينا',
    'islamic',
    [
      ['طلع البدر', 'amiri', 1.2],
      ['علينا', 'amiri'],
    ],
  ],
  [
    'ramadan-yajmaona',
    'اللهم بلّغنا رمضان',
    'ramadan',
    [
      ['اللهم بلّغنا', 'naskh'],
      ['رمضان', 'naskh', 1.6],
    ],
  ],
  [
    'najah',
    'نجاح مبارك',
    'greetings',
    [
      ['نجاح', 'lalezar', 1.5],
      ['مبارك', 'lalezar'],
    ],
  ],
  ['jumua-2', 'جمعة طيّبة', 'islamic', [['جمعة طيّبة', 'marhey']]],
  [
    'hijri-1448',
    'سنة هجرية مباركة',
    'islamic',
    [
      ['سنة هجرية', 'ruqaa'],
      ['مباركة', 'ruqaa', 1.2],
    ],
  ],
  ['mothers', 'يوم الأمّ', 'greetings', [['يوم الأمّ', 'ruqaa']]],
  ['la-ilaha', 'لا إله إلا الله', 'islamic', [['لا إله إلا الله', 'kufi']]],
  [
    'eid-adha',
    'عيد أضحى مبارك',
    'eid',
    [
      ['عيد أضحى', 'changa', 1.1],
      ['مبارك', 'changa', 1.1],
    ],
  ],
  [
    'salli',
    'اللهم صلّ على محمد',
    'islamic',
    [
      ['اللهم صلّ', 'messiri'],
      ['على محمد', 'messiri', 1.2],
    ],
  ],
  [
    'marhaba',
    'مرحباً بكم',
    'greetings',
    [
      ['مرحباً', 'lalezar', 1.3],
      ['بكم', 'lalezar', 0.9],
    ],
  ],
  [
    'barakallah',
    'بارك الله فيك',
    'greetings',
    [
      ['بارك الله', 'amiri', 1.2],
      ['فيك', 'amiri', 1.2],
    ],
  ],
  ['aash-alwatan', 'عاش الوطن', 'national', [['عاش الوطن', 'kufi']]],
  [
    'kul-am-watan',
    'كل عام والوطن بخير',
    'national',
    [
      ['كل عام', 'messiri', 0.9],
      ['والوطن بخير', 'messiri', 1.2],
    ],
  ],
  ['watani', 'وطني', 'national', [['وطني', 'ruqaa', 1.6]]],
  ['yawm-alwatan', 'يوم الوطن', 'national', [['يوم الوطن', 'lalezar']]],
  [
    'fakhoon',
    'فخورون بك يا وطن',
    'national',
    [
      ['فخورون بك', 'marhey', 1.1],
      ['يا وطن', 'marhey', 1.3],
    ],
  ],
  ['alwatan-awalan', 'الوطن أولاً', 'national', [['الوطن أولاً', 'changa']]],
];

const manifest = [];
for (const [id, title, category, lines] of WORKS) {
  const { svg, width, height } = compose(lines);
  writeFileSync(`${OUT}/${id}.svg`, svg);
  const fonts = [...new Set(lines.map(([, k]) => k))].map((k) => ({ id: FONTS[k].id, name: FONTS[k].name }));
  manifest.push({ id, title, category, width, height, bytes: Buffer.byteLength(svg), fonts });
}
writeFileSync('src/mocks/manuscripts.data.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`${manifest.length} works, ${(manifest.reduce((s, m) => s + m.bytes, 0) / 1024).toFixed(0)} KB`);
