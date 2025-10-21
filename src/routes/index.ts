import { Router } from 'express';
import authRouter from './auth.js';
import { authRateLimiter } from '../middleware/auth.js';

const serverRouter = Router();

// Add routes here
serverRouter.use('/auth', authRateLimiter, authRouter);

export default serverRouter;
