import { Router } from 'express';
import { validateReqQuery } from '../middleware/validate.js';
import {
  movieRecommendationSchema,
  type RecommendationQuery,
} from '@/types/recommendations.js';
import {
  fetchGuestRecommendations,
  fetchUserRecommendations,
} from '@/services/recommendations.js';

/*
 * Recommendations routes for fetching movie recommendations based on user's watchlist.
 */

const recommendationsRouter = Router();

recommendationsRouter.get(
  '/',
  validateReqQuery(movieRecommendationSchema),
  async (req, res) => {
    try {
      const { page } = req.query as RecommendationQuery;
      const pageNumber = parseInt(page, 10);
      const userId = req.user?.id;
      console.log(
        `Received recommendation request for user ${userId ?? 'guest'} on page ${pageNumber}`
      );
      const response = userId
        ? await fetchUserRecommendations(userId, pageNumber)
        : await fetchGuestRecommendations(pageNumber);
      res.json(response);
    } catch (error) {
      console.error('Error fetching recommended movies:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default recommendationsRouter;
