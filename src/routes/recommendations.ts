import { Router } from 'express';
import { validateReqQuery } from '../middleware/validate.js';
import { movieRecommendationSchema } from '@/models/recommendations.js';
import * as recommendationsController from '@/controllers/recommendations.js';
import { optionalUser } from '@middleware/auth.js';

/*
 * Recommendations routes for fetching movie recommendations based on user's watchlist.
 */

const recommendationsRouter = Router();

recommendationsRouter.get( 
  '/',
  optionalUser, 
  validateReqQuery(movieRecommendationSchema), 
  recommendationsController.getRecommendations);

export default recommendationsRouter;
