import { z } from 'zod';

/**
 * TMDb response shapes (per the API spec). Only documented fields; fields
 * the app doesn't read are left out and ignored when parsing. Nullable media
 * is tolerated everywhere.
 */

const path = z.string().nullish();

export const movieSummarySchema = z.object({
  id: z.number(),
  title: z.string(),
  original_title: z.string().optional(),
  original_language: z.string().optional(),
  overview: z.string().default(''),
  popularity: z.number().optional(),
  poster_path: path,
  backdrop_path: path,
  release_date: z.string().nullish(),
  genre_ids: z.array(z.number()).default([]),
  vote_average: z.number().default(0),
  vote_count: z.number().optional(),
  adult: z.boolean().optional(),
  video: z.boolean().optional(),
});
export type MovieSummaryDto = z.infer<typeof movieSummarySchema>;

/** `page`, `total_pages`, `total_results`, `results` — kept for pagination. */
export const pageSchema = <T extends z.ZodType>(item: T) =>
  z.object({
    page: z.number(),
    total_pages: z.number(),
    total_results: z.number(),
    results: z.array(item),
  });

export const moviePageSchema = pageSchema(movieSummarySchema);
export type MoviePageDto = z.infer<typeof moviePageSchema>;

export const genreSchema = z.object({ id: z.number(), name: z.string() });

export const movieDetailsSchema = movieSummarySchema
  .omit({ genre_ids: true })
  .extend({
    genres: z.array(genreSchema).default([]),
    homepage: z.string().nullish(),
    imdb_id: z.string().nullish(),
    runtime: z.number().nullish(),
    status: z.string().nullish(),
    tagline: z.string().nullish(),
  });
export type MovieDetailsDto = z.infer<typeof movieDetailsSchema>;

export const movieVideoSchema = z.object({
  id: z.string(),
  key: z.string().nullish(),
  name: z.string().default(''),
  site: z.string().default(''),
  size: z.number().optional(),
  type: z.string().default(''),
  official: z.boolean().default(false),
  published_at: z.string().nullish(),
  iso_639_1: z.string().nullish(),
  iso_3166_1: z.string().nullish(),
});

export const movieVideosSchema = z.object({
  id: z.number(),
  results: z.array(movieVideoSchema).default([]),
});
export type MovieVideosDto = z.infer<typeof movieVideosSchema>;

export const movieImageSchema = z.object({
  file_path: z.string(),
  aspect_ratio: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  iso_639_1: z.string().nullish(),
  iso_3166_1: z.string().nullish(),
  vote_average: z.number().optional(),
  vote_count: z.number().optional(),
});

export const movieImagesSchema = z.object({
  backdrops: z.array(movieImageSchema).default([]),
});
export type MovieImagesDto = z.infer<typeof movieImagesSchema>;

/** `{ success: false, status_code, status_message }` */
export const errorSchema = z.object({
  success: z.literal(false).optional(),
  status_code: z.number().optional(),
  status_message: z.string(),
});
