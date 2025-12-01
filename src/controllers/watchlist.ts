import type { Request, Response } from 'express';
import {
  getWatchlist,
  addMovieToWatchlist,
  addBulkMoviesToWatchlist,
  removeMovieFromWatchlist,
} from '@/services/watchlist.js';
import type {
  AddToWatchlistInput,
  RemoveFromWatchlistParams,
} from '@/models/watchlist.js';
import type {
  WatchlistResponse,
  AddToWatchlistResponse,
  BulkAddToWatchlistResponse,
  RemoveFromWatchlistResponse,
  WatchlistErrorResponse,
} from '@/types/watchlist.js';
import type { Movie } from '@/types/movie.js';
import { Prisma } from '@prisma/client';

export async function getUserWatchlist(
  req: Request,
  res: Response<WatchlistResponse | WatchlistErrorResponse>
) {
  if (!req.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const userWatchlist = await getWatchlist(req.user.id);
    res.json({ watchlist: userWatchlist });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ message: 'Failed to fetch watchlist' });
  }
}

export async function addToWatchlist(
  req: Request,
  res: Response<AddToWatchlistResponse | WatchlistErrorResponse>
) {
  if (!req.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { movie } = req.validatedBody as AddToWatchlistInput;

  try {
    const result = await addMovieToWatchlist(req.user.id, movie);
    res.status(201).json({
      message: 'Movie added to watchlist',
      watchlistItem: result,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return res.status(409).json({ message: 'Movie already in watchlist' });
    }
    console.error('Error adding movie to watchlist:', error);
    res.status(500).json({ message: 'Failed to add movie to watchlist' });
  }
}

export async function addBulkToWatchlist(
  req: Request,
  res: Response<BulkAddToWatchlistResponse | WatchlistErrorResponse>
) {
  if (!req.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const moviesToAdd: Movie[] = req.validatedBody?.movies;

  try {
    const count = await addBulkMoviesToWatchlist(req.user.id, moviesToAdd);
    res.status(201).json({
      message: `${count} movies added to watchlist`,
    });
  } catch (error) {
    console.error('Error adding movies to watchlist:', error);
    res.status(500).json({ message: 'Failed to add movies to watchlist' });
  }
}

export async function removeFromWatchlist(
  req: Request,
  res: Response<RemoveFromWatchlistResponse | WatchlistErrorResponse>
) {
  if (!req.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.validatedParams as RemoveFromWatchlistParams;

  try {
    await removeMovieFromWatchlist(req.user.id, parseInt(id));
    res.status(204).send({ message: 'Movie removed from watchlist' });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Watchlist item not found'
    ) {
      return res.status(404).json({ message: 'Watchlist item not found' });
    }
    console.error('Error removing movie from watchlist:', error);
    res.status(500).json({ message: 'Failed to remove movie from watchlist' });
  }
}
