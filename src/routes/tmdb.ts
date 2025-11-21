import { Router } from 'express';
import { tmdbService } from '../services/tmdb.js';
import { validateReqParams, validateReqQuery } from '../middleware/validate.js';
import {
  movieDetailsSchema,
  movieQuerySchema,
  type MovieDetailsParams,
  type MovieQuery,
  type TMDBMovieDetails,
  type TMDBMoviesResponse,
  type TMDBGenresResponse,
  type TMDBErrorResponse,
  type TMDBNotFoundResponse,
} from '../types/tmdb.js';

/*
 * TMDB routes for fetching movie details, movies by query, and genres.
 */

const tmdbRouter = Router();

tmdbRouter.get('/details/:id', validateReqParams(movieDetailsSchema), async (req, res) => {
    if (!req.validatedParams) {
      const errorResponse: TMDBErrorResponse = {
        error: 'Invalid request parameters',
      };
      return res.status(400).json(errorResponse);
    }
    const { id } = req.validatedParams as MovieDetailsParams;
    try {
      const movieId = parseInt(id, 10);
      const movieDetails = await tmdbService.fetchMovieDetails(movieId);
      if (!movieDetails) {
        const notFoundResponse: TMDBNotFoundResponse = {
          error: 'Movie not found',
        };
        return res.status(404).json(notFoundResponse);
      }
      const response: TMDBMovieDetails = movieDetails;
      res.json(response);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      const errorResponse: TMDBErrorResponse = {
        error: 'Internal server error',
      };
      res.status(500).json(errorResponse);
    }
  }
);

tmdbRouter.get('/movies', validateReqQuery(movieQuerySchema), async (req, res) => {
    const query = req.validatedQuery as MovieQuery;
    try {
      const movies = await tmdbService.fetchMoviesByQuery(query);
      const response: TMDBMoviesResponse = movies;
      res.json(response);
    } catch (error) {
      console.error('Error fetching movies:', error);
      const errorResponse: TMDBErrorResponse = {
        error: 'Internal server error',
      };
      res.status(500).json(errorResponse);
    }
  }
);

tmdbRouter.get('/genres', async (req, res) => {
  try {
    const genres = await tmdbService.fetchGenres();
    const response: TMDBGenresResponse = genres;
    res.json(response);
  } catch (error) {
    console.error('Error fetching genres:', error);
    const errorResponse: TMDBErrorResponse = { error: 'Internal server error' };
    res.status(500).json(errorResponse);
  }
});

export default tmdbRouter;
