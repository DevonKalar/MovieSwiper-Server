import * as z from 'zod';
import type { User } from '@prisma/client';

// Schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

// Input types - inferred from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// Response types
export type AuthSuccessData = {
  message: string;
  firstName: string;
  lastName: string;
  email: string;
  id: number;
};

export type LoginResponse = {
  message: string;
} & AuthSuccessData;

export type RegisterResponse = {
  message: string;
} & AuthSuccessData;

export type LogoutResponse = {
  message: string;
};

// Omit sensitive fields from Prisma User type
export type SafeUser = Omit<User, 'password'>;