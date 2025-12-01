import type { Watchlist, Movies } from '@prisma/client';

// Domain types
export type WatchlistItemWithMovie = Watchlist & {
  movie: Movies;
};

// Response types
export type WatchlistResponse = {
  watchlist: WatchlistItemWithMovie[];
};

export type AddToWatchlistResponse = {
  message: string;
  watchlistItem: Watchlist;
};

export type BulkAddToWatchlistResponse = {
  message: string;
};

export type RemoveFromWatchlistResponse = {
  message: string;
};

// Error responses
export type WatchlistErrorResponse = {
  message: string;
};
