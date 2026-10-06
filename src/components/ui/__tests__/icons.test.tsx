import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BellIcon, CheckIcon, HeartFilledIcon, UserIcon } from '../icons';

const svgOf = (el: React.ReactElement) => render(el).container.querySelector('svg')!;

describe('الأيقونات (lucide)', () => {
  it('زخرفية بلا عنوان، ولها اسم يُقرأ مع title', () => {
    expect(svgOf(<CheckIcon />)).toHaveAttribute('aria-hidden', 'true');
    const named = svgOf(<CheckIcon title="تمّ" />);
    expect(named).toHaveAttribute('role', 'img');
    expect(named).toHaveAttribute('aria-label', 'تمّ');
  });

  it('filled يملأ الشكل المغلق، ويثقل خطّ غيره', () => {
    expect(svgOf(<UserIcon />)).toHaveAttribute('fill', 'none');
    expect(svgOf(<UserIcon filled />)).toHaveAttribute('fill', 'currentColor');
    const check = svgOf(<CheckIcon filled />);
    expect(check).toHaveAttribute('fill', 'none');
    expect(Number(check.getAttribute('stroke-width'))).toBeGreaterThan(
      Number(svgOf(<CheckIcon />).getAttribute('stroke-width')),
    );
  });

  it('المصمتة دائماً مملوءة', () => {
    expect(svgOf(<HeartFilledIcon />)).toHaveAttribute('fill', 'currentColor');
  });

  it('filled="auto" يترك الحالة لـCSS بحسب الأب', () => {
    expect(svgOf(<BellIcon filled="auto" />)).toHaveAttribute('data-auto-fill', 'fill');
    expect(svgOf(<CheckIcon filled="auto" />)).toHaveAttribute('data-auto-fill', 'bold');
  });
});
