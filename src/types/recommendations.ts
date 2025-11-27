import * as z from 'zod';
import type { Movie } from './movie.js';

// Schemas
export const movieRecommendationSchema = z.object({
  page: z.string().regex(/^\d+$/).default('1'),
});

// Input types
export type RecommendationQuery = z.infer<typeof movieRecommendationSchema>;

// Response types
export type RecommendationResponse = {
  results: Movie[];
  nextPage: number | null;
};

export type RecommendationErrorResponse = {
  error: string;
};
