import { Router } from 'express';
import {tmdbService} from '../services/tmdb.js';
import * as z from 'zod';
import { validateReqParams } from '../middleware/validate.js';
import { validateReqQuery } from '../middleware/validate.js';

const tmdbRouter = Router();

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