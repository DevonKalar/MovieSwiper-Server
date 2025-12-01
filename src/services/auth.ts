import prisma from '@/lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Response } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
  path: '/',
  maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
} as const;

export interface UserPayload {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export function signToken(userId: number): string {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn: '1d',
  });
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie('auth_token', token, COOKIE_OPTIONS);
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<UserPayload | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

export async function createUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<UserPayload> {
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      password: hashedPassword,
    },
  });

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

export async function findUserById(
  userId: number
): Promise<UserPayload | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

export async function userExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { email } });
  return !!user;
}
