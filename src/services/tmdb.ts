import { type MovieQuery } from '../types/tmdb.js';

class TMDBService {
  private baseURL: string;
  private token: string;

  constructor() {
    this.baseURL = "https://api.themoviedb.org/3/";
    this.token = process.env.TMDB_BEARER_TOKEN || '';
  }

  async fetchMovieDetails(movieId: number) {
    const url = `${this.baseURL}movie/${movieId}?language=en-US`;
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

  async fetchMoviesByQuery(params: MovieQuery) {
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
      return data;
    } catch (error) {
      console.error("Fetch movies failed:", error);
      return [];
    }
  }

  async fetchPopularMovies(page: number = 1) {
    const url = `${this.baseURL}movie/popular?language=en-US&page=${page}`;
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
      return data;
    } catch (error) {
      console.error("Fetch popular movies failed:", error);
      return [];
    }
  }

  async fetchMoviesByGenre(genreId: string, page: number = 1) {
    console.log("Fetching movies for genre ID:", genreId, "page:", page);
    const url = `${this.baseURL}discover/movie?with_genres=${genreId}&language=en-US&page=${page}`;
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