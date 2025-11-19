import { Router } from 'express';
import {tmdbService} from '../services/tmdb.js';
import * as z from 'zod';
import { validateReqParams } from '../middleware/validate.js';
import { validateReqQuery } from '../middleware/validate.js';
import prisma from '../lib/prisma.js';
import { mapIdsToGenres, mapGenresToIdString } from '../helpers/genreMapping.js';

const recommendationsRouter = Router();

const movieRecommendationSchema = z.object({
  page: z.string().regex(/^\d+$/).default('1'),
});

recommendationsRouter.get('/recommendations', validateReqQuery(movieRecommendationSchema), async (req, res) => {
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

export default recommendationsRouter;