import { useId, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError, FieldHint, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { FONT_NAME_MAX } from '@/lib/catalog-overrides';
import { CATEGORY_LABEL } from '@/lib/labels';
import { CATEGORIES, type Category } from '@/types/domain/font';

import { deleteFont, editFont, type StoreFont } from '../api/fonts-store';

/** تعديل بيانات الخط الظاهرة: الاسم، التصنيف، السعر (للمدفوع)، الوسوم */
export function EditFontDialog({
  item,
  open,
  onOpenChange,
}: {
  item: StoreFont;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const f = item.font;
  const [name, setName] = useState(f.name);
  const [category, setCategory] = useState<Category>(f.category);
  const [price, setPrice] = useState(String(f.price));
  const [tags, setTags] = useState((f.tags ?? []).join('، '));
  const [error, setError] = useState<{ field: string; message: string }>();
  const id = useId();
  const err = (k: string) => (error?.field === k ? error.message : undefined);
  const paid = f.type !== 'free';

  function save(e: React.FormEvent) {
    e.preventDefault();
    const r = editFont(f.id, { name, category, price: paid ? price : 0, tags });
    if (!r.ok) return setError({ field: 'field' in r ? r.field : '', message: r.error });
    toast({ tone: 'success', title: 'حُفظت التعديلات', description: 'تظهر في المكتبة فوراً.' });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-dialog-md">
        <div>
          <DialogTitle>تعديل الخط</DialogTitle>
          <DialogDescription className="mt-1 text-meta text-muted-foreground">
            التغييرات تظهر للزوّار فوراً وتُسجَّل في سجلّ النشاط.
          </DialogDescription>
        </div>
        <form onSubmit={save} noValidate className="flex flex-col gap-5">
          <Field>
            <FieldLabel htmlFor={`${id}-name`} required>
              الاسم
            </FieldLabel>
            <Input
              id={`${id}-name`}
              value={name}
              maxLength={FONT_NAME_MAX}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!err('name')}
            />
            <FieldError>{err('name')}</FieldError>
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel id={`${id}-cat`}>التصنيف</FieldLabel>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger aria-labelledby={`${id}-cat`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {paid && (
              <Field>
                <FieldLabel htmlFor={`${id}-price`}>السعر (دولار)</FieldLabel>
                <Input
                  id={`${id}-price`}
                  value={price}
                  dir="ltr"
                  inputMode="decimal"
                  maxLength={7}
                  onChange={(e) => setPrice(e.target.value)}
                  aria-invalid={!!err('price')}
                />
                <FieldError>{err('price')}</FieldError>
              </Field>
            )}
          </div>
          <Field>
            <FieldLabel htmlFor={`${id}-tags`}>الوسوم</FieldLabel>
            <Input
              id={`${id}-tags`}
              value={tags}
              maxLength={400}
              onChange={(e) => setTags(e.target.value)}
              aria-invalid={!!err('tags')}
            />
            <FieldHint>افصل بفاصلة · 12 وسماً على الأكثر</FieldHint>
            <FieldError>{err('tags')}</FieldError>
          </Field>
          {error && !['name', 'price', 'tags'].includes(error.field) && <FieldError>{error.message}</FieldError>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit">حفظ</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** الحذف يتطلّب كتابة اسم الخط — إجراء ثقيل لا يُنفَّذ بنقرة خاطئة، ويُسترجع من «المحذوفة» */
export function DeleteFontDialog({
  item,
  open,
  onOpenChange,
  onDeleted,
}: {
  item: StoreFont;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onDeleted?: () => void;
}) {
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string>();
  const id = useId();
  const name = item.font.name;

  function remove(e: React.FormEvent) {
    e.preventDefault();
    const r = deleteFont(item.font.id, confirm);
    if (!r.ok) return setError(r.error);
    toast({ tone: 'info', title: `حُذف «${name}»`, description: 'يمكنك استرجاعه من «المحذوفة».' });
    onOpenChange(false);
    onDeleted?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div>
          <DialogTitle>حذف «{name}»؟</DialogTitle>
          <DialogDescription className="mt-1 text-meta leading-relaxed text-muted-foreground">
            يختفي من المكتبة والأدوات فوراً. من اشتراه يبقى له ترخيصه وملفّاته. يمكن استرجاعه لاحقاً.
          </DialogDescription>
        </div>
        <form onSubmit={remove} noValidate className="flex flex-col gap-5">
          <Field>
            <FieldLabel htmlFor={`${id}-c`}>
              اكتب <bdi className="font-semibold text-foreground">{name}</bdi> للتأكيد
            </FieldLabel>
            <Input
              id={`${id}-c`}
              value={confirm}
              autoComplete="off"
              onChange={(e) => {
                setConfirm(e.target.value);
                setError(undefined);
              }}
              aria-invalid={!!error}
            />
            <FieldError>{error}</FieldError>
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" variant="danger" disabled={confirm.trim() !== name}>
              حذف الخط
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
