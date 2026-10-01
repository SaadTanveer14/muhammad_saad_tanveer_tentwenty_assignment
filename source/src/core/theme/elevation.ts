import type { ViewStyle } from 'react-native';

import { colors } from './colors';

type Shadow = Pick<
  ViewStyle,
  | 'shadowColor'
  | 'shadowOffset'
  | 'shadowOpacity'
  | 'shadowRadius'
  | 'elevation'
>;

/** The designs are flat except for these three treatments. */
export const elevation = {
  /** Selected date chip: soft brand-coloured glow. */
  glow: {
    shadowColor: colors.primaryGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10.5,
    elevation: 6,
  },
  /** Selected showtime card. */
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  /** Seat-map zoom buttons. */
  control: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
} as const satisfies Record<string, Shadow>;
