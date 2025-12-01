import type { User } from '@prisma/client';

// Omit sensitive fields from Prisma User type
export type SafeUser = Omit<User, 'password'>;

// Auth user data (without password)
export type AuthUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
};

// Response types
export type LoginResponse = {
  message: string;
} & AuthUser;

export type RegisterResponse = {
  message: string;
} & AuthUser;

export type LogoutResponse = {
  message: string;
};

export type CheckAuthResponse = {
  message: string;
} & AuthUser;

// Error responses
export type AuthErrorResponse = {
  message: string;
};
