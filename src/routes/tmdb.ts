import { Router } from 'express';
import {tmdbService} from '../services/tmdb.js';
import * as z from 'zod';
import { validateReqParams } from '../middleware/validate.js';
import { validateReqQuery } from '../middleware/validate.js';

const tmdbRouter = Router();

// used to map TMDB genre IDs to names
const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
};

const movieRecommendationSchema = z.object({
  genres: z.string().optional(),
  page: z.string().regex(/^\d+$/).default('1'),
});

tmdbRouter.get('/recommendations', validateReqQuery(movieRecommendationSchema), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const genresParam = req.query.genres as string | undefined;
    const genres = genresParam?.split(',');

    // if no genres provided, get popular movies
    if (!genres || genres.length === 0) {
      const movies = await tmdbService.fetchPopularMovies(page);
      const moviesWithGenreNames = movies.results.map((movie: any) => {
        const movieGenres = movie.genre_ids.map((gid: number) => GENRE_MAP[gid]);
        return { ...movie, genre_names: movieGenres };
      });
      return res.json(moviesWithGenreNames);
    }

    // Map genre names in query to IDs before fetching by genre
    const genreIds = genres?.map((genre: string) => {
      for (const [id, name] of Object.entries(GENRE_MAP)) {
        if (name.toLowerCase() === genre.toLowerCase()) {
          return id;
        }
      }
      return null;
    }).filter((id: string | null) => id !== null).join(',');

    // Fetch movies by genre
    const movies = await tmdbService.fetchMoviesByGenre(genreIds as string, page);
    const moviesWithGenreNames = movies.results.map((movie: any) => {
      const movieGenres = movie.genre_ids.map((gid: number) => GENRE_MAP[gid]);
      return { ...movie, genre_names: movieGenres };
    });
    res.json(moviesWithGenreNames);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
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