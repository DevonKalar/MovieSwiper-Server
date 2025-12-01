import * as z from 'zod';

export const addToWatchlistSchema = z.object({
  movie: z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    releaseDate: z.string(),
    posterUrl: z.string(),
    genres: z.array(z.string()),
    ratings: z.number(),
  }),
});

export const addBulkToWatchlistSchema = z.object({
  movies: z.array(addToWatchlistSchema.shape.movie),
});

export const removeFromWatchlistSchema = z.object({
  id: z.string().min(1),
});

export type AddToWatchlistInput = z.infer<typeof addToWatchlistSchema>;
export type AddBulkToWatchlistInput = z.infer<typeof addBulkToWatchlistSchema>;
export type RemoveFromWatchlistParams = z.infer<
  typeof removeFromWatchlistSchema
>;
