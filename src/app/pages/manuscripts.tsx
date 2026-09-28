import { Container } from '@/components/layout/container';
import { PageMeta } from '@/components/shared/page-meta';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@/components/ui/icons';
import { AddManuscriptDialog } from '@/features/manuscripts/components/add-manuscript-dialog';
import { ManuscriptsBrowser } from '@/features/manuscripts/components/manuscripts-browser';
import { useCurrentUser } from '@/hooks/use-current-user';

export function ManuscriptsPage() {
  const user = useCurrentUser();
  const canAdd = !!user && (user.role === 'admin' || user.plan === 'studio');
  return (
    <Container as="main" id="main" className="py-10 sm:py-14">
      <PageMeta
        title="مخطوطات"
        description="لوحات وأعمال خطّية عربية بصيغة SVG متجهة — تصفّحها، كبّرها، وحمّلها لتصاميمك."
      />
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-[60ch]">
          <h1 className="text-2xl font-semibold sm:text-3xl">مخطوطات</h1>
          <p className="mt-2 text-control leading-relaxed text-muted-foreground">
            لوحات وأعمال خطّية عربية بصيغة SVG متجهة — تصفّحها، كبّرها، وحمّلها لتصاميمك.
          </p>
        </div>
        <p className="rounded-full bg-sunken px-3 py-1.5 text-caption text-muted-foreground">
          نماذج تجريبية مكتوبة بخطوط المكتبة المجانية
        </p>
      </header>
      <ManuscriptsBrowser
        action={
          canAdd ? (
            <AddManuscriptDialog
              trigger={
                <Button shape="pill" className="h-11 px-5">
                  <PlusIcon />
                  أضف مخطوطة
                </Button>
              }
            />
          ) : undefined
        }
      />
    </Container>
  );
}
