import { SegmentedControl } from '@/components/ui/segmented-control';

import { Panel } from './bits';
import { ControlsCard, FeatureCssActions, OpenTypeToggles, SizeField } from './controls';
import { Features, OT_SPECIMENS } from './tools/features';
import { useLab } from '../hooks/lab-context';

export type FeaturesSub = 'live' | 'inventory';

/**
 * «ميزات OpenType» بخطوتين واضحتين: «تفعيل ومعاينة» (مفاتيح الملف فوق، وأثرها في نصوص تكشفها تحت)،
 * و«جرد الملف» لمن يريد التعمّق (أثر كل ميزة، الربطات، البدائل، الكتابات واللغات).
 */
export function FeaturesTool({
  sub,
  onSub,
  onTry,
}: {
  sub: FeaturesSub;
  onSub: (s: FeaturesSub) => void;
  onTry: (tag: string, sample: string) => void;
}) {
  const { active, settings, specimen } = useLab();
  if (!active) return null;
  const size = Math.min(72, Math.max(18, settings.size));

  return (
    <div className="flex flex-col gap-5">
      <SegmentedControl
        label="عرض الميزات"
        value={sub}
        onChange={onSub}
        className="w-fit"
        options={[
          { value: 'live', label: 'تفعيل ومعاينة' },
          { value: 'inventory', label: 'جرد الملف' },
        ]}
      />

      {sub === 'live' ? (
        <>
          <ControlsCard label="إعدادات OpenType" actions={<FeatureCssActions />}>
            <SizeField min={18} max={72} label="حجم المعاينة" />
          </ControlsCard>
          <OpenTypeToggles onTry={onTry} />
          {/* المعاينة بالميزات الحالية — كل سطر يستهدف ميزات بعينها */}
          <Panel label="معاينة الميزات" className="divide-y overflow-hidden">
            {OT_SPECIMENS.map(([label, text], i) => (
              <div key={label} className="flex flex-col gap-2 px-5 py-5 sm:px-6">
                <span className="text-caption text-tertiary">{label}</span>
                <p
                  lang={settings.lang || undefined}
                  className="leading-[1.8] break-words"
                  style={specimen(active, { fontSize: i === 0 ? Math.round(size * 0.55) : size })}
                >
                  {text}
                </p>
              </div>
            ))}
          </Panel>
        </>
      ) : (
        <Features onTry={onTry} />
      )}
    </div>
  );
}
