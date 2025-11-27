export interface TMDBMovie {
  id: number;
  title: string;
  genre_ids: number[];
  poster_path: string | null;
  overview: string;
  vote_average: number;
  release_date: string;
}

export interface Movie {
  id?: number;
  tmdbId: number;
  title: string;
  genres: string[];
  posterUrl: string | null;
  description: string;
  ratings: number;
  releaseDate: string;
}