import { Router } from 'express';
import prisma from '../lib/prisma.js';
import {Prisma} from '@prisma/client';
import * as z from 'zod';
import { validateReqParams } from '../middleware/validate.js';

const watchlistRouter = Router();

// routes

// get route to fetch user's watchlist
watchlistRouter.get('/', async (req, res) => {
  if (!req.user?.Id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  // Implementation to fetch user's watchlist from the database
  const userWatchlist =  await prisma.watchlist.findMany({
    where: { userId: req.user.Id },
    include: { movie: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ watchlist: userWatchlist });
});

const movieParamSchema = z.object({
  id: z.string().min(1),

});

// post route to add a movie to user's watchlist
watchlistRouter.post('/', async (req, res) => {
  console.log('Request body:', req.body);
  console.log('Authenticated user:', req.user);
  if (!req.user?.Id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const movie = req.body.movie;

  if (!movie || !movie.id) {
    return res.status(400).json({ message: 'Invalid movie data' });
  }

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
      }
    })

    // add entry to Watchlist table
    const watchlistEntry = await tx.watchlist.create({
      data: {
        userId: req.user!.Id,
        movieId: movieEntry.id,
      }
    })

    return watchlistEntry;

  });

  res.status(201).json({ message: 'Movie added to watchlist', watchlistItem: result });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') { // Prisma unique constraint violation
      return res.status(409).json({ message: 'Movie already in watchlist' });
    }
    console.error('Error adding movie to watchlist:', error);
    res.status(500).json({ message: 'Failed to add movie to watchlist' });
  }

});

// delete route to remove a movie from user's watchlist

export default watchlistRouter;