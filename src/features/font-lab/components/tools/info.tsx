import { Button } from '@/components/ui/button';
import { CopyIcon, DownloadIcon, LinkIcon, PictureIcon } from '@/components/ui/icons';
import { toast } from '@/components/ui/toast';

import { libraryPackage } from '../../api/library';
import { featureSettings } from '../../data/features';
import { useLab } from '../../hooks/lab-context';
import type { LabFont } from '../../types';
import { InfoRows, Panel } from '../bits';

const kb = (n: number) => `${(n / 1024).toLocaleString('en-US', { maximumFractionDigits: 1 })} KB`;

function copy(text: string, title: string) {
  navigator.clipboard.writeText(text).then(
    () => toast({ tone: 'success', title }),
    () => toast({ tone: 'danger', title: 'تعذّر النسخ' }),
  );
}

function download(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const base = (f: LabFont) => f.fileName.replace(/\.[^.]+$/, '');

export function Info() {
  const { active, settings } = useLab();
  if (!active) return null;
  const f = active;
  const css = featureSettings(
    f.features.map((x) => x.tag),
    settings.features,
  );
  const variation = f.axes
    .filter((a) => a.tag !== 'wght')
    .map((a) => `"${a.tag}" ${settings.axes[a.tag] ?? a.default}`)
    .join(', ');
  const wght = f.axes.find((a) => a.tag === 'wght');
  const fontFace = [
    '@font-face {',
    `  font-family: '${f.family}';`,
    `  src: url('./${f.fileName}') format('${{ OTF: 'opentype', TTF: 'truetype', WOFF: 'woff', WOFF2: 'woff2', TTC: 'collection' }[f.format]}');`,
    `  font-weight: ${wght ? `${wght.min} ${wght.max}` : f.weight};`,
    `  font-style: ${f.italic ? 'italic' : 'normal'};`,
    '  font-display: swap;',
    '}',
    '',
    `.text {`,
    `  font-family: '${f.family}', sans-serif;`,
    ...(css !== 'normal' ? [`  font-feature-settings: ${css};`] : []),
    ...(variation ? [`  font-variation-settings: ${variation};`] : []),
    '}',
  ].join('\n');

  const json = () =>
    download(
      `${base(f)}.json`,
      new Blob(
        [
          JSON.stringify(
            {
              file: f.fileName,
              bytes: f.bytes,
              format: f.format,
              outline: f.outline,
              names: Object.fromEntries(f.names.map((n) => [n.label, n.value])),
              unitsPerEm: f.unitsPerEm,
              metrics: f.metrics,
              glyphs: f.glyphCount,
              codepoints: f.codepoints.length,
              weight: f.weight,
              italic: f.italic,
              axes: f.axes,
              instances: f.instances,
              features: f.features,
              tables: f.tables,
            },
            null,
            2,
          ),
        ],
        { type: 'application/json' },
      ),
    );

  // عيّنة PNG بالخط نفسه — للمشاركة السريعة
  const png = async () => {
    const c = document.createElement('canvas');
    const W = 1600;
    const H = 900;
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d')!;
    const cs = getComputedStyle(document.documentElement);
    ctx.fillStyle = cs.getPropertyValue('--card').trim();
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = cs.getPropertyValue('--foreground').trim();
    ctx.direction = 'rtl';
    ctx.textAlign = 'right';
    ctx.font = `${f.weight} 150px '${f.css}'`;
    ctx.fillText(f.family, W - 100, 330);
    ctx.font = `${f.weight} 64px '${f.css}'`;
    ctx.fillText(settings.text.slice(0, 40), W - 100, 520);
    ctx.fillStyle = cs.getPropertyValue('--muted-foreground').trim();
    ctx.font = `32px ${cs.getPropertyValue('--font-sans')}`;
    ctx.fillText(`${f.fullName} · مختبر الخط — حرف`, W - 100, H - 100);
    c.toBlob((b) => b && download(`${base(f)}.png`, b), 'image/png');
  };

  const pkg = libraryPackage(
    f.family
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/-?(arabic|text)$/, ''),
  );
  const link = () => {
    const url = new URL(window.location.href);
    if (pkg) {
      url.searchParams.set('font', pkg.id);
      copy(url.toString(), 'نُسخ رابط المختبر بهذا الخط');
    } else {
      url.searchParams.delete('font');
      copy(url.toString(), 'نُسخ رابط الأداة — ملفاتك المحلية لا تُشارك برابط');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        <Button onClick={json}>
          <DownloadIcon />
          تنزيل JSON
        </Button>
        <Button variant="outline" onClick={() => copy(fontFace, 'نُسخ @font-face')}>
          <CopyIcon />
          نسخ @font-face
        </Button>
        <Button variant="outline" onClick={() => void png()}>
          <PictureIcon />
          عيّنة PNG
        </Button>
        <Button variant="outline" onClick={link}>
          <LinkIcon />
          نسخ الرابط
        </Button>
      </div>

      <Panel label="الأسماء والحقوق" className="px-5 py-2">
        <h3 className="pt-3 text-control font-semibold">الأسماء والحقوق</h3>
        <InfoRows rows={f.names.map((n) => [n.label, <span dir="auto">{n.value}</span>])} />
      </Panel>

      <Panel label="الملف والتغطية" className="px-5 py-2">
        <h3 className="pt-3 text-control font-semibold">الملف والتغطية</h3>
        <InfoRows
          rows={[
            ['الملف', <span dir="ltr">{f.fileName}</span>],
            ['الحجم', <span dir="ltr">{kb(f.bytes)}</span>],
            ['الصيغة', `${f.format} · ${f.outline}`],
            ['عدد المحارف', f.glyphCount.toLocaleString('en-US')],
            ['نقاط يونيكود', f.codepoints.length.toLocaleString('en-US')],
            ['وحدات المربّع', f.unitsPerEm],
            [
              'القياسات',
              <span dir="ltr" className="tabular-nums">
                ascent {f.metrics.ascent} · descent {f.metrics.descent} · cap {f.metrics.capHeight} · x{' '}
                {f.metrics.xHeight}
              </span>,
            ],
            ['خط متغيّر', f.axes.length ? f.axes.map((a) => `${a.tag} ${a.min}–${a.max}`).join(' · ') : 'لا'],
            ['ميزات OpenType', <span dir="ltr">{f.features.map((x) => x.tag).join(' ')}</span>],
            ['جداول الملف', <span dir="ltr">{f.tables.join(' ')}</span>],
          ]}
        />
      </Panel>

      <Panel label="CSS" className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b px-5 py-3">
          <h3 className="text-control font-semibold">CSS بإعدادات العرض الحالية</h3>
          <Button variant="ghost" size="sm" onClick={() => copy(fontFace, 'نُسخ CSS')}>
            <CopyIcon />
            نسخ
          </Button>
        </div>
        <pre dir="ltr" className="overflow-x-auto bg-sunken px-5 py-4 text-left font-mono text-caption leading-relaxed">
          {fontFace}
        </pre>
      </Panel>
    </div>
  );
}
