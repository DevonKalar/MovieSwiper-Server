import { Router } from 'express';
import { validateReqBody, validateReqParams } from '@middleware/validate.js';
import {
  addToWatchlistSchema,
  addBulkToWatchlistSchema,
  removeFromWatchlistSchema,
} from '@models/watchlist.js';
import * as watchlistController from '@controllers/watchlist.js';

/*
 * Watchlist routes for managing user's movie watchlist.
 */

const watchlistRouter = Router();

watchlistRouter.get('/', watchlistController.getUserWatchlist);
watchlistRouter.post( '/', validateReqBody(addToWatchlistSchema), watchlistController.addToWatchlist);
watchlistRouter.post( '/bulk', validateReqBody(addBulkToWatchlistSchema), watchlistController.addBulkToWatchlist);
watchlistRouter.delete( '/:id', validateReqParams(removeFromWatchlistSchema), watchlistController.removeFromWatchlist);

export default watchlistRouter;
