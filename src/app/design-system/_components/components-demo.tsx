import { useState } from 'react';

import { Avatar } from '@/components/shared/avatar';
import { Alert, AlertAction } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Chip, ChipGroup } from '@/components/ui/chip-group';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldHint, FieldLabel } from '@/components/ui/field';
import {
  BanIcon,
  CheckIcon,
  ClockIcon,
  CrossIcon,
  DownloadIcon,
  ExclamationIcon,
  GemIcon,
  HeartFilledIcon,
  HeartIcon,
  MagicWandIcon,
  MailIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  UserIcon,
} from '@/components/ui/icons';
import { Input, InputGroup, Textarea } from '@/components/ui/input';
import { RadioGroup, RadioOption } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { DsPanel, DsSection } from './ds-section';

const VARIANTS = ['primary', 'secondary', 'outline', 'ghost', 'danger', 'ink', 'ai', 'link'] as const;
const VARIANT_LABEL: Record<(typeof VARIANTS)[number], string> = {
  primary: 'تحميل الخط',
  secondary: 'التفاصيل',
  outline: 'استعراض الملفات',
  ghost: 'إلغاء',
  danger: 'حذف نهائياً',
  ink: 'ابدأ مجاناً',
  ai: 'طابق بالذكاء الاصطناعي',
  link: 'عرض جميع الخطوط',
};

