import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CastList } from '@/components/CastList';
import { WatchProviders } from '@/components/WatchProviders';
import { parseMovieId } from '@/lib/params';
import { posterUrl } from '@/lib/tmdb/images';
import { getMovieDetails } from '@/lib/tmdb/movies';

const DEFAULT_TITLE = 'Catálogo de Filmes';

function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const movieId = parseMovieId((await params).id);
  if (movieId === null) return { title: DEFAULT_TITLE };
  const movie = await getMovieDetails(movieId);
  return { title: movie ? `${movie.title} — ${DEFAULT_TITLE}` : DEFAULT_TITLE };
}

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const movieId = parseMovieId((await params).id);
  if (movieId === null) notFound();

  const movie = await getMovieDetails(movieId);
  if (!movie) notFound();

  const poster = posterUrl(movie.posterPath, 'w500');
  const meta = [movie.releaseYear, movie.runtime != null ? formatRuntime(movie.runtime) : null].filter(Boolean);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 sm:flex-row">
        {poster ? (
          <Image
            src={poster}
            alt={movie.title}
            width={500}
            height={750}
            preload
            className="aspect-[2/3] w-full max-w-xs rounded-lg object-cover sm:w-64"
          />
        ) : (
          <div
            data-testid="poster-placeholder"
            className="flex aspect-[2/3] w-full max-w-xs items-center justify-center rounded-lg bg-neutral-200 p-2 text-center text-sm text-neutral-600 sm:w-64"
          >
            Sem pôster
          </div>
        )}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold">{movie.title}</h1>
          {meta.length > 0 && <p className="text-neutral-500">{meta.join(' · ')}</p>}
          {movie.genres.length > 0 && <p className="text-sm text-neutral-600">{movie.genres.join(', ')}</p>}
          <p>{movie.overview ?? 'Sinopse não disponível'}</p>
        </div>
      </div>
      <WatchProviders watch={movie.watch} />
      <CastList cast={movie.cast} />
    </div>
  );
}
