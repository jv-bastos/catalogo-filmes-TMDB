import Image from 'next/image';
import Link from 'next/link';
import { posterUrl } from '@/lib/tmdb/images';
import type { MovieSummary } from '@/lib/tmdb/types';

export function MovieCard({ movie }: { movie: MovieSummary }) {
  const poster = posterUrl(movie.posterPath);
  return (
    <Link href={`/filme/${movie.id}`} className="group block">
      {poster ? (
        <Image
          src={poster}
          alt={movie.title}
          width={342}
          height={513}
          className="aspect-[2/3] w-full rounded-lg object-cover transition group-hover:opacity-90"
        />
      ) : (
        <div
          data-testid="poster-placeholder"
          className="flex aspect-[2/3] w-full items-center justify-center rounded-lg bg-neutral-200 p-2 text-center text-sm text-neutral-600"
        >
          Sem pôster
        </div>
      )}
      <h3 className="mt-2 text-sm font-medium group-hover:underline">{movie.title}</h3>
      {movie.releaseYear && <p className="text-xs text-neutral-500">{movie.releaseYear}</p>}
    </Link>
  );
}
