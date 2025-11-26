import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validateReqBody } from '@middleware/validate.js';
import {
  type LoginInput,
  loginSchema,
  type RegisterInput,
  registerSchema,
  type LoginResponse,
  type RegisterResponse,
  type LogoutResponse,
} from '@/types/auth.js';
import { requireAuth } from '@middleware/auth.js';

/**
 * Authentication routes for user login, registration, and logout.
 */

const authRouter = Router();

// true if in production environment
const isProduction = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction, 
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
  path: '/', 
  maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
} as const;

authRouter.post(
  '/login',
  validateReqBody(loginSchema),
  async (req: Request, res: Response) => {
    const { email, password } = req.validatedBody as LoginInput;
    try {
      // Find user by email
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      // Compare password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      // Generate JWT token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
        expiresIn: '1d',
      });
      // set httpOnly cookie
      res.cookie('auth_token', token, COOKIE_OPTIONS);

      const response: LoginResponse = {
        message: 'Login successful',
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        id: user.id,
      };
      return res.status(200).json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

authRouter.post('/logout', async (req: Request, res: Response) => {
  try {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    });
    const response: LogoutResponse = { message: 'Logged out successfully' };
    return res.json(response);
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

authRouter.post(
  '/register',
  validateReqBody(registerSchema),
  async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } =
      req.validatedBody as RegisterInput;
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res
          .status(409)
          .json({ message: 'User with that email already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          password: hashedPassword,
        },
      });
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
        expiresIn: '1d',
      });
      // Set httpOnly cookie (same as login)
      res.cookie('auth_token', token, COOKIE_OPTIONS);

      const response: RegisterResponse = {
        message: 'Registration successful',
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        id: user.id,
      };
      res.status(201).json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

authRouter.get('/check', requireAuth, async (req: Request, res: Response) => {
  try {
    // Find user by id from req.user set in requireAuth middleware
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id}
    })
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const response: LoginResponse = {
      message: 'User is authenticated',
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      id: user.id,
    };
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default authRouter;
