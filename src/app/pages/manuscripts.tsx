import { Container } from '@/components/layout/container';
import { PageMeta } from '@/components/shared/page-meta';
import { ManuscriptsBrowser } from '@/features/manuscripts/components/manuscripts-browser';

export function ManuscriptsPage() {
  return (
    <Container as="main" id="main" className="py-10 sm:py-14">
      <PageMeta
        title="مخطوطات"
        description="لوحات وأعمال خطّية عربية بصيغة SVG متجهة — تصفّحها، كبّرها، وحمّلها لتصاميمك."
      />
      {/* بداية خفيفة: المعرض هو المحتوى — عنوان وسطر واحد، ثم المخطوطات مباشرة */}
      <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 sm:mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">مخطوطات</h1>
          <p className="mt-2 text-control text-muted-foreground">
            لوحات خطّية عربية بصيغة SVG متجهة — تصفّحها، كبّرها، وحمّلها لتصاميمك.
          </p>
        </div>
        <p className="text-caption text-tertiary">نماذج تجريبية مكتوبة بخطوط المكتبة المجانية</p>
      </header>
      <ManuscriptsBrowser />
    </Container>
  );
}
