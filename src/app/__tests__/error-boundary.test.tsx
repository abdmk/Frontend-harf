import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from '../error';

function Broken(): never {
  throw new Error('boom');
}

describe('حاجز الأخطاء', () => {
  it('خطأ في صفحة يعرض واجهة الخطأ بدل شاشة بيضاء', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <MemoryRouter>
        <ErrorBoundary>
          <Broken />
        </ErrorBoundary>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'حدث خطأ غير متوقّع' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'العودة إلى المكتبة' })).toBeInTheDocument();
  });
});
