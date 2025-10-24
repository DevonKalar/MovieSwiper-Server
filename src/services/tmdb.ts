import type { Request } from 'express';
import { type movieQuerySchema } from '../routes/tmdb.js';
import * as z from 'zod';

class TMDBService {
  private baseURL: string;
  private token: string;

  constructor() {
    this.baseURL = "https://api.themoviedb.org/3/";
    this.token = process.env.TMDB_BEARER_TOKEN || '';
  }

  async fetchMovieDetails(movieId: number) {
    const url = `${this.baseURL}movie/${movieId}?language=en-US`;
    console.log("Fetching movie details from:", url);
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json;charset=utf-8',
        },
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

  async fetchMoviesByQuery(params: movieQuerySchema) {
    const queryParams: Record<string, string> = {
      include_adult: params.include_adult,
      include_video: params.include_video,
      language: params.language,
      page: params.page,
      sort_by: params.sort_by,
    };

    if (params.with_genres) {
      queryParams.with_genres = params.with_genres;
    }

    const queryString = new URLSearchParams(queryParams).toString();

    const url = `${this.baseURL}discover/movie?${queryString}`;
    console.log("Fetching movies by query from:", url);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Fetched movies:", data.results.length);
      return data;
    } catch (error) {
      console.error("Fetch movies failed:", error);
      return [];
    }
  }

  async fetchGenres() {
    const url = `${this.baseURL}genre/movie/list?language=en-US`;
    console.log("Fetching genres from:", url);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Fetched genres:", data.genres.length);
      return data.genres;
    } catch (error) {
      console.error("Fetch genres failed:", error);
      return [];
    }
  }
}

export const tmdbService = new TMDBService();