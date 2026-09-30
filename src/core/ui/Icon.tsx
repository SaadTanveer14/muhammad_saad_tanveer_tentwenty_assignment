import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '../theme';

export type IconName =
  | 'search'
  | 'close'
  | 'chevronLeft'
  | 'play'
  | 'more'
  | 'plus'
  | 'minus'
  | 'dashboard'
  | 'watch'
  | 'library'
  | 'list';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  /** Second colour, used where a glyph has a cut-out (the Watch tab icon). */
  accentColor?: string;
}

/**
 * The app's single icon set, drawn on a 24×24 grid to match the mockups.
 * Icons are decorative: put accessibility labels on the control, not here.
 */
export function Icon({
  name,
  size = 24,
  color = colors.textPrimary,
  accentColor = colors.surfaceInverse,
}: IconProps) {
  const stroke = {
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {renderGlyph(name, color, accentColor, stroke)}
    </Svg>
  );
}

function renderGlyph(
  name: IconName,
  color: string,
  accentColor: string,
  stroke: object,
) {
  switch (name) {
    case 'search':
      return (
        <>
          <Circle cx={10.5} cy={10.5} r={6.5} {...stroke} />
          <Path d="M15.5 15.5 20 20" {...stroke} />
        </>
      );
    case 'close':
      return <Path d="M5 5l14 14M19 5 5 19" {...stroke} strokeWidth={1.5} />;
    case 'chevronLeft':
      return <Path d="M15 4 7 12l8 8" {...stroke} />;
    case 'play':
      return <Path d="M7 4.5v15L19 12z" fill={color} />;
    case 'more':
      return (
        <>
          <Circle cx={4} cy={12} r={2} fill={color} />
          <Circle cx={12} cy={12} r={2} fill={color} />
          <Circle cx={20} cy={12} r={2} fill={color} />
        </>
      );
    case 'plus':
      return <Path d="M12 5v14M5 12h14" {...stroke} />;
    case 'minus':
      return <Path d="M5 12h14" {...stroke} />;
    case 'dashboard':
      return (
        <>
          <Circle cx={7} cy={7} r={3.5} fill={color} />
          <Circle cx={17} cy={7} r={3.5} fill={color} />
          <Circle cx={7} cy={17} r={3.5} fill={color} />
          <Circle cx={17} cy={17} r={3.5} fill={color} />
        </>
      );
    case 'watch':
      return (
        <>
          <Rect x={3} y={3} width={18} height={18} rx={4} fill={color} />
          <Path d="M10 8v8l6-4z" fill={accentColor} />
        </>
      );
    case 'library':
      return (
        <>
          <Rect x={5} y={3} width={14} height={2} rx={1} fill={color} />
          <Rect x={3} y={6.5} width={18} height={14.5} rx={2} fill={color} />
        </>
      );
    case 'list':
      return (
        <>
          <Circle cx={4} cy={6} r={1.5} fill={color} />
          <Circle cx={4} cy={12} r={1.5} fill={color} />
          <Circle cx={4} cy={18} r={1.5} fill={color} />
          <Path d="M8.5 6H21M8.5 12H21M8.5 18H21" {...stroke} />
        </>
      );
  }
}
