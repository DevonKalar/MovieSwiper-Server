import type { Movies } from '@prisma/client';

export type Movie = Omit<Movies, 'releaseDate' | 'createdAt' | 'updatedAt'> & {
  releaseDate: string;
};

export interface TMDBMovie {
  id: number;
  title: string;
  genre_ids: number[];
  poster_path: string | null;
  overview: string;
  vote_average: number;
  release_date: string;
}
