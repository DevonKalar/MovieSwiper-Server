// src/server.ts
import dotenv from "dotenv";

// src/config/env.ts
var config = {
  port: process.env.PORT || 3e3,
  apiKeys: {
    openai: process.env.OPENAI_API_KEY || "",
    tmdb: process.env.TMDB_API_KEY || ""
  },
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim()) : ["http://localhost:5173"]
};

// src/app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit2 from "express-rate-limit";

// src/routes/index.ts
import { Router as Router6 } from "express";

// src/routes/auth.ts
import { Router } from "express";

// src/middleware/validate.ts
import * as z from "zod";
var validateReqBody = (schema) => {
  return async (req, res, next) => {
    try {
      req.validatedBody = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request body", errors: error.issues });
      }
      next(error);
    }
  };
};
var validateReqQuery = (schema) => {
  return async (req, res, next) => {
    try {
      req.validatedQuery = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request query", errors: error.issues });
      }
      next(error);
    }
  };
};
var validateReqParams = (schema) => {
  return async (req, res, next) => {
    try {
      req.validatedParams = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request params", errors: error.issues });
      }
      next(error);
    }
  };
};

// src/models/auth.ts
import * as z2 from "zod";
var loginSchema = z2.object({
  email: z2.string().email(),
  password: z2.string().min(6)
});
var registerSchema = z2.object({
  email: z2.string().email(),
  password: z2.string().min(6),
  firstName: z2.string().min(1),
  lastName: z2.string().min(1)
});

// src/middleware/auth.ts
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

// src/middleware/errorHandler.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var UnauthorizedError = class extends HttpError {
  constructor(message = "Unauthorized") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
};
var NotFoundError = class extends HttpError {
  constructor(message = "Not found") {
    super(404, message);
    this.name = "NotFoundError";
  }
};
var ConflictError = class extends HttpError {
  constructor(message = "Conflict") {
    super(409, message);
    this.name = "ConflictError";
  }
};
var errorHandler = (err, req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  console.error("Unhandled error:", err instanceof Error ? err.stack : err);
  return res.status(500).json({ message: "Internal server error" });
};

// src/middleware/auth.ts
var authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 10,
  message: "Too many login attempts, please try again later."
});
var requireUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.auth_token;
  if (!token) {
    return next(new UnauthorizedError("No token"));
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    );
    req.user = decoded;
    next();
  } catch {
    next(new UnauthorizedError("Invalid token"));
  }
};
var optionalUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.auth_token;
  if (!token) {
    return next();
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    );
    req.user = decoded;
    next();
  } catch (err) {
    console.error("OptionalUser - Token invalid", err);
    next();
  }
};

// src/lib/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg";

// src/generated/prisma/client.ts
import "process";
import * as path from "path";
import { fileURLToPath } from "url";
import "@prisma/client/runtime/client";

// src/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config2 = {
  "previewFeatures": [],
  "clientVersion": "7.6.0",
  "engineVersion": "75cbdc1eb7150937890ad5465d861175c6624711",
  "activeProvider": "postgresql",
  "inlineSchema": 'generator client {\n  provider     = "prisma-client"\n  output       = "../src/generated/prisma"\n  moduleFormat = "esm"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel User {\n  id             Int         @id @default(autoincrement())\n  email          String      @unique\n  firstName      String\n  lastName       String\n  password       String\n  createdAt      DateTime    @default(now())\n  updatedAt      DateTime    @updatedAt\n  watchlistItems Watchlist[]\n}\n\nmodel Movies {\n  id            Int         @id // TMDB movie ID\n  title         String\n  description   String\n  releaseDate   DateTime\n  posterUrl     String?\n  genres        String[]\n  ratings       Float\n  createdAt     DateTime    @default(now())\n  updatedAt     DateTime    @updatedAt\n  watchlistedBy Watchlist[]\n}\n\nmodel Watchlist {\n  id        Int      @id @default(autoincrement())\n  userId    Int\n  movieId   Int\n  createdAt DateTime @default(now())\n\n  // Relations\n  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n  movie Movies @relation(fields: [movieId], references: [id], onDelete: Cascade)\n\n  @@unique([userId, movieId])\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config2.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"Int"},{"name":"email","kind":"scalar","type":"String"},{"name":"firstName","kind":"scalar","type":"String"},{"name":"lastName","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"watchlistItems","kind":"object","type":"Watchlist","relationName":"UserToWatchlist"}],"dbName":null},"Movies":{"fields":[{"name":"id","kind":"scalar","type":"Int"},{"name":"title","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"releaseDate","kind":"scalar","type":"DateTime"},{"name":"posterUrl","kind":"scalar","type":"String"},{"name":"genres","kind":"scalar","type":"String"},{"name":"ratings","kind":"scalar","type":"Float"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"watchlistedBy","kind":"object","type":"Watchlist","relationName":"MoviesToWatchlist"}],"dbName":null},"Watchlist":{"fields":[{"name":"id","kind":"scalar","type":"Int"},{"name":"userId","kind":"scalar","type":"Int"},{"name":"movieId","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"UserToWatchlist"},{"name":"movie","kind":"object","type":"Movies","relationName":"MoviesToWatchlist"}],"dbName":null}},"enums":{},"types":{}}');
