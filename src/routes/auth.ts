import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as z from 'zod';
import { validateReqBody } from '../middleware/validate.js';

const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

authRouter.post('/login', validateReqBody(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body;
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
    const token = jwt.sign({ Id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    // set httpOnly cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day - in milliseconds
    });
    res.status(200).json({
      message: 'Login successful',
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      id: user.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

authRouter.post('/logout', async (req: Request, res: Response) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
    res.json({ message: 'Logged out successfully' });
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

authRouter.post('/register', validateReqBody(registerSchema), async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body;
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User with that email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: {
                email,
                firstName,
                lastName,
                password: hashedPassword
            }
        });
        const token = jwt.sign({ Id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
        
        // Set httpOnly cookie (same as login)
        res.cookie('auth_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day - in milliseconds
        });
        
        res.status(201).json({ 
          message: 'Registration successful',
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          id: user.id,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default authRouter;
