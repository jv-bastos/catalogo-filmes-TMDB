import 'server-only';
import { MAX_PAGES } from '../params';
import { TmdbError, tmdbFetch } from './client';
import { pickTrailer } from './trailer';
import type {
  MovieDetails,
  MoviePage,
  MovieSummary,
  Provider,
  RawMovie,
  RawMovieDetails,
  RawPage,
  RawProvider,
  WatchOptions,
} from './types';

const REGION = 'BR';
const PROVIDER_LIMIT = 12;
const CAST_LIMIT = 10;

function mapProvider(p: RawProvider): Provider {
  return { id: p.provider_id, name: p.provider_name, logoPath: p.logo_path };
}

function mapMovie(m: RawMovie): MovieSummary {
  return {
    id: m.id,
    title: m.title,
    posterPath: m.poster_path,
    backdropPath: m.backdrop_path ?? null,
    releaseYear: m.release_date ? m.release_date.slice(0, 4) : null,
    overview: m.overview || null,
  };
}

function mapPage(raw: RawPage): MoviePage {
  return {
    movies: raw.results.map(mapMovie),
    page: raw.page,
    totalPages: Math.min(raw.total_pages, MAX_PAGES),
  };
}

export async function getProviders(): Promise<Provider[]> {
  const raw = await tmdbFetch<{ results: RawProvider[] }>(
    '/watch/providers/movie',
    { watch_region: REGION },
    86400,
  );
  return raw.results
    .map((p) => ({ p, priority: p.display_priorities?.[REGION] ?? Infinity }))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, PROVIDER_LIMIT)
    .map(({ p }) => mapProvider(p));
}

export async function discoverMovies(opts: {
  providers: number[];
  page: number;
}): Promise<MoviePage> {
  const raw = await tmdbFetch<RawPage>(
    '/discover/movie',
    {
      watch_region: REGION,
      with_watch_monetization_types: 'flatrate',
      sort_by: 'popularity.desc',
      with_watch_providers: opts.providers.length ? opts.providers.join('|') : undefined,
      page: opts.page,
    },
    3600,
  );
  return mapPage(raw);
}

export async function searchMovies(opts: { query: string; page: number }): Promise<MoviePage> {
  const raw = await tmdbFetch<RawPage>(
    '/search/movie',
    { query: opts.query, include_adult: 'false', page: opts.page },
    3600,
  );
  return mapPage(raw);
}

export async function getMovieDetails(id: number): Promise<MovieDetails | null> {
  let raw: RawMovieDetails;
  try {
    raw = await tmdbFetch<RawMovieDetails>(
      `/movie/${id}`,
      { append_to_response: 'credits,watch/providers,videos', include_video_language: 'pt,en' },
      3600,
    );
  } catch (err) {
    if (err instanceof TmdbError && err.status === 404) return null;
    throw err;
  }

  const br = raw['watch/providers']?.results?.[REGION];
  const watch: WatchOptions | null = br
    ? {
        link: br.link ?? null,
        flatrate: (br.flatrate ?? []).map(mapProvider),
        rent: (br.rent ?? []).map(mapProvider),
        buy: (br.buy ?? []).map(mapProvider),
      }
    : null;

  return {
    ...mapMovie(raw),
    runtime: raw.runtime || null,
    genres: (raw.genres ?? []).map((g) => g.name),
    cast: (raw.credits?.cast ?? []).slice(0, CAST_LIMIT).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profilePath: c.profile_path ?? null,
    })),
    watch,
    trailer: pickTrailer(raw.videos?.results ?? []),
  };
}
