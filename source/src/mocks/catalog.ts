import type {
  Genre,
  MovieDetail,
  Video,
} from '../features/movies/domain/types';
import { mockImages } from './images';

/** TMDb genre ids, so mock and API data share identifiers. */
export const GENRE = {
  action: 28,
  adventure: 12,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  horror: 27,
  sciFi: 878,
  thriller: 53,
  war: 10752,
} as const;

export const mockGenres: Genre[] = [
  { id: GENRE.action, name: 'Action' },
  { id: GENRE.adventure, name: 'Adventure' },
  { id: GENRE.comedy, name: 'Comedy' },
  { id: GENRE.crime, name: 'Crime' },
  { id: GENRE.documentary, name: 'Documentary' },
  { id: GENRE.drama, name: 'Drama' },
  { id: GENRE.family, name: 'Family' },
  { id: GENRE.fantasy, name: 'Fantasy' },
  { id: GENRE.horror, name: 'Horror' },
  { id: GENRE.sciFi, name: 'Sci-Fi' },
  { id: GENRE.thriller, name: 'Thriller' },
  { id: GENRE.war, name: 'War' },
];

const genres = (...ids: number[]): Genre[] =>
  ids.map(id => mockGenres.find(g => g.id === id)!);

export interface MockMovie {
  detail: MovieDetail;
  videos: Video[];
}

const trailer = (key: string, name: string): Video => ({
  id: `video-${key}`,
  key,
  name,
  site: 'YouTube',
  type: 'Trailer',
  official: true,
  publishedAt: null,
});

/**
 * The six titles from the mockups, in list order. Trailer keys are real
 * YouTube videos (verified via oEmbed); overviews are original summaries.
 */
export const mockMovies: MockMovie[] = [
  {
    detail: {
      id: 550988,
      title: 'Free Guy',
      overview:
        'A bank teller discovers he is a background character in a sprawling open-world video game, and decides to become the hero of his own story before the developers shut his world down.',
      releaseDate: '2021-08-11',
      poster: mockImages.movies.freeGuy,
      backdrop: mockImages.movies.freeGuy,
      voteAverage: 7.6,
      genres: genres(GENRE.comedy, GENRE.action, GENRE.adventure, GENRE.sciFi),
      runtimeMinutes: 115,
      tagline: 'Life’s too short to be a background character.',
      logo: null,
    },
    videos: [trailer('X2m-08cOAbc', 'Free Guy | Official Trailer')],
  },
  {
    detail: {
      id: 476669,
      title: 'The King’s Man',
      overview:
        'As a collection of history’s worst tyrants and criminal masterminds gather to plot a war that could wipe out millions, one man must race against time to stop them. Discover the origins of the very first independent intelligence agency.',
      releaseDate: '2021-12-22',
      poster: mockImages.movies.kingsMan,
      backdrop: mockImages.movies.kingsMan,
      voteAverage: 7.0,
      genres: genres(GENRE.action, GENRE.thriller, GENRE.adventure, GENRE.war),
      runtimeMinutes: 131,
      tagline: 'Witness the bloody origin.',
      logo: null,
    },
    videos: [trailer('5zdBG-iGfes', 'The King’s Man | Official Trailer')],
  },
  {
    detail: {
      id: 515001,
      title: 'Jojo Rabbit',
      overview:
        'A lonely boy in wartime Germany, whose only friend is an imaginary and very opinionated version of his country’s leader, has his worldview turned upside down when he finds a girl hiding in his attic.',
      releaseDate: '2019-10-18',
      poster: mockImages.movies.jojoRabbit,
      backdrop: mockImages.movies.jojoRabbit,
      voteAverage: 8.0,
      genres: genres(GENRE.comedy, GENRE.war, GENRE.drama),
      runtimeMinutes: 108,
      tagline: 'An anti-hate satire.',
      logo: null,
    },
    videos: [trailer('tL4McUzXfFI', 'Jojo Rabbit | Official Trailer')],
  },
  {
    detail: {
      id: 66786,
      title: 'Timeless',
      overview:
        'A history professor, a soldier and a scientist chase a criminal through time, trying to stop him from rewriting the most important moments of the past.',
      releaseDate: '2016-10-03',
      poster: mockImages.movies.timeless,
      backdrop: mockImages.movies.timeless,
      voteAverage: 7.4,
      genres: genres(GENRE.fantasy, GENRE.drama, GENRE.adventure),
      runtimeMinutes: 43,
      tagline: null,
      logo: null,
    },
    videos: [trailer('zSYZJGAGvww', 'Timeless | Trailer')],
  },
  {
    detail: {
      id: 49530,
      title: 'In Time',
      overview:
        'In a future where people stop ageing at twenty-five and time itself is the currency, a man accused of murder goes on the run with a hostage and takes on a system built to keep the rich immortal.',
      releaseDate: '2011-10-27',
      poster: mockImages.movies.inTime,
      backdrop: mockImages.movies.inTime,
      voteAverage: 6.8,
      genres: genres(GENRE.sciFi, GENRE.thriller, GENRE.action),
      runtimeMinutes: 109,
      tagline: 'Live forever or die trying.',
      logo: null,
    },
    videos: [trailer('YRSBiTF3wNw', 'In Time | Official Trailer')],
  },
  {
    detail: {
      id: 1645,
      title: 'A Time To Kill',
      overview:
        'A young lawyer defends a father on trial for taking justice into his own hands in a small Mississippi town, as the case tears the community apart.',
      releaseDate: '1996-07-24',
      poster: mockImages.movies.aTimeToKill,
      backdrop: mockImages.movies.aTimeToKill,
      voteAverage: 7.3,
      genres: genres(GENRE.crime, GENRE.drama, GENRE.thriller),
      runtimeMinutes: 149,
      tagline: null,
      logo: null,
    },
    videos: [trailer('SQ07974jlWA', 'A Time to Kill | Trailer')],
  },
];
