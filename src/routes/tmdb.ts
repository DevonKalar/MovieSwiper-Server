import { Router } from "express";
import type { Request, Response } from "express";
import { validateReqParams, validateReqQuery } from "../middleware/validate.js";
import { movieDetailsSchema, movieQuerySchema } from "../models/tmdb.js";
import type { MovieDetailsParams, MovieQuery } from "../models/tmdb.js";
import type {
  TMDBMovieDetails,
  TMDBMoviesResponse,
  TMDBGenresResponse,
} from "@/types/tmdb.js";
import { fetchMovieDetails, fetchMoviesByQuery, fetchGenres } from "@/clients/tmdb.js";
import { NotFoundError } from "@middleware/errorHandler.js";

const tmdbRouter = Router();

tmdbRouter.get(
  "/details/:id",
  validateReqParams(movieDetailsSchema),
  async (req: Request, res: Response<TMDBMovieDetails>) => {
    const { id } = req.validatedParams as MovieDetailsParams;
    const movieDetails = await fetchMovieDetails(parseInt(id, 10));
    if (!movieDetails) {
      throw new NotFoundError("Movie not found");
    }
    res.json(movieDetails);
  },
);

tmdbRouter.get(
  "/movies",
  validateReqQuery(movieQuerySchema),
  async (req: Request, res: Response<TMDBMoviesResponse>) => {
    const query = req.validatedQuery as MovieQuery;
    const movies = await fetchMoviesByQuery(query);
    res.json(movies);
  },
);

tmdbRouter.get(
  "/genres",
  async (req: Request, res: Response<TMDBGenresResponse>) => {
    const genres = await fetchGenres();
    res.json(genres);
  },
);

export default tmdbRouter;