config2.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","watchlistedBy","_count","movie","watchlistItems","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_avg","_sum","_min","_max","User.groupBy","User.aggregate","Movies.findUnique","Movies.findUniqueOrThrow","Movies.findFirst","Movies.findFirstOrThrow","Movies.findMany","Movies.createOne","Movies.createMany","Movies.createManyAndReturn","Movies.updateOne","Movies.updateMany","Movies.updateManyAndReturn","Movies.upsertOne","Movies.deleteOne","Movies.deleteMany","Movies.groupBy","Movies.aggregate","Watchlist.findUnique","Watchlist.findUniqueOrThrow","Watchlist.findFirst","Watchlist.findFirstOrThrow","Watchlist.findMany","Watchlist.createOne","Watchlist.createMany","Watchlist.createManyAndReturn","Watchlist.updateOne","Watchlist.updateMany","Watchlist.updateManyAndReturn","Watchlist.upsertOne","Watchlist.deleteOne","Watchlist.deleteMany","Watchlist.groupBy","Watchlist.aggregate","AND","OR","NOT","id","userId","movieId","createdAt","equals","in","notIn","lt","lte","gt","gte","not","title","description","releaseDate","posterUrl","genres","ratings","updatedAt","has","hasEvery","hasSome","contains","startsWith","endsWith","every","some","none","email","firstName","lastName","password","userId_movieId","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide","push"]'),
  graph: "sgEhMAsHAABpACBAAABrADBBAAALABBCAABrADBDAgAAAAFGQABmACFVQABmACFfAQAAAAFgAQBlACFhAQBlACFiAQBlACEBAAAAAQAgCQMAAG4AIAYAAG8AIEAAAG0AMEEAAAMAEEIAAG0AMEMCAGQAIUQCAGQAIUUCAGQAIUZAAGYAIQIDAAClAQAgBgAApgEAIAoDAABuACAGAABvACBAAABtADBBAAADABBCAABtADBDAgAAAAFEAgBkACFFAgBkACFGQABmACFjAABsACADAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAEAAAADACABAAAAAwAgAQAAAAEAIAsHAABpACBAAABrADBBAAALABBCAABrADBDAgBkACFGQABmACFVQABmACFfAQBlACFgAQBlACFhAQBlACFiAQBlACEBBwAAlAEAIAMAAAALACABAAAMADACAAABACADAAAACwAgAQAADAAwAgAAAQAgAwAAAAsAIAEAAAwAMAIAAAEAIAgHAACkAQAgQwIAAAABRkAAAAABVUAAAAABXwEAAAABYAEAAAABYQEAAAABYgEAAAABAQ0AABAAIAdDAgAAAAFGQAAAAAFVQAAAAAFfAQAAAAFgAQAAAAFhAQAAAAFiAQAAAAEBDQAAEgAwAQ0AABIAMAgHAACaAQAgQwIAdgAhRkAAdQAhVUAAdQAhXwEAgQEAIWABAIEBACFhAQCBAQAhYgEAgQEAIQIAAAABACANAAAVACAHQwIAdgAhRkAAdQAhVUAAdQAhXwEAgQEAIWABAIEBACFhAQCBAQAhYgEAgQEAIQIAAAALACANAAAXACACAAAACwAgDQAAFwAgAwAAAAEAIBQAABAAIBUAABUAIAEAAAABACABAAAACwAgBQUAAJUBACAaAACWAQAgGwAAmQEAIBwAAJgBACAdAACXAQAgCkAAAGoAMEEAAB4AEEIAAGoAMEMCAFEAIUZAAFIAIVVAAFIAIV8BAFkAIWABAFkAIWEBAFkAIWIBAFkAIQMAAAALACABAAAdADAZAAAeACADAAAACwAgAQAADAAwAgAAAQAgDQQAAGkAIEAAAGMAMEEAACQAEEIAAGMAMEMCAAAAAUZAAGYAIU8BAGUAIVABAGUAIVFAAGYAIVIBAGcAIVMAAFsAIFQIAGgAIVVAAGYAIQEAAAAhACABAAAAIQAgDQQAAGkAIEAAAGMAMEEAACQAEEIAAGMAMEMCAGQAIUZAAGYAIU8BAGUAIVABAGUAIVFAAGYAIVIBAGcAIVMAAFsAIFQIAGgAIVVAAGYAIQIEAACUAQAgUgAAewAgAwAAACQAIAEAACUAMAIAACEAIAMAAAAkACABAAAlADACAAAhACADAAAAJAAgAQAAJQAwAgAAIQAgCgQAAJMBACBDAgAAAAFGQAAAAAFPAQAAAAFQAQAAAAFRQAAAAAFSAQAAAAFTAACSAQAgVAgAAAABVUAAAAABAQ0AACkAIAlDAgAAAAFGQAAAAAFPAQAAAAFQAQAAAAFRQAAAAAFSAQAAAAFTAACSAQAgVAgAAAABVUAAAAABAQ0AACsAMAENAAArADAKBAAAhQEAIEMCAHYAIUZAAHUAIU8BAIEBACFQAQCBAQAhUUAAdQAhUgEAggEAIVMAAIMBACBUCACEAQAhVUAAdQAhAgAAACEAIA0AAC4AIAlDAgB2ACFGQAB1ACFPAQCBAQAhUAEAgQEAIVFAAHUAIVIBAIIBACFTAACDAQAgVAgAhAEAIVVAAHUAIQIAAAAkACANAAAwACACAAAAJAAgDQAAMAAgAwAAACEAIBQAACkAIBUAAC4AIAEAAAAhACABAAAAJAAgBgUAAHwAIBoAAH0AIBsAAIABACAcAAB_ACAdAAB-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"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config2.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config2);
}

