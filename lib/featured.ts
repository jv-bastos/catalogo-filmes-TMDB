import type { MovieSummary } from '@/lib/tmdb/types';

export const FEATURED_COUNT = 5;

/** Os primeiros `count` filmes (na ordem recebida) que têm backdrop. */
export function pickFeatured(movies: MovieSummary[], count = FEATURED_COUNT): MovieSummary[] {
  return movies.filter((m) => m.backdropPath).slice(0, count);
}
