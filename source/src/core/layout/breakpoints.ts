/**
 * Layout is chosen by available width, not orientation, so the same rules
 * cover landscape phones, tablets and split screen.
 */
export const breakpoints = {
  /** < 600: phone portrait. */
  medium: 600,
  /** > 840: large tablets, where the tab bar becomes a side rail. */
  expanded: 840,
} as const;

export type SizeClass = 'compact' | 'medium' | 'expanded';

export function sizeClassFor(width: number): SizeClass {
  if (width > breakpoints.expanded) {
    return 'expanded';
  }
  return width >= breakpoints.medium ? 'medium' : 'compact';
}
