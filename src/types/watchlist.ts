import * as z from 'zod';
import type { Watchlist, Movies } from '@prisma/client';

// Schemas
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

// Input types
export type AddToWatchlistInput = z.infer<typeof addToWatchlistSchema>;
export type AddBulkToWatchlistInput = z.infer<typeof addBulkToWatchlistSchema>;
export type RemoveFromWatchlistParams = z.infer<
  typeof removeFromWatchlistSchema
>;

// Response types
export type WatchlistItemWithMovie = Watchlist & {
  movie: Movies;
};

export type WatchlistResponse = {
  watchlist: WatchlistItemWithMovie[];
};

export type AddToWatchlistResponse = {
  message: string;
  watchlistItem: Watchlist;
};

export type RemoveFromWatchlistResponse = {
  message: string;
};

export type WatchlistErrorResponse = {
  message: string;
};