export function ComponentsDemo() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('ahmed@harf');
  const [on, setOn] = useState(true);
  const emailError = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
    ? undefined
    : 'هذا البريد غير مكتمل — ينقصه ما بعد النقطة.';

  return (
    <>
      <DsSection
        id="buttons"
        num="2.1"
        title="الأزرار"
        en="Buttons"
        note="زرّ أحمر واحد في كل منطقة. الضغط يصغّر الزرّ قليلاً، والانتظار يستبدل النص بمؤشّر دون أن يتغيّر العرض."
      >
        <DsPanel label="الأنواع">
          <div className="flex flex-wrap items-center gap-3">
            {VARIANTS.map((v) => (
              <Button key={v} variant={v} size="lg">
                {v === 'primary' && <DownloadIcon />}
                {v === 'ai' && <MagicWandIcon />}
                {VARIANT_LABEL[v]}
              </Button>
            ))}
          </div>
        </DsPanel>
        <DsPanel label="الأحجام والأشكال">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">صغير · 34</Button>
            <Button size="md">متوسط · 42</Button>
            <Button size="lg">كبير · 48</Button>
            <Button size="xl">أكبر · 56</Button>
            <Button shape="pill" variant="ink">
              حبّة
            </Button>
            <Button size="icon" variant="outline" aria-label="أضف إلى المفضّلة">
              <HeartIcon />
            </Button>
            <Button size="icon" variant="danger" aria-label="أُضيف إلى المفضّلة">
              <HeartFilledIcon />
            </Button>
            <Button size="icon-lg" shape="pill" aria-label="إضافة">
              <PlusIcon />
            </Button>
          </div>
        </DsPanel>
        <DsPanel label="الحالات: عادي · تمرير · تركيز (Tab) · ضغط · معطّل · انتظار">
          <div className="flex flex-wrap items-center gap-3">
            <Button>عادي</Button>
            <Button disabled>معطّل</Button>
            <Button
              loading={loading}
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1600);
              }}
            >
              اضغط للانتظار
            </Button>
            <Button variant="secondary" loading>
              جارٍ الحفظ
            </Button>
          </div>
        </DsPanel>
      </DsSection>

      <DsSection
        id="inputs"
        num="2.2"
        title="الحقول"
        en="Inputs"
        note="التركيز: حدّ أحمر وحلقة ناعمة. العنوان مربوط بالحقل (for)، والخطأ مربوط بـaria-describedby ويُعلَن لقارئ الشاشة."
      >
        <DsPanel className="grid gap-6 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="ds-name">اسم الخط</FieldLabel>
            <Input id="ds-name" placeholder="مثال: تجاريب" />
          </Field>
          <Field>
            <FieldLabel htmlFor="ds-search">البحث</FieldLabel>
            <InputGroup id="ds-search" type="search" start={<SearchIcon />} placeholder="ابحث عن خط أو مصمم أو مسبك" />
          </Field>
          <Field>
            <FieldLabel htmlFor="ds-email" required>
              البريد الإلكتروني
            </FieldLabel>
            <InputGroup
              id="ds-email"
              type="email"
              dir="ltr"
              start={<MailIcon />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!emailError}
              aria-describedby="ds-email-err"
            />
            <FieldError id="ds-email-err">{emailError}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="ds-weights">عدد الأوزان</FieldLabel>
            <Input id="ds-weights" type="number" defaultValue={5} min={1} max={20} />
            <FieldHint>يُقرأ آلياً من ملفات الخط عند الرفع.</FieldHint>
          </Field>
          <Field>
            <FieldLabel htmlFor="ds-disabled">معطّل</FieldLabel>
            <InputGroup id="ds-disabled" dir="ltr" start={<MailIcon />} defaultValue="abdulmalik@harf.co" disabled />
          </Field>
          <Field>
            <FieldLabel htmlFor="ds-about">نبذة</FieldLabel>
            <Textarea id="ds-about" placeholder="اكتب نبذة قصيرة عن الخط…" maxLength={400} />
          </Field>
        </DsPanel>
      </DsSection>

      <DsSection
        id="dropdown"
        num="2.3"
        title="القائمة المنسدلة"
        en="Select / Dropdown"
        note="بقية القوائم المنبثقة: قائمة الحساب، الإشعارات، السلة — في أقسامها."
      >
        <DsPanel className="max-w-sm">
          <Field>
            <FieldLabel id="ds-age-label">العمر</FieldLabel>
            <Select>
              <SelectTrigger aria-labelledby="ds-age-label" start={<UserIcon />}>
                <SelectValue placeholder="اختر عمرك" />
              </SelectTrigger>
              <SelectContent>
                {['أقل من 18', '18 – 24', '25 – 34', '35 – 44', '45 فأكثر'].map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </DsPanel>
      </DsSection>

      <DsSection id="controls" num="2.4" title="الاختيار والمفاتيح" en="Checkbox / Radio / Switch">
        <DsPanel className="grid gap-8 sm:grid-cols-3">
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-3 text-lead">
              <Checkbox defaultChecked /> تذكّرني
            </label>
            <label className="flex max-w-xs items-start gap-3 text-control leading-relaxed text-muted-foreground">
              <Checkbox className="mt-1" />
              أقرّ بأنّي أملك كامل الحقوق الفكرية لهذا الخط أو تفويضاً رسمياً بنشره.
            </label>
            <label className="flex items-center gap-3 text-lead text-tertiary">
              <Checkbox disabled /> معطّل
            </label>
          </div>
          <RadioGroup defaultValue="commercial" aria-label="الرخصة">
            <RadioOption value="all" label="الكل" />
            <RadioOption value="personal" label="شخصي فقط" />
            <RadioOption value="commercial" label="تجاري" />
          </RadioGroup>
          <div className="flex flex-col gap-4">
            <label className="flex items-center justify-between gap-3 text-lead">
              إشعارات البريد
              <Switch checked={on} onCheckedChange={setOn} />
            </label>
            <label className="flex items-center justify-between gap-3 text-lead text-tertiary">
              معطّل
              <Switch disabled />
            </label>
          </div>
        </DsPanel>
      </DsSection>

      <DsSection
        id="badges"
        num="2.5"
        title="الشارات والوسوم"
        en="Badges / Tags"
        note="الصورة الرمزية: حرفان لاتينيان، واللون مشتقّ من تجزئة المعرّف — الشخص نفسه يحصل على اللون نفسه دائماً."
      >
        <DsPanel label="الشارات">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="success" icon={<CheckIcon />}>
              منشور
            </Badge>
            <Badge tone="info" icon={<ClockIcon />}>
              قيد المراجعة
            </Badge>
            <Badge tone="danger" icon={<CrossIcon />}>
              مرفوض
            </Badge>
            <Badge tone="warning" icon={<ExclamationIcon />}>
              تنتهي بعد 3 أيام
            </Badge>
            <Badge tone="studio" icon={<GemIcon />}>
              استوديو
            </Badge>
            <Badge>مجاني</Badge>
            <Badge dir="ltr">SIL OFL</Badge>
          </div>
          <p className="mt-6 mb-2 text-caption text-tertiary">فوق الصور (solid)</p>
          <div className="flex flex-wrap gap-2">
            <Badge appearance="solid" tone="success" icon={<CheckIcon />}>
              مجاني
            </Badge>
            <Badge appearance="solid" tone="info">
              تجريبي
            </Badge>
            <Badge appearance="solid" tone="studio">
              مدفوع
            </Badge>
          </div>
        </DsPanel>
        <DsPanel label="الشرائح — تمتلئ بالأحمر عند التفعيل (الأسهم تتنقّل بينها)">
          <ChipGroup type="single" defaultValue="all" aria-label="التصنيف">
            {['الكل', 'نسخ', 'ديواني', 'ثلث', 'رقعة', 'حديث'].map((c, i) => (
              <Chip key={c} value={i === 0 ? 'all' : c} size="md">
                {c}
              </Chip>
            ))}
          </ChipGroup>
        </DsPanel>
        <DsPanel label="الصورة الرمزية">
          <div className="flex flex-wrap items-center gap-3">
            {[
              ['AJ', 'u-abdmk'],
              ['SN', 'sn'],
              ['KB', 'kb'],
              ['AE', 'ae'],
              ['MZ', 'mz'],
              ['HA', 'u-heba'],
            ].map(([i, seed]) => (
              <Avatar key={seed} initials={i!} seed={seed!} size="xl" />
            ))}
            <Avatar initials="AJ" seed="u-abdmk" size="lg" />
            <Avatar initials="AJ" seed="u-abdmk" size="md" />
            <Avatar initials="AJ" seed="u-abdmk" size="sm" />
          </div>
        </DsPanel>
      </DsSection>

      <DsSection
        id="feedback"
        num="2.6"
        title="التنبيهات"
        en="Alerts / Toasts"
        note="كل تنبيه يحمل إجراءً. الأحمر للفشل فقط. الإشعار العابر يختفي بعد 5 ثوانٍ ويتوقّف عند المرور عليه."
      >
        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast({
                tone: 'success',
                title: 'اكتمل رفع الخط',
                description: 'تجاريب — 5 أوزان. بانتظار المراجعة.',
                action: { label: 'عرض الخط', onClick: () => undefined },
              })
            }
          >
            إشعار نجاح عابر
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast({ tone: 'danger', title: 'تعذّر رفع الملف', description: 'الحجم أكبر من المسموح.' })}
          >
            إشعار فشل عابر
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Alert
            tone="success"
            title="اكتمل رفع الخط"
            description="تجاريب — 5 أوزان. بانتظار المراجعة، تصلك رسالة خلال 24 ساعة."
            actions={<AlertAction>عرض الخط</AlertAction>}
            onDismiss={() => undefined}
          />
          <Alert
            tone="warning"
            title="رصيدك على وشك النفاد"
            description="بقي 12 رصيداً. تحميل خط مدفوع واحد يكلّف 15."
            actions={<AlertAction>شحن الرصيد</AlertAction>}
            onDismiss={() => undefined}
          />
          <Alert
            tone="info"
            title="النسخة التجريبية للتجربة فقط"
            description="لا يجوز استعمالها في عمل منشور قبل شراء الترخيص."
            actions={
              <>
                <AlertAction>شراء الترخيص</AlertAction>
                <AlertAction muted>فهمت</AlertAction>
              </>
            }
          />
          <Alert
            tone="danger"
            title="تعذّر رفع الملف"
            description="GraphikArabic-Bold.ttf أكبر من 250 ميجابايت."
            actions={<AlertAction>كيف أضغطه؟</AlertAction>}
          />
        </div>
      </DsSection>

      <DsSection
        id="tooltip"
        num="2.7"
        title="التلميح"
        en="Tooltip"
        status="not-designed"
        note="لا يوجد تصميم تلميح مستقلّ؛ المستعمل حالياً (في نافذة الرفع) بأسلوب الأسطح الداكنة، ويظهر بعد 300ms وبالتركيز أيضاً."
      >
        <DsPanel>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" aria-label="حذف">
                <TrashIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>حذف الملف</TooltipContent>
          </Tooltip>
        </DsPanel>
      </DsSection>

      <DsSection
        id="modal"
        num="2.8"
        title="النافذة"
        en="Modal / Dialog"
        note="يُحبس التركيز داخل النافذة، وEsc يغلقها، ويعود التركيز إلى الزرّ الذي فتحها."
      >
        <DsPanel>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="danger">
                <BanIcon />
                حذف الخط
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>حذف «تجاريب» نهائياً؟</DialogTitle>
                <DialogDescription>سيُحذف الخط وكل ملفاته من صفحتك. لا يمكن التراجع عن هذا الإجراء.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">إلغاء</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="danger">حذف نهائياً</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DsPanel>
      </DsSection>
    </>
  );
}
