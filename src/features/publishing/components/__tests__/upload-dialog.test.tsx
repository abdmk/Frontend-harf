import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { TooltipProvider } from '@/components/ui/tooltip';

import { UploadDialog } from '@/features/publishing/components/upload-dialog';

function setup() {
  const user = userEvent.setup();
  render(
    <TooltipProvider>
      <UploadDialog>
        <button type="button">فتح</button>
      </UploadDialog>
    </TooltipProvider>,
  );
  return user;
}

describe('UploadDialog', () => {
  it('opens, lists a chosen file, and flags unsupported ones', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'فتح' }));
    const dialog = screen.getByRole('dialog', { name: 'تحميل الملفات' });
    const input = dialog.querySelector('input[type=file]') as HTMLInputElement;
    await user.upload(input, [new File(['x'.repeat(2048)], 'Zaetoon.zip', { type: 'application/zip' })]);
    expect(within(dialog).getByText('Zaetoon')).toBeInTheDocument();
    expect(within(dialog).getByRole('progressbar')).toBeInTheDocument();
  });

  it('rejects a private URL with an inline error', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'فتح' }));
    const url = screen.getByLabelText('استيراد من رابط URL');
    await user.type(url, 'https://127.0.0.1/a.otf{Enter}');
    expect(url).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText(/استعمل رابطاً عامّاً/)).toBeInTheDocument();
  });
});
