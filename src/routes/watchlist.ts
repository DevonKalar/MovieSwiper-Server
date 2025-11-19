import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import { validateReqBody } from '../middleware/validate.js';
import {
  addToWatchlistSchema,
  type AddToWatchlistInput,
  type WatchlistResponse,
  type AddToWatchlistResponse,
  type WatchlistErrorResponse,
} from '../types/watchlist.js';

/*
 * Watchlist routes for managing user's movie watchlist.
 */

const watchlistRouter = Router();

// get route to fetch user's watchlist
watchlistRouter.get('/', async (req, res) => {
  if (!req.user?.Id) {
    const errorResponse: WatchlistErrorResponse = { message: 'Unauthorized' };
    return res.status(401).json(errorResponse);
  }

  try {
    const userWatchlist = await prisma.watchlist.findMany({
      where: { userId: req.user.Id },
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
    if (!req.user?.Id) {
      const errorResponse: WatchlistErrorResponse = { message: 'Unauthorized' };
      return res.status(401).json(errorResponse);
    }

    const { movie } = req.validatedBody as AddToWatchlistInput;

    try {
      const result = await prisma.$transaction(async (tx) => {
        // upsert movie into Movies table
        const movieEntry = await tx.movies.upsert({
          where: { tmdbId: movie.id },
          update: {
            title: movie.title,
            tmdbId: movie.id,
            description: movie.description,
            releaseDate: new Date(movie.releaseDate),
            posterUrl: movie.poster,
            genres: movie.genres,
          },
          create: {
            tmdbId: movie.id,
            title: movie.title,
            description: movie.description,
            releaseDate: new Date(movie.releaseDate),
            posterUrl: movie.poster,
            genres: movie.genres,
          },
        });

        // add entry to Watchlist table
        const watchlistEntry = await tx.watchlist.create({
          data: {
            userId: req.user!.Id,
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

// delete route to remove a movie from user's watchlist

export default watchlistRouter;
