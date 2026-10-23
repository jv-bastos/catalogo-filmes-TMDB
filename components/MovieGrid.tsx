import type { MovieSummary } from '@/lib/tmdb/types';
import { MovieCard } from './MovieCard';

export function MovieGrid({ movies }: { movies: MovieSummary[] }) {
  return (
    <ul aria-label="Filmes" className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {movies.map((movie) => (
        <li key={movie.id}>
          <MovieCard movie={movie} />
        </li>
      ))}
    </ul>
  );
}
