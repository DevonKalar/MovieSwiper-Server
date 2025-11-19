import { Router } from 'express';
import {tmdbService} from '../services/tmdb.js';
import * as z from 'zod';
import { validateReqParams } from '../middleware/validate.js';
import { validateReqQuery } from '../middleware/validate.js';
import prisma from '../lib/prisma.js';
import { mapIdsToGenres, mapGenresToIdString } from '../helpers/genreMapping.js';

const tmdbRouter = Router();

const movieRecommendationSchema = z.object({
  page: z.string().regex(/^\d+$/).default('1'),
});

tmdbRouter.get('/recommendations', validateReqQuery(movieRecommendationSchema), async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const startPage = parseInt(req.query.page as string) || 1;
  const limit = 20; // TMDB default page size

  // 1. get user's watchlist IDs
  const watchlistIds = await prisma.watchlist.findMany({
    where: { userId },
    select: { movieId: true }
  }).then(entries => entries.map(entry => entry.movieId));

  // 2. create a set from watchlist IDs for quick lookup
  const watchlistIdSet = new Set<number>(watchlistIds);

  // 3. Fetch recommendations and filter out watchlist movies
  let results: any[] = [];
  let currentPage = startPage;
  const maxPages = startPage + 10; // Limit to checking 10 pages ahead to find enough movies
  
  while (results.length < limit && currentPage < maxPages) {
    // Call TMDB to get popular movies for current page
    const movies = await tmdbService.fetchPopularMovies(currentPage);

    if (!movies || !movies.results) {
      break;
    }

    // filter out movies in user's watchlist
    const filtered = movies.results.filter((movie: any) => !watchlistIdSet.has(movie.id));
    results = results.concat(filtered);
    currentPage += 1;
  }
  
  // 4. Add genre names to results and return
  const resultsWithGenres = results.slice(0, limit).map((movie: any) => ({
    ...movie,
    genre_names: mapIdsToGenres(movie.genre_ids || [])
  }));

  res.json({
    results: resultsWithGenres,
    nextPage: results.length >= limit ? currentPage : null
  });
});

const movieDetailsSchema = z.object({
    id: z.string().min(1),
});

tmdbRouter.get('/details/:id', validateReqParams(movieDetailsSchema), async (req, res) => {
    try {
        const movieId = parseInt(req.params.id as string, 10);
        const movieDetails = await tmdbService.fetchMovieDetails(movieId);
        if (!movieDetails) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.json(movieDetails);
    } catch (error) {
        console.error("Error fetching movie details:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const movieQuerySchema = z.object({
  include_adult: z.enum(['true', 'false']).default('false'),
  include_video: z.enum(['true', 'false']).default('false'),
  language: z.string().default('en-US'),
  page: z.string().regex(/^\d+$/).default('1'),
  sort_by: z.string().default('popularity.desc'),
  with_genres: z.string().optional()
});

tmdbRouter.get('/movies', validateReqQuery(movieQuerySchema), async (req, res) => {
    try {
        const movies = await tmdbService.fetchMoviesByQuery(req.query as any);
        res.json(movies);
    } catch (error) {
        console.error("Error fetching movies:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

tmdbRouter.get('/genres', async (req, res) => {
    try {
        const genres = await tmdbService.fetchGenres();
        res.json(genres);
    } catch (error) {
        console.error("Error fetching genres:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export type movieQuerySchema = z.infer<typeof movieQuerySchema>;
export default tmdbRouter;