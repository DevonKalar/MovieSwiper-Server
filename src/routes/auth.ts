import { Router } from 'express';
import { validateReqBody } from '@middleware/validate.js';
import { loginSchema, registerSchema } from '@/models/auth.js';
import { requireUser } from '@middleware/auth.js';
import * as authController from '@/controllers/auth.js';

/**
 * Authentication routes for user login, registration, and logout.
 */

const authRouter = Router();

authRouter.post('/login', validateReqBody(loginSchema), authController.login);
authRouter.post('/logout', authController.logout);
authRouter.post('/register', validateReqBody(registerSchema), authController.register);
authRouter.get('/check', requireUser, authController.checkAuth);

export default authRouter;
