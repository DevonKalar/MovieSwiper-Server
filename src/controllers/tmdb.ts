import type { Request, Response } from 'express';
import { tmdbClient } from '@/clients/tmdb.js';
import type { MovieDetailsParams, MovieQuery } from '@/models/tmdb.js';
import type {
  TMDBMovieDetails,
  TMDBMoviesResponse,
  TMDBGenresResponse,
  TMDBErrorResponse,
} from '@/types/tmdb.js';

export async function getMovieDetails(
  req: Request,
  res: Response<TMDBMovieDetails | TMDBErrorResponse>
) {
  if (!req.validatedParams) {
    return res.status(400).json({ error: 'Invalid request parameters' });
  }
  const { id } = req.validatedParams as MovieDetailsParams;
  try {
    const movieId = parseInt(id, 10);
    const movieDetails = await tmdbClient.fetchMovieDetails(movieId);
    if (!movieDetails) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json(movieDetails);
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getMoviesByQuery(
  req: Request,
  res: Response<TMDBMoviesResponse | TMDBErrorResponse>
) {
  const query = req.validatedQuery as MovieQuery;
  try {
    const movies = await tmdbClient.fetchMoviesByQuery(query);
    res.json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getGenres(
  req: Request,
  res: Response<TMDBGenresResponse | TMDBErrorResponse>
) {
  try {
    const genres = await tmdbClient.fetchGenres();
    res.json(genres);
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
