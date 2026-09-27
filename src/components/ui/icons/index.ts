import type { ComponentType } from 'react';

import type { IconProps } from './create-icon';

export * from './icons.generated';
export type { IconProps };
export type IconComponent = ComponentType<IconProps>;
