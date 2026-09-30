import { GENRE } from '../../../mocks/catalog';
import { mockImages } from '../../../mocks/images';
import type { Category } from '../domain/types';

/** The browse grid from the design, in its order. */
export const mockCategories: Category[] = [
  {
    id: 'comedies',
    name: 'Comedies',
    image: mockImages.genres.comedies,
    genreId: GENRE.comedy,
  },
  {
    id: 'crime',
    name: 'Crime',
    image: mockImages.genres.crime,
    genreId: GENRE.crime,
  },
  {
    id: 'family',
    name: 'Family',
    image: mockImages.genres.family,
    genreId: GENRE.family,
  },
  {
    id: 'documentaries',
    name: 'Documentaries',
    image: mockImages.genres.documentaries,
    genreId: GENRE.documentary,
  },
  {
    id: 'dramas',
    name: 'Dramas',
    image: mockImages.genres.dramas,
    genreId: GENRE.drama,
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    image: mockImages.genres.fantasy,
    genreId: GENRE.fantasy,
  },
  {
    id: 'holidays',
    name: 'Holidays',
    image: mockImages.genres.holidays,
    genreId: null,
  },
  {
    id: 'horror',
    name: 'Horror',
    image: mockImages.genres.horror,
    genreId: GENRE.horror,
  },
  {
    id: 'sci-fi',
    name: 'Sci-Fi',
    image: mockImages.genres.sciFi,
    genreId: GENRE.sciFi,
  },
  {
    id: 'thriller',
    name: 'Thriller',
    image: mockImages.genres.thriller,
    genreId: GENRE.thriller,
  },
];
