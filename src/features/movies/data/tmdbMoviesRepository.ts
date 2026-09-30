import { httpClient } from '../../../core/api';
import type { MoviesRepository } from '../domain/MoviesRepository';
import {
  genreListDto,
  imagesDto,
  movieDetailDto,
  moviePageDto,
  videosDto,
} from './dto';
import { toMovieDetail, toMoviePage, toVideos } from './mappers';

export const tmdbMoviesRepository: MoviesRepository = {
  async getUpcoming(page, signal) {
    const dto = await httpClient.get('/movie/upcoming', {
      schema: moviePageDto,
      params: { page, language: 'en-US' },
      signal,
    });
    return toMoviePage(dto);
  },

  async getDetail(id, signal) {
    const [detail, images] = await Promise.all([
      httpClient.get(`/movie/${id}`, {
        schema: movieDetailDto,
        params: { language: 'en-US' },
        signal,
      }),
      httpClient.get(`/movie/${id}/images`, {
        schema: imagesDto,
        params: { include_image_language: 'en,null' },
        signal,
      }),
    ]);
    return toMovieDetail(detail, images);
  },

  async getVideos(id, signal) {
    const dto = await httpClient.get(`/movie/${id}/videos`, {
      schema: videosDto,
      signal,
    });
    return toVideos(dto);
  },

  async getGenres(signal) {
    const dto = await httpClient.get('/genre/movie/list', {
      schema: genreListDto,
      params: { language: 'en-US' },
      signal,
    });
    return dto.genres;
  },
};
