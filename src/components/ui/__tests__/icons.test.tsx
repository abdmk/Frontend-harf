import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BellIcon, CheckIcon, UserIcon } from '../icons';

const shapes = (el: Element) =>
  [...el.querySelectorAll('path,rect,circle,ellipse,polygon')].map((n) => n.outerHTML).join();

describe('الأيقونات: خطّية ومصمتة', () => {
  it('filled يبدّل إلى النسخة المصمتة', () => {
    const line = render(<UserIcon />).container.querySelector('svg')!;
    const solid = render(<UserIcon filled />).container.querySelector('svg')!;
    expect(solid).toHaveAttribute('data-filled');
    expect(line).not.toHaveAttribute('data-filled');
    expect(shapes(solid)).not.toBe(shapes(line));
  });

  it('أيقونة بلا نسخة مصمتة تبقى خطّية', () => {
    const a = render(<CheckIcon filled />).container.querySelector('svg')!;
    const b = render(<CheckIcon />).container.querySelector('svg')!;
    expect(a).not.toHaveAttribute('data-filled');
    expect(shapes(a)).toBe(shapes(b));
  });

  it('filled="auto" يرسم النسختين لتختار CSS بحسب حالة الأب', () => {
    const svg = render(<BellIcon filled="auto" />).container.querySelector('svg')!;
    expect(svg).toHaveAttribute('data-auto-fill');
    expect(svg.querySelector('[data-v="line"]')).not.toBeNull();
    expect(svg.querySelector('[data-v="solid"]')).not.toBeNull();
  });
});
