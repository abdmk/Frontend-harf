import { type ReactElement, useId, useState } from 'react';

import { Dropzone } from '@/components/shared/dropzone';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { MANUSCRIPT_CATEGORIES, MANUSCRIPT_CATEGORY_LABEL, type ManuscriptCategory } from '@/types/domain/manuscript';

const MAX = 2 * 1024 * 1024;

/**
 * إضافة مخطوطة (للاستوديو والإدارة). ملف SVG حتى 2 ميغابايت.
 * أمان: SVG قد يحمل سكربتات — في المنتج يُعقَّم الملف على الخادم (إزالة script وon* والروابط
 * الخارجية) ويُراجَع قبل النشر، ويُقدَّم دائماً عبر <img> لا مضمَّناً في الصفحة.
 */
export function AddManuscriptDialog({ trigger }: { trigger: ReactElement }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ManuscriptCategory>('panels');
  const titleId = useId();

  const pick = (files: FileList) => {
    const f = files[0];
    if (!f) return;
    if (f.type !== 'image/svg+xml' && !f.name.toLowerCase().endsWith('.svg'))
      return setError('الصيغة المقبولة SVG فقط — العمل الخطّي يجب أن يكون متجهاً.');
    if (f.size > MAX) return setError('الملف أكبر من 2 ميغابايت.');
    setError(undefined);
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.svg$/i, '').slice(0, 60));
  };

  const reset = () => {
    setFile(null);
    setError(undefined);
    setTitle('');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-dialog-md">
        <DialogHeader>
          <DialogTitle>أضف مخطوطة</DialogTitle>
          <DialogDescription>ملف SVG متجه — يُراجَع قبل النشر.</DialogDescription>
        </DialogHeader>
        {file ? (
          <p className="flex items-center justify-between gap-3 rounded-md bg-sunken px-4 py-3 text-control">
            <span dir="ltr" className="truncate">
              {file.name}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
              تغيير
            </Button>
          </p>
        ) : (
          <Dropzone
            onFiles={pick}
            accept=".svg,image/svg+xml"
            hint="SVG فقط، حتى 2 ميغابايت"
            browseLabel="اختر ملفاً"
            className="py-10"
          />
        )}
        <FieldError>{error}</FieldError>
        <Field>
          <FieldLabel htmlFor={titleId} required>
            العنوان
          </FieldLabel>
          <Input id={titleId} value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field>
          <FieldLabel>التصنيف</FieldLabel>
          <Select value={category} onValueChange={(v) => setCategory(v as ManuscriptCategory)}>
            <SelectTrigger aria-label="التصنيف">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MANUSCRIPT_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {MANUSCRIPT_CATEGORY_LABEL[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Button
          disabled={!file || !title.trim()}
          onClick={() => {
            toast({ tone: 'success', title: 'أُرسلت المخطوطة للمراجعة', description: 'تجريبي — لم يُرفع أي ملف.' });
            setOpen(false);
            reset();
          }}
        >
          أرسل للمراجعة
        </Button>
      </DialogContent>
    </Dialog>
  );
}
