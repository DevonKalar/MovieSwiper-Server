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
var authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 10,
  message: "Too many login attempts, please try again later."
});
var requireUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.auth_token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token" });
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    );
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
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
    console.error("OptionalUser - Token invalid");
    next();
  }
};

// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
var prisma = new PrismaClient();
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
    try {
      const user = await authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
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
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
authRouter.post(
  "/logout",
  async (req, res) => {
    try {
      clearAuthCookie(res);
      return res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
authRouter.post(
  "/register",
  validateReqBody(registerSchema),
  async (req, res) => {
    const { email, password, firstName, lastName } = req.validatedBody;
    try {
      if (await userExists(email)) {
        return res.status(409).json({ message: "User with that email already exists" });
      }
      const user = await createUser(email, password, firstName, lastName);
      const token = signToken(user.id);
      setAuthCookie(res, token);
      res.status(201).json({
        message: "Registration successful",
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        id: user.id
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
authRouter.get(
  "/check",
  requireUser,
  async (req, res) => {
    try {
      const user = await findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({
        message: "User is authenticated",
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        id: user.id
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
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

// src/clients/openai.ts
import OpenAI from "openai";
var OpenAIClient = class {
  client;
  constructor() {
    this.client = new OpenAI({
      apiKey: config.apiKeys.openai
    });
  }
  async createResponse(input, instructions, previous_response_id) {
    const response = await this.client.responses.create({
      model: "gpt-4o",
      input,
      ...instructions && { instructions },
      ...previous_response_id && { previous_response_id }
    });
    return response;
  }
  async retrieveResponse(responseId) {
    const response = await this.client.responses.retrieve(responseId);
    return response;
  }
};
var openaiClient = new OpenAIClient();

// src/routes/openai.ts
var openaiRouter = Router2();
openaiRouter.post(
  "/response",
  validateReqBody(responseSchema),
  async (req, res) => {
    const { input, instructions, previous_response_id } = req.validatedBody;
    try {
      const response = await openaiClient.createResponse(
        input,
        instructions,
        previous_response_id
      );
      res.json(response);
    } catch (error) {
      console.error("Error creating OpenAI response:", error);
      res.status(500).json({ error: "Failed to create response" });
    }
  }
);
openaiRouter.get(
  "/response/:id",
  validateReqParams(retrieveSchema),
  async (req, res) => {
    const { id } = req.validatedParams;
    try {
      const response = await openaiClient.retrieveResponse(id);
      res.json(response);
    } catch (error) {
      console.error("Error retrieving OpenAI response:", error);
      res.status(500).json({ error: "Failed to retrieve response" });
    }
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

// src/clients/tmdb.ts
var TMDBClient = class {
  baseURL;
  token;
  constructor() {
    this.baseURL = "https://api.themoviedb.org/3/";
    this.token = process.env.TMDB_BEARER_TOKEN || "";
  }
  async fetchMovieDetails(movieId) {
    const url = `${this.baseURL}movie/${movieId}?language=en-US`;
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json;charset=utf-8"
        }
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch movie details failed:", error);
      return null;
    }
  }
  async fetchMoviesByQuery(params) {
    const queryParams = {
      include_adult: params.include_adult,
      include_video: params.include_video,
      language: params.language,
      page: params.page,
      sort_by: params.sort_by
    };
    if (params.with_genres) {
      queryParams.with_genres = params.with_genres;
    }
    const queryString = new URLSearchParams(queryParams).toString();
    const url = `${this.baseURL}discover/movie?${queryString}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${this.token}`
        }
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch movies failed:", error);
      return [];
    }
  }
  async fetchPopularMovies(page = 1) {
    const url = `${this.baseURL}movie/popular?language=en-US&page=${page}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${this.token}`
        }
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch popular movies failed:", error);
      return [];
    }
  }
  async fetchMoviesByGenre(genreId, page = 1) {
    const url = `${this.baseURL}discover/movie?with_genres=${genreId}&language=en-US&page=${page}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${this.token}`
        }
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch movies by genre failed:", error);
      return [];
    }
  }
  async fetchGenres() {
    const url = `${this.baseURL}genre/movie/list?language=en-US`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${this.token}`
        }
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.genres;
    } catch (error) {
      console.error("Fetch genres failed:", error);
      return [];
    }
  }
};
var tmdbClient = new TMDBClient();

// src/routes/tmdb.ts
var tmdbRouter = Router3();
tmdbRouter.get(
  "/details/:id",
  validateReqParams(movieDetailsSchema),
  async (req, res) => {
    if (!req.validatedParams) {
      return res.status(400).json({ error: "Invalid request parameters" });
    }
    const { id } = req.validatedParams;
    try {
      const movieId = parseInt(id, 10);
      const movieDetails = await tmdbClient.fetchMovieDetails(movieId);
      if (!movieDetails) {
        return res.status(404).json({ error: "Movie not found" });
      }
      res.json(movieDetails);
    } catch (error) {
      console.error("Error fetching movie details:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
tmdbRouter.get(
  "/movies",
  validateReqQuery(movieQuerySchema),
  async (req, res) => {
    const query = req.validatedQuery;
    try {
      const movies = await tmdbClient.fetchMoviesByQuery(query);
      res.json(movies);
    } catch (error) {
      console.error("Error fetching movies:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
tmdbRouter.get(
  "/genres",
  async (req, res) => {
    try {
      const genres = await tmdbClient.fetchGenres();
      res.json(genres);
    } catch (error) {
      console.error("Error fetching genres:", error);
      res.status(500).json({ error: "Internal server error" });
    }
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
    throw new Error("Watchlist item not found");
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
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const userWatchlist = await getWatchlist(req.user.id);
      res.json({ watchlist: userWatchlist });
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  }
);
watchlistRouter.post(
  "/",
  validateReqBody(addToWatchlistSchema),
  async (req, res) => {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { movies } = req.validatedBody;
    try {
      const count = await addBulkMoviesToWatchlist(req.user.id, movies);
      res.status(201).json({
        message: `${count} movies added to watchlist`
      });
    } catch (error) {
      console.error("Error adding movies to watchlist:", error);
      res.status(500).json({ message: "Failed to add movies to watchlist" });
    }
  }
);
watchlistRouter.delete(
  "/:id",
  validateReqParams(removeFromWatchlistSchema),
  async (req, res) => {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.validatedParams;
    try {
      await removeMovieFromWatchlist(req.user.id, parseInt(id));
      res.status(204).send({ message: "Movie removed from watchlist" });
    } catch (error) {
      if (error instanceof Error && error.message === "Watchlist item not found") {
        return res.status(404).json({ message: "Watchlist item not found" });
      }
      console.error("Error removing movie from watchlist:", error);
      res.status(500).json({ message: "Failed to remove movie from watchlist" });
    }
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
  const tmdbFetch = await tmdbClient.fetchPopularMovies(page);
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
    const movies = await tmdbClient.fetchPopularMovies(currentPage);
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
    try {
      const { page } = req.validatedQuery;
      const pageNumber = parseInt(page, 10);
      const userId = req.user?.id;
      console.log(
        `Received recommendation request for user ${userId ?? "guest"} on page ${pageNumber}`
      );
      const response = userId ? await fetchUserRecommendations(userId, pageNumber) : await fetchGuestRecommendations(pageNumber);
      res.json(response);
    } catch (error) {
      console.error("Error fetching recommended movies:", error);
      res.status(500).json({ error: "Internal server error" });
    }
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