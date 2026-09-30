import { colors } from './colors';
import { elevation } from './elevation';
import { radii, spacing } from './spacing';
import { typography } from './typography';

export const theme = { colors, spacing, radii, typography, elevation } as const;
export type Theme = typeof theme;

export { colors, palette } from './colors';
export { elevation } from './elevation';
export { radii, spacing } from './spacing';
export { fontFamily, typography } from './typography';
export type { TypographyVariant } from './typography';
