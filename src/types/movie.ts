export interface TMDBMovie {
  id: number;
  title: string;
  genre_ids: number[];
  poster_path: string | null;
  overview: string;
  vote_average: number;
  release_date: string;
}

export interface TMDBMovieWithGenres extends TMDBMovie {
  genre_names: string[];
}