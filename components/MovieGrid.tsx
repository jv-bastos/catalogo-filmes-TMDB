import type { MovieSummary } from '@/lib/tmdb/types';
import { MovieCard } from './MovieCard';

// 2/4/5 colunas: todos divisores de 20 (itens por página do TMDB) — sem linha incompleta.
export const MOVIE_GRID_CLASSES = 'grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-5';

export function MovieGrid({ movies }: { movies: MovieSummary[] }) {
  return (
    <ul aria-label="Filmes" className={MOVIE_GRID_CLASSES}>
      {movies.map((movie) => (
        <li key={movie.id}>
          <MovieCard movie={movie} />
        </li>
      ))}
    </ul>
  );
}
