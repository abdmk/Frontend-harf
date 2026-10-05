import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';

import { ToolStage } from '@/components/layout/tool-hero';
import { Dropzone } from '@/components/shared/dropzone';
import { ToolTips } from '@/components/shared/tool-tips';
import { Button } from '@/components/ui/button';
import { FolderIcon, GlobeIcon, LayersIcon, ShieldCheckIcon, SlidersIcon, TextIcon } from '@/components/ui/icons';
import { Spinner } from '@/components/ui/spinner';

import { Workspace } from './workspace';
import { libraryPackage } from '../api/library';
import { LabProvider, useLab } from '../hooks/lab-context';
import { ACCEPT } from '../utils/load';

/** «مختبر الخط»: كل الملفات تُقرأ في المتصفّح — لا يُرفع شيء إلى الخادم */
export function FontLab({ hero }: { hero: React.ReactNode }) {
  return (
    <LabProvider>
      <LabBody hero={hero} />
    </LabProvider>
  );
}

function LabBody({ hero }: { hero: React.ReactNode }) {
  const { active, addFromLibrary, fonts } = useLab();
  const [params] = useSearchParams();

  // ?font=cairo يفتح المختبر بخط من مكتبة حرف (رابط قابل للمشاركة)
  const requested = params.get('font');
  const tried = useRef<string | null>(null);
  useEffect(() => {
    if (!requested || tried.current === requested || fonts.length) return;
    tried.current = requested;
    const pkg = libraryPackage(requested);
    if (pkg) void addFromLibrary(pkg.id, pkg.url, pkg.name);
  }, [requested, fonts.length, addFromLibrary]);

  // بعد الرفع يختفي الـHero كاملاً وتصير الصفحة مساحة عمل
  return active ? (
    <Workspace />
  ) : (
    <div className="py-10 sm:py-14">
      {hero}
      <Empty />
    </div>
  );
}

/* ───────────────────────── الحالة الأولى ───────────────────────── */

/** ما يكشفه المختبر — كل بطاقة أداة حقيقية فيه */
const LAB_TIPS = [
  { icon: LayersIcon, title: 'العائلة كاملة', text: 'حمّل كل الأوزان لترى الحقيقية منها وتقارن بينها.' },
  { icon: TextIcon, title: 'اختبر بنصّك', text: 'اكتب نصّك وشاهده بكل وزن وحجم قبل أن تشتري أو تستخدم.' },
  { icon: GlobeIcon, title: 'اللغات والحروف', text: 'أي لغات يدعمها الخط، وما الحروف الناقصة منها.' },
  { icon: SlidersIcon, title: 'المحاور المتغيّرة', text: 'يقرأ الخطوط المتغيّرة ويتيح تحريك محاورها مباشرة.' },
  { icon: ShieldCheckIcon, title: 'ملفاتك في جهازك', text: 'القراءة والتحليل داخل المتصفّح، لا تُرفع إلى أي خادم.' },
] as const;

function Empty() {
  const { add, busy } = useLab();
  const folder = useRef<HTMLInputElement>(null);

  return (
    <ToolStage className="flex flex-col gap-6">
      <div className="relative">
        <Dropzone
          feature
          formats={['OTF', 'TTF', 'TTC', 'WOFF', 'WOFF2', 'ZIP']}
          onFiles={(f) => void add(f)}
          accept={ACCEPT}
          multiple
          title="أفلت ملفات الخطوط هنا"
          hint="ملف واحد، عائلة كاملة، أو ملف ZIP"
          browseLabel="اختر ملفات"
          actions={
            <Button variant="outline" size="lg" shape="pill" onClick={() => folder.current?.click()}>
              <FolderIcon />
              اختر مجلّداً
            </Button>
          }
        />
        <input
          ref={folder}
          type="file"
          hidden
          multiple
          // مجلّد عائلة كاملة
          {...({ webkitdirectory: '' } as Record<string, string>)}
          onChange={(e) => {
            if (e.target.files?.length) void add(e.target.files);
            e.target.value = '';
          }}
        />
        {busy && (
          <div
            role="status"
            className="absolute inset-0 grid place-items-center rounded-2xl bg-card/85 text-control font-medium"
          >
            <span className="flex items-center gap-2">
              <Spinner /> جارٍ قراءة الملفات…
            </span>
          </div>
        )}
      </div>

      <ToolTips id="lab-tips" title="ما يكشفه المختبر" tips={LAB_TIPS} />
    </ToolStage>
  );
}
