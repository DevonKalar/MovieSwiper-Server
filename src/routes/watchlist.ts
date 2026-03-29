import { Router } from "express";
import type { Request, Response } from "express";
import { validateReqBody, validateReqParams } from "@middleware/validate.js";
import {
  addToWatchlistSchema,
  removeFromWatchlistSchema,
} from "@models/watchlist.js";
import type {
  AddToWatchlistInput,
  RemoveFromWatchlistParams,
} from "@models/watchlist.js";
import type {
  WatchlistResponse,
  BulkAddToWatchlistResponse,
  RemoveFromWatchlistResponse,
  WatchlistErrorResponse,
} from "@/types/watchlist.js";
import {
  getWatchlist,
  addBulkMoviesToWatchlist,
  removeMovieFromWatchlist,
} from "@/services/watchlist.js";

const watchlistRouter = Router();

watchlistRouter.get(
  "/",
  async (
    req: Request,
    res: Response<WatchlistResponse | WatchlistErrorResponse>,
  ) => {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userWatchlist = await getWatchlist(req.user.id);
      res.json({ watchlist: userWatchlist });
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  },
);

watchlistRouter.post(
  "/",
  validateReqBody(addToWatchlistSchema),
  async (
    req: Request,
    res: Response<BulkAddToWatchlistResponse | WatchlistErrorResponse>,
  ) => {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { movies } = req.validatedBody as AddToWatchlistInput;

    try {
      const count = await addBulkMoviesToWatchlist(req.user.id, movies);
      res.status(201).json({
        message: `${count} movies added to watchlist`,
      });
    } catch (error) {
      console.error("Error adding movies to watchlist:", error);
      res.status(500).json({ message: "Failed to add movies to watchlist" });
    }
  },
);

watchlistRouter.delete(
  "/:id",
  validateReqParams(removeFromWatchlistSchema),
  async (
    req: Request,
    res: Response<RemoveFromWatchlistResponse | WatchlistErrorResponse>,
  ) => {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.validatedParams as RemoveFromWatchlistParams;

    try {
      await removeMovieFromWatchlist(req.user.id, parseInt(id));
      res.status(204).send({ message: "Movie removed from watchlist" });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Watchlist item not found"
      ) {
        return res.status(404).json({ message: "Watchlist item not found" });
      }
      console.error("Error removing movie from watchlist:", error);
      res
        .status(500)
        .json({ message: "Failed to remove movie from watchlist" });
    }
  },
);

export default watchlistRouter;
