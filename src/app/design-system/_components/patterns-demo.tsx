'use client';

import { useState } from 'react';

import { Breadcrumb } from '@/components/shared/breadcrumb';
import { EmptyState } from '@/components/shared/empty-state';
import { SearchField } from '@/components/shared/search-field';
import { Button } from '@/components/ui/button';
import { Chip, ChipGroup } from '@/components/ui/chip-group';
import { FlameIcon, HeartFilledIcon, TimePastIcon } from '@/components/ui/icons';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { DsPanel, DsSection } from './ds-section';

/** أمثلة تفاعلية للتنقّل والبحث والفلاتر — بحالة محلية لا تمسّ الرابط */
export function NavigationDemo() {
  const [sort, setSort] = useState<'popular' | 'newest'>('popular');
  return (
    <>
      <DsSection
        id="tabs"
        num="3.4"
        title="التبويبات والمبدّلات"
        en="Tabs / Segmented"
        note="التبويب للمحتوى البديل (بأسهم لوحة المفاتيح)، والمبدّل لتغيير طريقة العرض."
      >
        <DsPanel label="التبويبات">
          <Tabs defaultValue="info">
            <TabsList aria-label="مثال التبويبات">
              <TabsTrigger value="info">معلومات الخط</TabsTrigger>
              <TabsTrigger value="files">محتويات الحزمة</TabsTrigger>
              <TabsTrigger value="license">الترخيص</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="text-control text-muted-foreground">
              محتوى تبويب المعلومات.
            </TabsContent>
            <TabsContent value="files" className="text-control text-muted-foreground">
              محتوى تبويب الملفات.
            </TabsContent>
            <TabsContent value="license" className="text-control text-muted-foreground">
              محتوى تبويب الترخيص.
            </TabsContent>
          </Tabs>
        </DsPanel>
        <DsPanel label="المبدّل">
          <SegmentedControl
            label="الترتيب"
            value={sort}
            onChange={setSort}
            options={[
              { value: 'popular', label: 'الأكثر شهرة', icon: <FlameIcon /> },
              { value: 'newest', label: 'الأحدث', icon: <TimePastIcon /> },
            ]}
          />
        </DsPanel>
      </DsSection>

      <DsSection
        id="breadcrumb"
        num="3.5"
        title="مسار التنقّل"
        en="Breadcrumb"
        note="من تصميم صفحة الخط: الصفحة الحالية أخيرة بلا رابط."
      >
        <DsPanel>
          <Breadcrumb
            items={[
              { label: 'الرئيسية', href: '/' },
              { label: 'خطوط مجانية', href: '/' },
              { label: 'Zaetoon Typeface', ltr: true },
            ]}
          />
        </DsPanel>
      </DsSection>

      <DsSection
        id="pagination"
        num="3.6"
        title="الترقيم"
        en="Pagination"
        status="not-designed"
        note="لا يوجد تصميم ترقيم؛ المكتبة تعرض كل النتائج حالياً. يُصمَّم قبل ربط قاعدة البيانات الحقيقية."
      />
    </>
  );
}

export function DataPatternsDemo() {
  const [q, setQ] = useState('');
  return (
    <>
      <DsSection
        id="empty"
        num="4.3"
        title="الحالات الفارغة"
        en="Empty States"
        note="تقول لماذا هي فارغة، وتعطي خطوة تالية واحدة."
      >
        <EmptyState
          icon={<HeartFilledIcon />}
          title="لا خطوط في مفضّلتك بعد"
          description="اضغط القلب على أي خط ليظهر هنا وتعود إليه بسهولة."
          action={<Button>تصفّح الخطوط المجانية</Button>}
        />
      </DsSection>

      <DsSection
        id="search"
        num="4.4"
        title="البحث"
        en="Search"
        note="يُرسل بعد توقّف الكتابة بـ300ms، والطول محدود بـ80 حرفاً."
      >
        <DsPanel>
          <SearchField label="ابحث" placeholder="ابحث باسم الخط أو المصمم أو المسبك…" value={q} onChange={setQ} />
          <p className="mt-3 text-caption text-tertiary">
            القيمة المُرسلة: <span className="text-foreground">{q || '—'}</span>
          </p>
        </DsPanel>
      </DsSection>

      <DsSection
        id="filters"
        num="4.5"
        title="الفلاتر والترتيب"
        en="Filters"
        note="الشريط الكامل ولوحة التصفية حيّة في الصفحة الرئيسية وحالتها في الرابط. هنا عناصرها."
      >
        <DsPanel label="شرائح متعدّدة الاختيار (اللغة)">
          <ChipGroup type="multiple" defaultValue={['ar']} aria-label="اللغة">
            {[
              ['ar', 'العربية'],
              ['fa', 'الفارسية'],
              ['ku', 'الكردية'],
              ['ur', 'الأردية'],
              ['en', 'اللاتينية'],
            ].map(([v, l]) => (
              <Chip key={v} value={v!}>
                {l}
              </Chip>
            ))}
          </ChipGroup>
        </DsPanel>
      </DsSection>
    </>
  );
}
