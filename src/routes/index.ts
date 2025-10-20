import { Router } from 'express';
import authRouter from './auth.js';

const appRouter = Router();

// Add routes here
appRouter.use('/auth', authRouter);

export default appRouter;
