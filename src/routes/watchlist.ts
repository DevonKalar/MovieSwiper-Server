import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import { validateReqBody, validateReqParams } from '../middleware/validate.js';
import {
  addToWatchlistSchema,
  addBulkToWatchlistSchema,
  type AddToWatchlistInput,
  type WatchlistResponse,
  type AddToWatchlistResponse,
  type WatchlistErrorResponse,
  removeFromWatchlistSchema,
  type RemoveFromWatchlistParams,
  type RemoveFromWatchlistResponse,
} from '../types/watchlist.js';
import { type Movie } from '@/types/movie.js';

/*
 * Watchlist routes for managing user's movie watchlist.
 */

const watchlistRouter = Router();

// get route to fetch user's watchlist
watchlistRouter.get('/', async (req, res) => {
  if (!req.user?.id) {
    const errorResponse: WatchlistErrorResponse = { message: 'Unauthorized' };
    return res.status(401).json(errorResponse);
  }

  try {
    const userWatchlist = await prisma.watchlist.findMany({
      where: { userId: req.user.id },
      include: { movie: true },
      orderBy: { createdAt: 'desc' },
    });

    const response: WatchlistResponse = { watchlist: userWatchlist };
    res.json(response);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    const errorResponse: WatchlistErrorResponse = {
      message: 'Failed to fetch watchlist',
    };
    res.status(500).json(errorResponse);
  }
});

// post route to add a movie to user's watchlist
watchlistRouter.post('/', validateReqBody(addToWatchlistSchema), async (req, res) => {
    if (!req.user?.id) {
      const errorResponse: WatchlistErrorResponse = { message: 'Unauthorized' };
      return res.status(401).json(errorResponse);
    }

    const { movie } = req.validatedBody as AddToWatchlistInput;

    try {
      const result = await prisma.$transaction(async (tx) => {
        // upsert movie into Movies table
        const movieEntry = await tx.movies.upsert({
          where: { tmdbId: movie.tmdbId },
          update: {
            title: movie.title,
            tmdbId: movie.tmdbId,
            description: movie.description,
            releaseDate: new Date(movie.releaseDate),
            posterUrl: movie.posterUrl,
            genres: movie.genres,
            ratings: movie.ratings,
          },
          create: {
            title: movie.title,
            tmdbId: movie.tmdbId,
            description: movie.description,
            releaseDate: new Date(movie.releaseDate),
            posterUrl: movie.posterUrl,
            genres: movie.genres,
            ratings: movie.ratings,
          },
        });

        // add entry to Watchlist table
        const watchlistEntry = await tx.watchlist.create({
          data: {
            userId: req.user!.id,
            movieId: movieEntry.id,
          },
        });

        return watchlistEntry;
      });

      const response: AddToWatchlistResponse = {
        message: 'Movie added to watchlist',
        watchlistItem: result,
      };
      res.status(201).json(response);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const conflictResponse: WatchlistErrorResponse = {
          message: 'Movie already in watchlist',
        };
        return res.status(409).json(conflictResponse);
      }
      console.error('Error adding movie to watchlist:', error);
      const errorResponse: WatchlistErrorResponse = {
        message: 'Failed to add movie to watchlist',
      };
      res.status(500).json(errorResponse);
    }
  }
);

watchlistRouter.post('/bulk', validateReqBody(addBulkToWatchlistSchema), async (req, res) => {
  const userId = req.user!.id;

  const moviesToAdd: Movie[] = req.validatedBody?.movies;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Upsert each movie individually to get their IDs
      const movieEntries = await Promise.all(
        moviesToAdd.map((movie) =>
          tx.movies.upsert({
            where: { tmdbId: movie.tmdbId },
            update: {
              title: movie.title,
              description: movie.description,
              releaseDate: new Date(movie.releaseDate),
              posterUrl: movie.posterUrl,
              genres: movie.genres,
              ratings: movie.ratings,
            },
            create: {
              tmdbId: movie.tmdbId,
              title: movie.title,
              description: movie.description,
              releaseDate: new Date(movie.releaseDate),
              posterUrl: movie.posterUrl,
              genres: movie.genres,
              ratings: movie.ratings,
            },
          })
        )
      );

      // Create watchlist entries using the movie IDs
      const watchlistEntries = await tx.watchlist.createMany({
        data: movieEntries.map((movieEntry) => ({
          userId,
          movieId: movieEntry.id,
        })),
        skipDuplicates: true,
      });

      return { movieEntries, watchlistEntries };
    });

    const response = {
      message: `${result.watchlistEntries.count} movies added to watchlist`,
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error adding movies to watchlist:', error);
    const errorResponse: WatchlistErrorResponse = {
      message: 'Failed to add movies to watchlist',
    };
    res.status(500).json(errorResponse);
  }
});

// delete route to remove a movie from user's watchlist

watchlistRouter.delete('/:id', validateReqParams(removeFromWatchlistSchema), async (req, res) => {
    if (!req.user?.id) {
      const errorResponse: WatchlistErrorResponse = { message: 'Unauthorized' };
      return res.status(401).json(errorResponse);
    }

    const { id } = req.validatedParams as RemoveFromWatchlistParams;

    try {
      const watchlistEntry = await prisma.watchlist.findFirst({
        where: {
          userId: req.user.id,
          movieId: parseInt(id),
        },
      });

      if (!watchlistEntry) {
        const notFoundResponse: WatchlistErrorResponse = {
          message: 'Watchlist item not found',
        };
        return res.status(404).json(notFoundResponse);
      }

      await prisma.watchlist.delete({
        where: { id: watchlistEntry.id },
      });
      const response: RemoveFromWatchlistResponse = {
        message: 'Movie removed from watchlist',
      };
      res.status(204).send(response);
    } catch (error) {
      console.error('Error removing movie from watchlist:', error);
      const errorResponse: WatchlistErrorResponse = {
        message: 'Failed to remove movie from watchlist',
      };
      res.status(500).json(errorResponse);
    }
  }
);

export default watchlistRouter;
