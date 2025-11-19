import { Router } from 'express';
import { tmdbService } from '../services/tmdb.js';
import { validateReqQuery } from '../middleware/validate.js';
import prisma from '../lib/prisma.js';
import { mapIdsToGenres } from '../utils/genreMapping.js';
import { type TMDBMovie, type TMDBMovieWithGenres } from '../types/movie.js';
import {
  movieRecommendationSchema,
  type RecommendationQuery,
  type RecommendationResponse,
  type RecommendationErrorResponse,
} from '../types/recommendations.js';

/*
 * Recommendations routes for fetching movie recommendations based on user's watchlist.
 */

const recommendationsRouter = Router();

recommendationsRouter.get('/', validateReqQuery(movieRecommendationSchema), async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      // if user not logged in fetch popular movies without filtering
      try {
        const { page } = req.validatedQuery as RecommendationQuery;
        const pageNum = parseInt(page) || 1;
        const popularMovies = await tmdbService.fetchPopularMovies(pageNum);
        const resultsWithGenres = popularMovies.results.map(
          (movie: TMDBMovie) => ({
            ...movie,
            genre_names: mapIdsToGenres(movie.genre_ids || []),
          })
        );

        const response: RecommendationResponse = {
          results: resultsWithGenres as TMDBMovieWithGenres[],
          nextPage:
            popularMovies.page < popularMovies.total_pages
              ? popularMovies.page + 1
              : null,
        };
        return res.json(response);
      } catch (error) {
        console.error(
          'Error fetching popular movies for unauthenticated user:',
          error
        );
        const errorResponse: RecommendationErrorResponse = {
          error: 'Internal server error',
        };
        return res.status(500).json(errorResponse);
      }
    }

    try {
      const { page } = req.validatedQuery as RecommendationQuery;
      const startPage = parseInt(page) || 1;
      const limit = 20; // TMDB default page size

      // 1. get user's watchlist IDs
      const watchlistIds = await prisma.watchlist
        .findMany({
          where: { userId },
          select: { movieId: true },
        })
        .then((entries) => entries.map((entry) => entry.movieId));

      // 2. create a set from watchlist IDs for quick lookup
      const watchlistIdSet = new Set<number>(watchlistIds);

      // 3. Fetch recommendations and filter out watchlist movies
      let results: TMDBMovie[] = [];
      let currentPage = startPage;
      const maxPages = startPage + 10; // Limit to checking 10 pages ahead to find enough movies

      while (results.length < limit && currentPage < maxPages) {
        // Call TMDB to get popular movies for current page
        const movies = await tmdbService.fetchPopularMovies(currentPage);

        if (!movies || !movies.results) {
          break;
        }

        // filter out movies in user's watchlist
        const filtered = movies.results.filter(
          (movie: TMDBMovie) => !watchlistIdSet.has(movie.id)
        );
        results.push(...filtered);
        currentPage += 1;
      }

      // 4. Add genre names to results and return TODO: Look into moving mapping logic to service layer
      const resultsWithGenres: TMDBMovieWithGenres[] = results
        .slice(0, limit)
        .map((movie: TMDBMovie) => ({
          ...movie,
          genre_names: mapIdsToGenres(movie.genre_ids || []),
        }));

      const response: RecommendationResponse = {
        results: resultsWithGenres,
        nextPage: results.length >= limit ? currentPage : null,
      };
      res.json(response);
    } catch (error) {
      console.error('Error fetching recommended movies:', error);
      const errorResponse: RecommendationErrorResponse = {
        error: 'Internal server error',
      };
      res.status(500).json(errorResponse);
    }
  }
);

export default recommendationsRouter;
