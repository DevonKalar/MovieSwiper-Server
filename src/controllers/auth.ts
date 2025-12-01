import type { Request, Response } from 'express';
import type { LoginInput, RegisterInput } from '@/models/auth.js';
import type {
  LoginResponse,
  RegisterResponse,
  LogoutResponse,
  CheckAuthResponse,
  AuthErrorResponse,
} from '@/types/auth.js';
import {
  authenticateUser,
  createUser,
  findUserById,
  userExists,
  signToken,
  setAuthCookie,
  clearAuthCookie,
} from '@/services/auth.js';

export async function login(
  req: Request,
  res: Response<LoginResponse | AuthErrorResponse>
) {
  const { email, password } = req.validatedBody as LoginInput;
  try {
    const user = await authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user.id);
    setAuthCookie(res, token);

    return res.status(200).json({
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
}

export async function logout(
  req: Request,
  res: Response<LogoutResponse | AuthErrorResponse>
) {
  try {
    clearAuthCookie(res);
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function register(
  req: Request,
  res: Response<RegisterResponse | AuthErrorResponse>
) {
  const { email, password, firstName, lastName } =
    req.validatedBody as RegisterInput;
  try {
    if (await userExists(email)) {
      return res
        .status(409)
        .json({ message: 'User with that email already exists' });
    }

    const user = await createUser(email, password, firstName, lastName);
    const token = signToken(user.id);
    setAuthCookie(res, token);

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
}

export async function checkAuth(
  req: Request,
  res: Response<CheckAuthResponse | AuthErrorResponse>
) {
  try {
    const user = await findUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'User is authenticated',
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      id: user.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
