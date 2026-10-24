export type Provider = { id: number; name: string; logoPath: string | null };

export type MovieSummary = {
  id: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseYear: string | null;
  overview: string | null;
};

export type MoviePage = { movies: MovieSummary[]; page: number; totalPages: number };

export type CastMember = { id: number; name: string; character: string; profilePath: string | null };

export type WatchOptions = {
  link: string | null;
  flatrate: Provider[];
  rent: Provider[];
  buy: Provider[];
};

export type MovieDetails = MovieSummary & {
  runtime: number | null;
  genres: string[];
  cast: CastMember[];
  watch: WatchOptions | null;
};

// Tipos crus da API do TMDB (usados apenas por movies.ts)
export type RawMovie = {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date?: string | null;
  overview?: string | null;
};

export type RawProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priorities?: Record<string, number>;
};

export type RawPage = {
  results: RawMovie[];
  page: number;
  total_pages: number;
};

export type RawMovieDetails = RawMovie & {
  runtime?: number | null;
  genres?: { id: number; name: string }[];
  credits?: { cast: { id: number; name: string; character: string; profile_path?: string | null }[] };
  'watch/providers'?: {
    results?: Record<
      string,
      {
        link?: string;
        flatrate?: RawProvider[];
        rent?: RawProvider[];
        buy?: RawProvider[];
      }
    >;
  };
};
