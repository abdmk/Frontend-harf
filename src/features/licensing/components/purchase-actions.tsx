import type { ReactNode } from 'react';

import { DownloadButton } from '@/components/shared/download-button';
import { PriceDisplay } from '@/components/shared/price-display';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CartIcon, CheckIcon } from '@/components/ui/icons';
import { toast } from '@/components/ui/toast';
import { cents } from '@/types/domain/commerce';
import type { LicenseType } from '@/types/domain/font';
import type { LicensePricing, LicenseSelection, OwnershipState } from '@/types/domain/license';

import { LicenseSheet, type SubmitResult } from './license-sheet';

type Props = {
  font: { id: string; name: string; type: Exclude<LicenseType, 'free'> };
  foundry: string;
  pricing: LicensePricing;
  ownership?: OwnershipState;
  /** رقم الترخيص إن كان مملوكاً */
  licenseId?: string;
  favorite?: ReactNode;
  defaultOpen?: boolean;
  onSubmit: (selection: LicenseSelection) => SubmitResult | Promise<SubmitResult>;
};

/**
 * أفعال الشراء في رأس صفحة الخط (تصميم «Free Font.jpg» + دليل التصميم 5.5):
 * مدفوع: السعر + شراء الترخيص + إضافة سريعة للسلة + المفضّلة.
 * تجريبي: + تحميل النسخة التجريبية. مملوك: تحميل مجدداً + ترقية.
 */
export function PurchaseActions({
  font,
  foundry,
  pricing,
  ownership = 'none',
  licenseId,
  favorite,
  defaultOpen,
  onSubmit,
}: Props) {
  const sheet = (label: string, variant: 'primary' | 'outline' = 'primary') => (
    <LicenseSheet
      fontName={font.name}
      foundry={foundry}
      pricing={pricing}
      defaultOpen={defaultOpen}
      onSubmit={onSubmit}
      trigger={
        <Button size="lg" variant={variant}>
          {label}
        </Button>
      }
    />
  );

  if (ownership === 'owned') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="neutral" size="md" icon={<CheckIcon />}>
          مملوك
          {licenseId && (
            <span dir="ltr" className="font-mono">
              {' '}
              · {licenseId}
            </span>
          )}
        </Badge>
        {favorite}
        {sheet('ترقية الترخيص', 'outline')}
        <DownloadButton fontName={font.name} label="حمّل مجدداً" size="lg" />
      </div>
    );
  }

  async function quickAdd() {
    const first = pricing.uses.desktop[0];
    if (!first) return;
    const res = await onSubmit({ fontId: font.id, package: 'family', uses: { desktop: first.id } });
    toast(
      res.ok
        ? {
            tone: 'success',
            title: 'أُضيفت العائلة الكاملة إلى السلة',
            description: 'لسطح المكتب — عدّل الترخيص من السلة متى شئت.',
          }
        : { tone: 'danger', title: 'لم تتمّ الإضافة', description: res.error },
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <PriceDisplay
        price={cents(pricing.familyCents)}
        compareAt={pricing.compareAtFamilyCents ? cents(pricing.compareAtFamilyCents) : undefined}
        size="lg"
        className="me-2"
      />
      {favorite}
      <Button size="icon-lg" variant="outline" aria-label={`أضف ${font.name} إلى السلة`} onClick={quickAdd}>
        <CartIcon />
      </Button>
      {font.type === 'trial' && (
        <DownloadButton fontName={font.name} label="النسخة التجريبية" size="lg" variant="secondary" />
      )}
      {sheet('شراء الترخيص')}
    </div>
  );
}
