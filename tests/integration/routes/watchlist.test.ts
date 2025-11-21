import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import prisma from '@/lib/prisma.js';
import watchlistRouter from '@routes/watchlist.js';
import { requireAuth } from '@middleware/auth.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/watchlist', requireAuth, watchlistRouter);

describe('Watchlist Integration Tests', () => {
  let authToken: string;
  let userId: number;
  let movieId: number;

  beforeAll(async () => {
    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        email: 'watchlist-test@example.com',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
      },
    });
    userId = testUser.id;

    // Generate auth token
    authToken = jwt.sign({ Id: userId }, process.env.JWT_SECRET!);

    // Create a test movie
    const testMovie = await prisma.movies.create({
      data: {
        tmdbId: 999999,
        title: 'Test Movie',
        description: 'A test movie',
        releaseDate: new Date('2024-01-01'),
        posterUrl: 'https://example.com/poster.jpg',
        genres: ['Action', 'Drama'],
      },
    });
    movieId = testMovie.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.watchlist.deleteMany({ where: { userId } });
    await prisma.movies.deleteMany({ where: { tmdbId: 999999 } });
    await prisma.user.deleteMany({
      where: { email: 'watchlist-test@example.com' },
    });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clear watchlist entries before each test
    await prisma.watchlist.deleteMany({ where: { userId } });
  });

  describe('GET /watchlist', () => {
    it('should return empty watchlist for authenticated user', async () => {
      const response = await request(app)
        .get('/api/watchlist')
        .set('Cookie', [`auth_token=${authToken}`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('watchlist');
      expect(response.body.watchlist).toEqual([]);
    });

    it('should return watchlist with movies for authenticated user', async () => {
      // Add movie to watchlist
      await prisma.watchlist.create({
        data: { userId, movieId },
      });

      const response = await request(app)
        .get('/api/watchlist')
        .set('Cookie', [`auth_token=${authToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.watchlist).toHaveLength(1);
      expect(response.body.watchlist[0]).toHaveProperty('movie');
      expect(response.body.watchlist[0].movie.title).toBe('Test Movie');
    });

    it('should return 401 for unauthenticated user', async () => {
      const response = await request(app).get('/api/watchlist');

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        message: expect.stringContaining('Unauthorized'),
      });
    });
  });

  describe('POST /watchlist', () => {
    it('should add a new movie to watchlist', async () => {
      const movieData = {
        movie: {
          id: 888888,
          title: 'New Movie',
          description: 'A brand new movie',
          releaseDate: '2024-06-01',
          poster: 'https://example.com/new-poster.jpg',
          genres: ['Comedy'],
        },
      };

      const response = await request(app)
        .post('/api/watchlist')
        .set('Cookie', [`auth_token=${authToken}`])
        .send(movieData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        'message',
        'Movie added to watchlist'
      );
      expect(response.body).toHaveProperty('watchlistItem');
      expect(response.body.watchlistItem.userId).toBe(userId);
    });

    it('should return 409 when adding duplicate movie', async () => {
      const movieData = {
        movie: {
          id: 999999,
          title: 'Test Movie',
          description: 'A test movie',
          releaseDate: '2024-01-01',
          poster: 'https://example.com/poster.jpg',
          genres: ['Action', 'Drama'],
        },
      };

      // Add movie first time
      await request(app)
        .post('/api/watchlist')
        .set('Cookie', [`auth_token=${authToken}`])
        .send(movieData);

      // Try to add same movie again
      const response = await request(app)
        .post('/api/watchlist')
        .set('Cookie', [`auth_token=${authToken}`])
        .send(movieData);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty(
        'message',
        'Movie already in watchlist'
      );
    });

    it('should return 400 for invalid movie data', async () => {
      const invalidData = {
        movie: {
          id: 'invalid', // Should be number
          title: '',
        },
      };

      const response = await request(app)
        .post('/api/watchlist')
        .set('Cookie', [`auth_token=${authToken}`])
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid request body');
    });

    it('should return 401 for unauthenticated user', async () => {
      const movieData = {
        movie: {
          id: 888888,
          title: 'New Movie',
          description: 'A brand new movie',
          releaseDate: '2024-06-01',
          poster: 'https://example.com/new-poster.jpg',
          genres: ['Comedy'],
        },
      };

      const response = await request(app)
        .post('/api/watchlist')
        .send(movieData);

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        message: expect.stringContaining('Unauthorized'),
      });
    });
  });

  describe('DELETE /watchlist/:id', () => {
    it('should remove a movie from watchlist', async () => {
      // Add movie to watchlist first
      await prisma.watchlist.create({
        data: { userId, movieId },
      });

      const response = await request(app)
        .delete(`/api/watchlist/${movieId}`)
        .set('Cookie', [`auth_token=${authToken}`]);

      expect(response.status).toBe(204);

      // Verify movie was removed
      const watchlist = await prisma.watchlist.findFirst({
        where: { userId, movieId },
      });
      expect(watchlist).toBeNull();
    });

    it('should return 404 when removing non-existent movie', async () => {
      const response = await request(app)
        .delete('/api/watchlist/99999')
        .set('Cookie', [`auth_token=${authToken}`]);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty(
        'message',
        'Watchlist item not found'
      );
    });

    it('should return 401 for unauthenticated user', async () => {
      const response = await request(app).delete(`/api/watchlist/${movieId}`);

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        message: expect.stringContaining('Unauthorized'),
      });
    });
  });
});
