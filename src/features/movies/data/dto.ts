import { z } from 'zod';

/** Raw TMDb shapes. Only the data layer may import from this file. */

export const movieDto = z.object({
  id: z.number(),
  title: z.string(),
  overview: z.string().default(''),
  release_date: z.string().nullish(),
  poster_path: z.string().nullish(),
  backdrop_path: z.string().nullish(),
  vote_average: z.number().default(0),
  genre_ids: z.array(z.number()).default([]),
});
export type MovieDto = z.infer<typeof movieDto>;

export const pageDto = <T extends z.ZodType>(item: T) =>
  z.object({
    page: z.number(),
    total_pages: z.number(),
    total_results: z.number(),
    results: z.array(item),
  });

export const moviePageDto = pageDto(movieDto);
export type MoviePageDto = z.infer<typeof moviePageDto>;

export const genreDto = z.object({ id: z.number(), name: z.string() });

export const movieDetailDto = movieDto.omit({ genre_ids: true }).extend({
  genres: z.array(genreDto).default([]),
  runtime: z.number().nullish(),
  tagline: z.string().nullish(),
});
export type MovieDetailDto = z.infer<typeof movieDetailDto>;

export const videoDto = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  site: z.string(),
  type: z.string(),
  official: z.boolean().default(false),
  published_at: z.string().nullish(),
});

export const videosDto = z.object({
  id: z.number(),
  results: z.array(videoDto),
});
export type VideosDto = z.infer<typeof videosDto>;

export const genreListDto = z.object({ genres: z.array(genreDto) });

export const imagesDto = z.object({
  id: z.number(),
  logos: z
    .array(
      z.object({
        file_path: z.string(),
        iso_639_1: z.string().nullish(),
      }),
    )
    .default([]),
});
export type ImagesDto = z.infer<typeof imagesDto>;
