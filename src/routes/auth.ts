import { Router } from "express";
import type { Request, Response } from "express";
import { validateReqBody } from "@middleware/validate.js";
import { loginSchema, registerSchema } from "@/models/auth.js";
import type { LoginInput, RegisterInput } from "@/models/auth.js";
import { requireUser } from "@middleware/auth.js";
import type {
  LoginResponse,
  RegisterResponse,
  LogoutResponse,
  CheckAuthResponse,
} from "@/types/auth.js";
import {
  authenticateUser,
  createUser,
  findUserById,
  userExists,
  signToken,
  setAuthCookie,
  clearAuthCookie,
} from "@/services/auth.js";
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from "@middleware/errorHandler.js";

const authRouter = Router();

authRouter.post(
  "/login",
  validateReqBody(loginSchema),
  async (req: Request, res: Response<LoginResponse>) => {
    const { email, password } = req.validatedBody as LoginInput;
    const user = await authenticateUser(email, password);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = signToken(user.id);
    setAuthCookie(res, token);

    return res.status(200).json({
      message: "Login successful",
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      id: user.id,
    });
  },
);

authRouter.post(
  "/logout",
  async (req: Request, res: Response<LogoutResponse>) => {
    clearAuthCookie(res);
    return res.json({ message: "Logged out successfully" });
  },
);

authRouter.post(
  "/register",
  validateReqBody(registerSchema),
  async (req: Request, res: Response<RegisterResponse>) => {
    const { email, password, firstName, lastName } =
      req.validatedBody as RegisterInput;

    if (await userExists(email)) {
      throw new ConflictError("User with that email already exists");
    }

    const user = await createUser(email, password, firstName, lastName);
    const token = signToken(user.id);
    setAuthCookie(res, token);

    return res.status(201).json({
      message: "Registration successful",
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      id: user.id,
    });
  },
);

authRouter.get(
  "/check",
  requireUser,
  async (req: Request, res: Response<CheckAuthResponse>) => {
    const user = await findUserById(req.user!.id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return res.status(200).json({
      message: "User is authenticated",
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      id: user.id,
    });
  },
);

export default authRouter;
