import { tmdbConfig, type TmdbImageSize } from './config';

/**
 * `{IMAGE_BASE_URL}/{size}/{file_path}` with exactly one slash between each
 * part. Returns `null` for a missing path, so no URL is ever built for
 * absent media.
 */
export function buildImageUrl(
  filePath: string | null | undefined,
  size: TmdbImageSize,
): string | null {
  if (!filePath) {
    return null;
  }
  const base = tmdbConfig.imageBaseUrl.replace(/\/+$/, '');
  return `${base}/${size}/${filePath.replace(/^\/+/, '')}`;
}
