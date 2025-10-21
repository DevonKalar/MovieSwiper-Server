import { Router } from 'express';
import authRouter from './auth.js';
import openaiRouter from './openai.js';
import { authRateLimiter } from '../middleware/auth.js';
import { requestRateLimiter } from '../middleware/rateLimit.js';

const serverRouter = Router();

// Add routes here
serverRouter.use('/auth', authRateLimiter, authRouter);
serverRouter.use('/openai', requestRateLimiter, openaiRouter);

export default serverRouter;
