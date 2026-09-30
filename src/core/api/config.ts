import Config from 'react-native-config';

export const apiConfig = {
  baseUrl: Config.TMDB_API_BASE_URL ?? 'https://api.themoviedb.org/3',
  imageBaseUrl: Config.TMDB_IMAGE_BASE_URL ?? 'https://image.tmdb.org/t/p',
  readToken: Config.TMDB_READ_TOKEN ?? '',
  /**
   * Screens read from in-memory mock repositories until the TMDb integration
   * lands. Set `USE_MOCK_DATA=false` in `.env` (and rebuild) to use the API.
   */
  useMockData: Config.USE_MOCK_DATA !== 'false',
} as const;

export type ImageSize = 'w185' | 'w342' | 'w500' | 'w780' | 'original';

export function imageUrl(
  path: string | null | undefined,
  size: ImageSize,
): string | null {
  return path ? `${apiConfig.imageBaseUrl}/${size}${path}` : null;
}
