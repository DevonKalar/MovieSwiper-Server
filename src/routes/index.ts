import { Router } from 'express';
// Routes
import authRouter from './auth.js';
import openaiRouter from './openai.js';
import tmdbRouter from './tmdb.js';
// Middleware
import { authRateLimiter } from '../middleware/auth.js';
import { requestRateLimiter } from '../middleware/rateLimit.js';

const serverRouter = Router();

// Add routes here
serverRouter.use('/auth', authRateLimiter, authRouter);
serverRouter.use('/openai', requestRateLimiter, openaiRouter);
serverRouter.use('/tmdb', requestRateLimiter, tmdbRouter);

export default serverRouter;
