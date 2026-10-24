import Image from 'next/image';
import Link from 'next/link';
import { posterUrl } from '@/lib/tmdb/images';
import type { MovieSummary } from '@/lib/tmdb/types';

export function MovieCard({ movie }: { movie: MovieSummary }) {
  const poster = posterUrl(movie.posterPath);
  return (
    <Link
      href={`/filme/${movie.id}`}
      className="poster-card group relative block overflow-hidden rounded-lg bg-palco ring-1 ring-white/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgb(255_45_135/0.55)] hover:ring-white/25"
    >
      {poster ? (
        <Image
          src={poster}
          alt={movie.title}
          width={342}
          height={513}
          sizes="(min-width: 1536px) 13vw, (min-width: 1280px) 17vw, (min-width: 1024px) 20vw, (min-width: 640px) 30vw, 48vw"
          className="aspect-[2/3] w-full object-cover"
        />
      ) : (
        <div
          data-testid="poster-placeholder"
          className="flex aspect-[2/3] w-full flex-col justify-between bg-[linear-gradient(160deg,var(--palco-alto),var(--noite))] p-3"
        >
          <span className="text-xs text-suave">Sem pôster</span>
          <span aria-hidden className="title-display mb-12 text-2xl text-texto/90">
            {movie.title}
          </span>
        </div>
      )}
      <div className="poster-meta absolute inset-x-0 bottom-0 bg-gradient-to-t from-noite via-noite/85 to-transparent p-3 pt-12">
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold">{movie.title}</h3>
        {movie.releaseYear && <p className="text-xs text-suave">{movie.releaseYear}</p>}
      </div>
    </Link>
  );
}
