import type { TextStyle } from 'react-native';

/**
 * Poppins ships as one file per weight (assets/fonts, linked with
 * `npx react-native-asset`). Select weight via the family name — setting
 * `fontWeight` alongside a custom family breaks weight lookup on Android.
 */
export const fontFamily = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semibold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
} as const;

type Variant = Pick<
  TextStyle,
  'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing'
>;

/** Values from the Figma screens; see DESIGN_SYSTEM.md for where each is used. */
export const typography = {
  display: { fontFamily: fontFamily.bold, fontSize: 24, lineHeight: 30 },
  title: { fontFamily: fontFamily.medium, fontSize: 18, lineHeight: 22 },
  subtitle: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 20 },
  amount: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  body: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20 },
  button: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  paragraph: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 19 },
  caption: { fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 15 },
  chip: { fontFamily: fontFamily.semibold, fontSize: 12, lineHeight: 20 },
  label: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: -0.2,
  },
  /** Seat-map row numbers and the SCREEN label. */
  micro: { fontFamily: fontFamily.regular, fontSize: 8, lineHeight: 10 },
} as const satisfies Record<string, Variant>;

export type TypographyVariant = keyof typeof typography;
