import { colors } from '../../../core/theme';

/** Genre chip colour: cycles teal, pink, purple, gold by position. */
export function genreColor(index: number): string {
  return colors.genre[index % colors.genre.length];
}
