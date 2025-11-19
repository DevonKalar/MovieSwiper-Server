import { describe, it, expect } from 'vitest';
import { tmdbService } from '@services/tmdb.js';
import { server } from '@tests/mocks/server.js';
import { http, HttpResponse } from 'msw';

describe('tmdbService', () => {
  describe('fetchMovieDetails', () => {
    it('should fetch movie details for a valid movie ID', async () => {
      // Act
      const result = await tmdbService.fetchMovieDetails(550);
      // Assert
      expect(result).toEqual({
        id: 550,
        title: 'Fight Club',
        overview: 'A ticking-time-bomb insomniac...',
        release_date: '1999-10-15',
      });
    });
  });
});
