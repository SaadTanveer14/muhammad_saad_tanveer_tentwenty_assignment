/**
 * Raw palette — mirrors the Figma "Guide" frame (node 1:2010) plus the few
 * extra values the screens use. See DESIGN_SYSTEM.md. Components should use
 * the semantic `colors` below, not the palette directly.
 */
export const palette = {
  // Guide swatches
  navy700: '#2E2739',
  grey50: '#F6F6FA',
  grey700: '#827D88',
  blue: '#61C3F2',
  grey300: '#DBDBDF',
  teal: '#15D2BC',
  pink: '#E26CA5',
  purple: '#564CA3',
  gold: '#CD9D0F',
  // Used on screens
  ink: '#202C43',
  grey75: '#F2F2F6',
  grey100: '#EFEFEF',
  grey400: '#A6A6A6',
  grey500: '#8F8F8F',
  white: '#FFFFFF',
  black: '#000000',
  danger: '#E4505F',
} as const;

export const colors = {
  background: palette.grey50,
  surface: palette.white,
  surfaceMuted: palette.grey75,
  surfaceInverse: palette.navy700,
  textPrimary: palette.ink,
  textSecondary: palette.grey700,
  textMuted: palette.grey500,
  textDisabled: palette.grey300,
  textInverse: palette.white,
  placeholder: 'rgba(32, 44, 67, 0.3)',
  border: palette.grey300,
  divider: palette.grey100,
  primary: palette.blue,
  primaryGlow: 'rgba(35, 170, 235, 0.27)',
  chip: 'rgba(166, 166, 166, 0.1)',
  danger: palette.danger,
  success: palette.teal,
  overlay: 'rgba(0, 0, 0, 0.6)',
  imageScrim: 'rgba(0, 0, 0, 0.3)',
  skeleton: palette.grey100,
  /** Seat-map pan indicator. */
  scrollbar: '#B6B8C4',
  /** Launch screen; keep in sync with android res/values/colors.xml and
   * the iOS LaunchScreen.storyboard. */
  splashBackground: '#0C0F17',
  /** Warm glow behind the splash mark (the logo's orange). */
  splashGlow: '#F2643A',
  /** Hero image gradients (transparent → black). */
  gradientEnd: palette.black,
  /** Genre tag backgrounds, cycled by index. */
  genre: [palette.teal, palette.pink, palette.purple, palette.gold],
  seat: {
    available: palette.blue,
    selected: palette.gold,
    taken: 'rgba(166, 166, 166, 0.5)',
    vip: palette.purple,
    wheelchair: palette.teal,
    blocked: palette.grey100,
  },
} as const;

export type Colors = typeof colors;
