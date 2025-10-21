import type { Request } from 'express';

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

  async fetchMoviesByQuery(req: Request) {
    const queryString = req.url?.split('?')[1] || '';
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
      console.log("Fetched movies:", data.results);
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
      console.log("Fetched genres:", data.genres);
      return data.genres;
    } catch (error) {
      console.error("Fetch genres failed:", error);
      return [];
    }
  }
}

export const tmdbService = new TMDBService();