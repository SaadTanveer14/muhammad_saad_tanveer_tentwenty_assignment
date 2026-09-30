export const movieKeys = {
  all: ['movies'] as const,
  upcoming: () => [...movieKeys.all, 'upcoming'] as const,
  detail: (id: number) => [...movieKeys.all, 'detail', id] as const,
  videos: (id: number) => [...movieKeys.all, 'videos', id] as const,
  genres: () => [...movieKeys.all, 'genres'] as const,
};
