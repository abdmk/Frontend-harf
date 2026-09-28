import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../button';

describe('Button', () => {
  it('حالة الانتظار: aria-busy ويُبقي الاسم المقروء', () => {
    render(<Button loading>حفظ</Button>);
    const btn = screen.getByRole('button', { name: 'حفظ' });
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('المعطّل لا يستجيب للنقر', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        حفظ
      </Button>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'حفظ' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('asChild يمرّر الأسلوب إلى الرابط', () => {
    render(
      <Button asChild>
        <a href="/x">رابط</a>
      </Button>,
    );
    expect(screen.getByRole('link', { name: 'رابط' })).toHaveAttribute('data-slot', 'button');
  });
});
