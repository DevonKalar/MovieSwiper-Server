import * as z from 'zod';

// Schemas
export const movieDetailsSchema = z.object({
  id: z.string().min(1),
});

export const movieQuerySchema = z.object({
  include_adult: z.enum(['true', 'false']).default('false'),
  include_video: z.enum(['true', 'false']).default('false'),
  language: z.string().default('en-US'),
  page: z.string().regex(/^\d+$/).default('1'),
  sort_by: z.string().default('popularity.desc'),
  with_genres: z.string().optional(),
});

// Input types
export type MovieDetailsParams = z.infer<typeof movieDetailsSchema>;
export type MovieQuery = z.infer<typeof movieQuerySchema>;

// Response types
export type TMDBGenre = {
  id: number;
  name: string;
};

export type TMDBMovieDetails = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime: number;
  genres: TMDBGenre[];
  status: string;
};

export type TMDBMoviesResponse = {
  page: number;
  results: unknown[];
  total_pages: number;
  total_results: number;
};

export type TMDBGenresResponse = {
  genres: TMDBGenre[];
};

export type TMDBErrorResponse = {
  error: string;
};

export type TMDBNotFoundResponse = {
  error: string;
};
