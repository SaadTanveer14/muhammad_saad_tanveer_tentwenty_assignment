import type { ImageSource } from '../../../core/types';

/** A tile on the browse grid; opens the movies for `genreId`. */
export interface Category {
  id: string;
  name: string;
  image: ImageSource | null;
  /** TMDb genre id; null for editorial categories with no genre (empty). */
  genreId: number | null;
}
