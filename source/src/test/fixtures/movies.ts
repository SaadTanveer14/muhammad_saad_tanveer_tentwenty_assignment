/** Raw TMDb payloads, shaped like the documented responses. */

export const upcomingPage1 = {
  page: 1,
  total_pages: 2,
  total_results: 3,
  results: [
    {
      adult: false,
      backdrop_path: '/batman-bg.jpg',
      genre_ids: [28, 80],
      id: 1,
      title: 'Batman Begins',
      original_language: 'en',
      original_title: 'Batman Begins',
      overview: 'A young Bruce Wayne...',
      popularity: 51.2,
      poster_path: '/batman.jpg',
      release_date: '2005-06-15',
      video: false,
      vote_average: 7.7,
      vote_count: 20000,
    },
    {
      adult: false,
      backdrop_path: null,
      genre_ids: [35],
      id: 2,
      title: 'Free Guy',
      original_language: 'en',
      original_title: 'Free Guy',
      overview: 'A bank teller...',
      popularity: 30.1,
      poster_path: '',
      release_date: '2021-08-11',
      video: false,
      vote_average: 7.5,
      vote_count: 9000,
    },
  ],
};

export const emptyPage = {
  page: 1,
  total_pages: 1,
  total_results: 0,
  results: [],
};

export const movieDetail = {
  adult: false,
  backdrop_path: '/batman-bg.jpg',
  genres: [{ id: 28, name: 'Action' }],
  homepage: '',
  id: 1,
  imdb_id: 'tt0372784',
  original_language: 'en',
  original_title: 'Batman Begins',
  overview: 'A young Bruce Wayne...',
  poster_path: '/batman.jpg',
  release_date: '2005-06-15',
  runtime: 140,
  status: 'Released',
  tagline: 'Evil fears the knight.',
  title: 'Batman Begins',
  video: false,
  vote_average: 7.7,
  vote_count: 20000,
};

export const movieVideos = {
  id: 1,
  results: [
    {
      iso_639_1: 'en',
      iso_3166_1: 'US',
      name: 'Official Trailer',
      key: 'neY2xVmOfUM',
      site: 'YouTube',
      size: 1080,
      type: 'Trailer',
      official: true,
      id: 'v1',
      published_at: '2005-01-01T00:00:00.000Z',
    },
  ],
};

export const movieImages = {
  backdrops: [
    {
      aspect_ratio: 1.778,
      height: 1080,
      iso_3166_1: null,
      iso_639_1: null,
      file_path: '/images-backdrop.jpg',
      vote_average: 5.3,
      vote_count: 4,
      width: 1920,
    },
  ],
};

export const notFoundError = {
  success: false,
  status_code: 34,
  status_message: 'The resource you requested could not be found.',
};
