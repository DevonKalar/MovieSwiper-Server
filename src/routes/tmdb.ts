import { Router } from 'express';
import { validateReqParams, validateReqQuery } from '../middleware/validate.js';
import { movieDetailsSchema, movieQuerySchema } from '../models/tmdb.js';
import * as tmdbController from '@/controllers/tmdb.js';

/*
 * TMDB routes for fetching movie details, movies by query, and genres.
 */

const tmdbRouter = Router();

tmdbRouter.get( '/details/:id', validateReqParams(movieDetailsSchema), tmdbController.getMovieDetails);
tmdbRouter.get( '/movies', validateReqQuery(movieQuerySchema), tmdbController.getMoviesByQuery);
tmdbRouter.get('/genres', tmdbController.getGenres);

export default tmdbRouter;
