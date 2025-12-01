import type { Request, Response } from 'express';
import type { RecommendationQuery } from '@/models/recommendations.js';
import type {
  RecommendationsResponse,
  RecommendationsErrorResponse,
} from '@/types/recommendations.js';
import {
  fetchUserRecommendations,
  fetchGuestRecommendations,
} from '@/services/recommendations.js';

export async function getRecommendations(
  req: Request,
  res: Response<RecommendationsResponse | RecommendationsErrorResponse>
) {
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