// src/generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var globalForPrisma = globalThis;
var adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] });
var prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
var prisma_default = prisma;

// src/services/auth.ts
import bcrypt from "bcrypt";
import jwt2 from "jsonwebtoken";
var isProduction = process.env.NODE_ENV === "production";
var COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 24 * 60 * 60 * 1e3
  // 1 day in milliseconds
};
function signToken(userId) {
  return jwt2.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d"
  });
}
function setAuthCookie(res, token) {
  res.cookie("auth_token", token, COOKIE_OPTIONS);
}
function clearAuthCookie(res) {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/"
  });
}
async function authenticateUser(email, password) {
  const user = await prisma_default.user.findUnique({ where: { email } });
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
    lastName: user.lastName
  };
}
async function createUser(email, password, firstName, lastName) {
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma_default.user.create({
    data: {
      email,
      firstName,
      lastName,
      password: hashedPassword
    }
  });
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName
  };
}
async function findUserById(userId) {
  const user = await prisma_default.user.findUnique({
    where: { id: userId }
  });
  if (!user) {
    return null;
  }
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName
  };
}
async function userExists(email) {
  const user = await prisma_default.user.findUnique({ where: { email } });
  return !!user;
}

// src/routes/auth.ts
var authRouter = Router();
authRouter.post(
  "/login",
  validateReqBody(loginSchema),
  async (req, res) => {
    const { email, password } = req.validatedBody;
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
      id: user.id
    });
  }
);
authRouter.post(
  "/logout",
  async (req, res) => {
    clearAuthCookie(res);
    return res.json({ message: "Logged out successfully" });
  }
);
authRouter.post(
  "/register",
  validateReqBody(registerSchema),
  async (req, res) => {
    const { email, password, firstName, lastName } = req.validatedBody;
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
      id: user.id
    });
  }
);
authRouter.get(
  "/check",
  requireUser,
  async (req, res) => {
    const user = await findUserById(req.user.id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return res.status(200).json({
      message: "User is authenticated",
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      id: user.id
    });
  }
);
var auth_default = authRouter;

// src/routes/openai.ts
import { Router as Router2 } from "express";

// src/models/openai.ts
import * as z3 from "zod";
var responseSchema = z3.object({
  input: z3.string().min(2).max(1e3),
  instructions: z3.string().min(2).max(1e3).optional(),
  previous_response_id: z3.string().optional()
});
var retrieveSchema = z3.object({
  id: z3.string().min(1)
});

// src/lib/openaiAxios.ts
import axios from "axios";
var openaiAxios = axios.create({
  baseURL: "https://api.openai.com/v1/",
  headers: {
    Authorization: `Bearer ${config.apiKeys.openai}`,
    "Content-Type": "application/json"
  }
});

// src/clients/openai.ts
async function createResponse(input, instructions, previous_response_id) {
  const { data } = await openaiAxios.post("responses", {
    model: "gpt-4o",
    input,
    ...instructions && { instructions },
    ...previous_response_id && { previous_response_id }
  });
  return data;
}
async function retrieveResponse(responseId) {
  const { data } = await openaiAxios.get(`responses/${responseId}`);
  return data;
}

// src/routes/openai.ts
var openaiRouter = Router2();
openaiRouter.post(
  "/response",
  validateReqBody(responseSchema),
  async (req, res) => {
    const { input, instructions, previous_response_id } = req.validatedBody;
    const response = await createResponse(input, instructions, previous_response_id);
    res.json(response);
  }
);
openaiRouter.get(
  "/response/:id",
  validateReqParams(retrieveSchema),
  async (req, res) => {
    const { id } = req.validatedParams;
    const response = await retrieveResponse(id);
    res.json(response);
  }
);
var openai_default = openaiRouter;

// src/routes/tmdb.ts
import { Router as Router3 } from "express";

// src/models/tmdb.ts
import * as z4 from "zod";
var movieDetailsSchema = z4.object({
  id: z4.string().min(1)
});
var movieQuerySchema = z4.object({
  include_adult: z4.enum(["true", "false"]).default("false"),
  include_video: z4.enum(["true", "false"]).default("false"),
  language: z4.string().default("en-US"),
  page: z4.string().regex(/^\d+$/).default("1"),
  sort_by: z4.string().default("popularity.desc"),
  with_genres: z4.string().optional()
});

// src/lib/tmdbAxios.ts
import axios2 from "axios";
var tmdbAxios = axios2.create({
  baseURL: "https://api.themoviedb.org/3/",
  headers: {
    Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN ?? ""}`,
    Accept: "application/json"
  }
});

// src/clients/tmdb.ts
async function fetchMovieDetails(movieId) {
  try {
    const { data } = await tmdbAxios.get(`movie/${movieId}`, {
      params: { language: "en-US" }
    });
    return data;
  } catch (error) {
    console.error("Fetch movie details failed:", error);
    return null;
  }
}
async function fetchMoviesByQuery(params) {
  try {
    const { data } = await tmdbAxios.get("discover/movie", { params });
    return data;
  } catch (error) {
    console.error("Fetch movies failed:", error);
    return [];
  }
}
async function fetchPopularMovies(page = 1) {
  try {
    const { data } = await tmdbAxios.get("movie/popular", {
      params: { language: "en-US", page }
    });
    return data;
  } catch (error) {
    console.error("Fetch popular movies failed:", error);
    return [];
  }
}
async function fetchGenres() {
  try {
    const { data } = await tmdbAxios.get("genre/movie/list", {
      params: { language: "en-US" }
    });
    return data.genres;
  } catch (error) {
    console.error("Fetch genres failed:", error);
    return [];
  }
}

// src/routes/tmdb.ts
var tmdbRouter = Router3();
tmdbRouter.get(
  "/details/:id",
  validateReqParams(movieDetailsSchema),
  async (req, res) => {
    const { id } = req.validatedParams;
    const movieDetails = await fetchMovieDetails(parseInt(id, 10));
    if (!movieDetails) {
      throw new NotFoundError("Movie not found");
    }
    res.json(movieDetails);
  }
);
tmdbRouter.get(
  "/movies",
  validateReqQuery(movieQuerySchema),
  async (req, res) => {
    const query = req.validatedQuery;
    const movies = await fetchMoviesByQuery(query);
    res.json(movies);
  }
);
tmdbRouter.get(
  "/genres",
  async (req, res) => {
    const genres = await fetchGenres();
    res.json(genres);
  }
);
var tmdb_default = tmdbRouter;

// src/routes/watchlist.ts
import { Router as Router4 } from "express";

// src/models/watchlist.ts
import * as z5 from "zod";
var movieSchema = z5.object({
  id: z5.number(),
  title: z5.string(),
  description: z5.string(),
  releaseDate: z5.string(),
  posterUrl: z5.string(),
  genres: z5.array(z5.string()),
  ratings: z5.number()
});
var addToWatchlistSchema = z5.object({
  movies: z5.array(movieSchema)
});
var removeFromWatchlistSchema = z5.object({
  id: z5.string().min(1)
});

// src/services/watchlist.ts
async function getWatchlist(userId) {
  return await prisma_default.watchlist.findMany({
    where: { userId },
    include: { movie: true },
    orderBy: { createdAt: "desc" }
  });
}
async function addBulkMoviesToWatchlist(userId, movies) {
  const result = await prisma_default.$transaction(async (tx) => {
    const movieEntries = await Promise.all(
      movies.map(
        (movie) => tx.movies.upsert({
          where: { id: movie.id },
          update: {
            title: movie.title,
            description: movie.description,
            releaseDate: new Date(movie.releaseDate),
            posterUrl: movie.posterUrl,
            genres: movie.genres,
            ratings: movie.ratings
          },
          create: {
            id: movie.id,
            title: movie.title,
            description: movie.description,
            releaseDate: new Date(movie.releaseDate),
            posterUrl: movie.posterUrl,
            genres: movie.genres,
            ratings: movie.ratings
          }
        })
      )
    );
    const watchlistEntries = await tx.watchlist.createMany({
      data: movieEntries.map((movieEntry) => ({
        userId,
        movieId: movieEntry.id
      })),
      skipDuplicates: true
    });
    return watchlistEntries.count;
  });
  return result;
}
async function removeMovieFromWatchlist(userId, movieId) {
  const watchlistEntry = await prisma_default.watchlist.findFirst({
    where: {
      userId,
      movieId
    }
  });
  if (!watchlistEntry) {
    throw new NotFoundError("Watchlist item not found");
  }
  await prisma_default.watchlist.delete({
    where: { id: watchlistEntry.id }
  });
}

// src/routes/watchlist.ts
var watchlistRouter = Router4();
watchlistRouter.get(
  "/",
  async (req, res) => {
    const userWatchlist = await getWatchlist(req.user.id);
    res.json({ watchlist: userWatchlist });
  }
);
watchlistRouter.post(
  "/",
  validateReqBody(addToWatchlistSchema),
  async (req, res) => {
    const { movies } = req.validatedBody;
    const count = await addBulkMoviesToWatchlist(req.user.id, movies);
    res.status(201).json({ message: `${count} movies added to watchlist` });
  }
);
watchlistRouter.delete(
  "/:id",
  validateReqParams(removeFromWatchlistSchema),
  async (req, res) => {
    const { id } = req.validatedParams;
    await removeMovieFromWatchlist(req.user.id, parseInt(id));
    res.status(204).send({ message: "Movie removed from watchlist" });
  }
);
var watchlist_default = watchlistRouter;

// src/routes/recommendations.ts
import { Router as Router5 } from "express";

// src/models/recommendations.ts
import * as z6 from "zod";
var movieRecommendationSchema = z6.object({
  page: z6.string().regex(/^\d+$/).default("1")
});

// src/utils/genreMapping.ts
var GENRE_MAP = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western"
};
function mapIdsToGenres(genreIds) {
  return genreIds.map((id) => GENRE_MAP[id]).filter((name) => name !== void 0);
}

// src/utils/mapTMDBtoMovie.ts
function apiMovieToMovie(movie) {
  return {
    id: movie.id,
    title: movie.title,
    posterUrl: movie.poster_path ? "https://image.tmdb.org/t/p/w500" + movie.poster_path : null,
    genres: mapIdsToGenres(movie.genre_ids || []),
    description: movie.overview || "",
    ratings: movie.vote_average || 0,
    releaseDate: movie.release_date || ""
  };
}
function apiMoviesToMovies(movies) {
  if (!movies || !Array.isArray(movies)) {
    return [];
  }
  return movies.map(apiMovieToMovie);
}

// src/services/recommendations.ts
async function fetchGuestRecommendations(page) {
  const tmdbFetch = await fetchPopularMovies(page);
  const movieResults = apiMoviesToMovies(tmdbFetch.results);
  return {
    results: movieResults,
    nextPage: tmdbFetch.page < tmdbFetch.total_pages ? tmdbFetch.page + 1 : null
  };
}
async function fetchUserRecommendations(userId, startPage) {
  const limit = 20;
  const watchlistIds = await prisma_default.watchlist.findMany({
    where: { userId },
    select: { movieId: true }
  }).then((entries) => entries.map((entry) => entry.movieId));
  const watchlistIdSet = new Set(watchlistIds);
  let tmdbResults = [];
  let currentPage = startPage;
  const maxPages = startPage + 10;
  while (tmdbResults.length < limit && currentPage < maxPages) {
    const movies = await fetchPopularMovies(currentPage);
    if (!movies?.results) break;
    console.log(
      `Fetched page ${currentPage} with ${movies.results.length} movies`
    );
    const filtered = movies.results.filter(
      (movie) => !watchlistIdSet.has(movie.id)
    );
    tmdbResults.push(...filtered);
    currentPage += 1;
  }
  const movieResults = apiMoviesToMovies(tmdbResults.slice(0, limit));
  console.log(`Returning ${movieResults.length} recommended movies`);
  return {
    results: movieResults,
    nextPage: movieResults.length >= limit ? currentPage : null
  };
}

// src/routes/recommendations.ts
var recommendationsRouter = Router5();
recommendationsRouter.get(
  "/",
  optionalUser,
  validateReqQuery(movieRecommendationSchema),
  async (req, res) => {
    const { page } = req.validatedQuery;
    const pageNumber = parseInt(page, 10);
    const userId = req.user?.id;
    console.log(
      `Received recommendation request for user ${userId ?? "guest"} on page ${pageNumber}`
    );
    const response = userId ? await fetchUserRecommendations(userId, pageNumber) : await fetchGuestRecommendations(pageNumber);
    res.json(response);
  }
);
var recommendations_default = recommendationsRouter;

// src/routes/index.ts
var appRouter = Router6();
appRouter.use("/auth", authRateLimiter, auth_default);
appRouter.use("/openai", openai_default);
appRouter.use("/tmdb", tmdb_default);
appRouter.use("/watchlist", requireUser, watchlist_default);
appRouter.use("/recommendations", recommendations_default);
var routes_default = appRouter;

// src/app.ts
var app = express();
app.set("trust proxy", 1);
app.use(cookieParser());
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(
  rateLimit2({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: 100,
    // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.use("/api", routes_default);
app.use(errorHandler);
var app_default = app;

// src/server.ts
dotenv.config();
var JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("Error: JWT_SECRET is not defined in environment variables.");
  process.exit(1);
}
var PORT = config.port;
var server = app_default.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("CORS Origins:", config.corsOrigins);
});
var gracefulShutdown = (signal) => {
  console.log(`
${signal} received. Starting graceful shutdown...`);
  server.close(() => {
    console.log("HTTP server closed.");
    console.log("Graceful shutdown completed.");
    process.exit(0);
  });
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 1e4);
};
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});
//# sourceMappingURL=server.js.map