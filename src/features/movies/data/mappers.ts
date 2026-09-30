import type { ImageSource } from '../../../core/types';
import {
  buildImageUrl,
  tmdbConfig,
  type MovieDetailsDto,
  type MovieImagesDto,
  type MoviePageDto,
  type MovieSummaryDto,
  type MovieVideosDto,
  type TmdbImageSize,
} from '../../../services/tmdb';
import type { Movie, MovieDetail, Page, Video } from '../domain/types';

const emptyToNull = (value: string | null | undefined) => value || null;

function image(
  path: string | null | undefined,
  size: TmdbImageSize,
): ImageSource | null {
  const uri = buildImageUrl(path, size);
  return uri ? { uri } : null;
}

export function toMovie(dto: MovieSummaryDto): Movie {
  return {
    id: dto.id,
    title: dto.title,
    overview: dto.overview,
    releaseDate: emptyToNull(dto.release_date),
    poster: image(dto.poster_path, tmdbConfig.imageSizes.poster),
    backdrop: image(dto.backdrop_path, tmdbConfig.imageSizes.backdrop),
    voteAverage: dto.vote_average,
    genreIds: dto.genre_ids,
  };
}

export function toMoviePage(dto: MoviePageDto): Page<Movie> {
  return {
    page: dto.page,
    totalPages: dto.total_pages,
    totalResults: dto.total_results,
    results: dto.results.map(toMovie),
  };
}

/**
 * Details are the source of truth; the images response only fills in a
 * backdrop when the details have none.
 */
export function toMovieDetail(
  dto: MovieDetailsDto,
  images: MovieImagesDto | null,
): MovieDetail {
  const backdropPath =
    emptyToNull(dto.backdrop_path) ?? images?.backdrops[0]?.file_path;
  return {
    id: dto.id,
    title: dto.title,
    overview: dto.overview,
    releaseDate: emptyToNull(dto.release_date),
    poster: image(dto.poster_path, tmdbConfig.imageSizes.poster),
    backdrop: image(backdropPath, tmdbConfig.imageSizes.backdrop),
    voteAverage: dto.vote_average,
    genres: dto.genres,
    runtimeMinutes: dto.runtime ?? null,
    tagline: emptyToNull(dto.tagline),
    // Title artwork isn't part of the documented images contract.
    logo: null,
  };
}

/** Videos without a key can't be played, so they're dropped here. */
export function toVideos(dto: MovieVideosDto): Video[] {
  return dto.results.flatMap(v =>
    v.key
      ? [
          {
            id: v.id,
            key: v.key,
            name: v.name,
            site: v.site,
            type: v.type,
            official: v.official,
            publishedAt: v.published_at ?? null,
          },
        ]
      : [],
  );
}
