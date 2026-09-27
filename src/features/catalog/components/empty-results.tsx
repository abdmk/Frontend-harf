'use client';

import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { SearchIcon } from '@/components/ui/icons';
import { DEFAULT_QUERY } from '@/features/catalog/types/catalog-query';

import { useCatalog } from './catalog-context';

export function EmptyResults() {
  const { setQuery } = useCatalog();
  return (
    <EmptyState
      icon={<SearchIcon />}
      title="لا خطوط تطابق اختيارك"
      description="جرّب تصنيفاً آخر أو امسح بعض الفلاتر."
      action={
        <Button variant="secondary" onClick={() => setQuery(DEFAULT_QUERY)}>
          مسح الكل
        </Button>
      }
    />
  );
}
