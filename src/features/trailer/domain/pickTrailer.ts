import type { Video } from '../../movies/domain/types';

/**
 * The video to play for "Watch Trailer": a YouTube "Trailer", then a
 * "Teaser"; official uploads first, newest first. `null` hides the button.
 */
export function pickTrailer(videos: Video[]): Video | null {
  const youtube = videos.filter(v => v.site === 'YouTube' && v.key);
  const rank = (v: Video) =>
    (v.type === 'Trailer' ? 0 : 2) + (v.official ? 0 : 1);

  const candidates = youtube
    .filter(v => v.type === 'Trailer' || v.type === 'Teaser')
    .sort(
      (a, b) =>
        rank(a) - rank(b) ||
        (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''),
    );
  return candidates[0] ?? null;
}
