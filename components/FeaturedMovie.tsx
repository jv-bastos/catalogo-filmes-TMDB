import Image from 'next/image';
import Link from 'next/link';
import { backdropUrl } from '@/lib/tmdb/images';
import type { MovieSummary } from '@/lib/tmdb/types';
import { PlayIcon } from './icons';

export function FeaturedMovie({ movie }: { movie: MovieSummary }) {
  const backdrop = backdropUrl(movie.backdropPath);
  if (!backdrop) return null;
  return (
    <section aria-label="Destaque" className="relative -mx-4 -mt-6 overflow-hidden sm:-mx-6 lg:-mx-10 lg:-mt-8">
      <Image
        src={backdrop}
        alt=""
        fill
        loading="eager"
        fetchPriority="high"
        sizes="(min-width: 1024px) calc(100vw - 16rem), 100vw"
        className="object-cover object-[center_20%]"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-noite via-noite/70 to-transparent" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-noite via-transparent to-noite/30" />
      <div className="relative flex min-h-[26rem] max-w-3xl flex-col justify-end gap-4 px-4 pt-24 pb-10 sm:px-6 lg:min-h-[32rem] lg:px-10 lg:pb-14">
        <p className="flex items-center gap-2 text-sm font-semibold text-texto/90">
          <span aria-hidden className="bg-sessao size-2 rounded-full" />
          Em alta agora
        </p>
        <h2 className="title-display text-5xl sm:text-6xl lg:text-7xl">{movie.title}</h2>
        {movie.overview && (
          <p className="line-clamp-3 max-w-xl text-base leading-relaxed text-texto/85">{movie.overview}</p>
        )}
        <div className="mt-2">
          <Link href={`/filme/${movie.id}`} className="btn-primary">
            <PlayIcon className="size-4" />
            Ver onde assistir
          </Link>
        </div>
      </div>
    </section>
  );
}
