export const upcomingPage1 = {
  page: 1,
  total_pages: 2,
  total_results: 3,
  results: [
    {
      id: 1,
      title: 'Batman Begins',
      overview: 'A young Bruce Wayne...',
      release_date: '2005-06-15',
      poster_path: '/batman.jpg',
      backdrop_path: '/batman-bg.jpg',
      vote_average: 7.7,
      genre_ids: [28, 80],
    },
    {
      id: 2,
      title: 'Free Guy',
      overview: 'A bank teller...',
      release_date: '2021-08-11',
      poster_path: null,
      backdrop_path: '',
      vote_average: 7.5,
      genre_ids: [35],
    },
  ],
};

export const movieDetail = {
  id: 1,
  title: 'Batman Begins',
  overview: 'A young Bruce Wayne...',
  release_date: '2005-06-15',
  poster_path: '/batman.jpg',
  backdrop_path: '/batman-bg.jpg',
  vote_average: 7.7,
  genres: [{ id: 28, name: 'Action' }],
  runtime: 140,
  tagline: 'Evil fears the knight.',
};

export const movieVideos = {
  id: 1,
  results: [
    {
      id: 'v1',
      key: 'neY2xVmOfUM',
      name: 'Official Trailer',
      site: 'YouTube',
      type: 'Trailer',
      official: true,
      published_at: '2005-01-01T00:00:00.000Z',
    },
  ],
};

export const notFoundError = {
  success: false,
  status_code: 34,
  status_message: 'The resource you requested could not be found.',
};
