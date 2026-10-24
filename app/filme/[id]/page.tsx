import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CastList } from '@/components/CastList';
import { WatchProviders } from '@/components/WatchProviders';
import { parseMovieId } from '@/lib/params';
import { backdropUrl, posterUrl } from '@/lib/tmdb/images';
import { getMovieDetails } from '@/lib/tmdb/movies';

const DEFAULT_TITLE = 'Sessão';

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
  return { title: movie ? `${movie.title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE };
}

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const movieId = parseMovieId((await params).id);
  if (movieId === null) notFound();

  const movie = await getMovieDetails(movieId);
  if (!movie) notFound();

  const poster = posterUrl(movie.posterPath, 'w500');
  const backdrop = backdropUrl(movie.backdropPath);
  const meta = [movie.releaseYear, movie.runtime != null ? formatRuntime(movie.runtime) : null].filter(Boolean);

  return (
    <div className="flex flex-col gap-12">
      <section className="relative -mx-4 -mt-6 sm:-mx-6 lg:-mx-10 lg:-mt-8">
        {backdrop && (
          <div aria-hidden className="absolute inset-x-0 top-0 h-[22rem] overflow-hidden lg:h-[30rem]">
            <Image
              src={backdrop}
              alt=""
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1024px) calc(100vw - 16rem), 100vw"
              className="object-cover object-[center_25%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-noite via-noite/60 to-noite/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-noite/80 to-transparent" />
          </div>
        )}
        <div
          className={`relative flex flex-col gap-8 px-4 sm:flex-row sm:items-start sm:px-6 lg:px-10 ${
            backdrop ? 'pt-40 lg:pt-56' : 'pt-8'
          }`}
        >
          {poster ? (
            <Image
              src={poster}
              alt={movie.title}
              width={500}
              height={750}
              preload
              className="aspect-[2/3] w-44 shrink-0 rounded-xl object-cover shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)] ring-1 ring-white/10 sm:w-56 lg:w-64"
            />
          ) : (
            <div
              data-testid="poster-placeholder"
              className="flex aspect-[2/3] w-44 shrink-0 items-center justify-center rounded-xl bg-palco p-2 text-center text-sm text-suave ring-1 ring-linha sm:w-56 lg:w-64"
            >
              Sem pôster
            </div>
          )}
          <div className="flex max-w-3xl flex-col gap-5 sm:pt-10 lg:pt-16">
            <h1 className="title-display text-5xl sm:text-6xl lg:text-7xl">{movie.title}</h1>
            {(meta.length > 0 || movie.genres.length > 0) && (
              <ul aria-label="Informações" className="flex flex-wrap items-center gap-2 text-sm">
                {meta.map((m) => (
                  <li key={m} className="font-semibold text-texto">
                    {m}
                  </li>
                ))}
                {movie.genres.map((g) => (
                  <li key={g} className="rounded-full border border-linha bg-palco/70 px-3 py-1 text-suave">
                    {g}
                  </li>
                ))}
              </ul>
            )}
            <p className="max-w-[65ch] leading-relaxed text-texto/85">{movie.overview ?? 'Sinopse não disponível'}</p>
            <WatchProviders watch={movie.watch} />
          </div>
        </div>
      </section>
      <CastList cast={movie.cast} />
    </div>
  );
}
