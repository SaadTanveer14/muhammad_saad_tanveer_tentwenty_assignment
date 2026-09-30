import { imageUrl, type ImageSize } from '../../../core/api';
import type { ImageSource } from '../../../core/types';
import type { Movie, MovieDetail, Page, Video } from '../domain/types';
import type {
  ImagesDto,
  MovieDetailDto,
  MovieDto,
  MoviePageDto,
  VideosDto,
} from './dto';

const emptyToNull = (value: string | null | undefined) => value || null;

function tmdbImage(
  path: string | null | undefined,
  size: ImageSize,
): ImageSource | null {
  const uri = imageUrl(emptyToNull(path), size);
  return uri ? { uri } : null;
}

export function toMovie(dto: MovieDto): Movie {
  return {
    id: dto.id,
    title: dto.title,
    overview: dto.overview,
    releaseDate: emptyToNull(dto.release_date),
    poster: tmdbImage(dto.poster_path, 'w500'),
    backdrop: tmdbImage(dto.backdrop_path, 'w780'),
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

export function toMovieDetail(
  dto: MovieDetailDto,
  images?: ImagesDto,
): MovieDetail {
  const logo =
    images?.logos.find(l => l.iso_639_1 === 'en') ?? images?.logos[0];
  return {
    id: dto.id,
    title: dto.title,
    overview: dto.overview,
    releaseDate: emptyToNull(dto.release_date),
    poster: tmdbImage(dto.poster_path, 'w500'),
    backdrop: tmdbImage(dto.backdrop_path, 'w780'),
    voteAverage: dto.vote_average,
    genres: dto.genres,
    runtimeMinutes: dto.runtime ?? null,
    tagline: emptyToNull(dto.tagline),
    logo: tmdbImage(logo?.file_path, 'w500'),
  };
}

export function toVideos(dto: VideosDto): Video[] {
  return dto.results.map(v => ({
    id: v.id,
    key: v.key,
    name: v.name,
    site: v.site,
    type: v.type,
    official: v.official,
    publishedAt: v.published_at ?? null,
  }));
}
