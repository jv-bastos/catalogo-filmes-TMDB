import 'server-only';

export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const TOKEN_MESSAGE = 'TMDB_TOKEN ausente ou inválido — veja .env.local';

export class TmdbError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'TmdbError';
    this.status = status;
  }
}

export async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | undefined>,
  revalidate: number,
): Promise<T> {
  const token = process.env.TMDB_TOKEN;
  if (!token) {
    throw new TmdbError(TOKEN_MESSAGE, 401);
  }

  const url = new URL(`${TMDB_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  url.searchParams.set('language', 'pt-BR');

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      next: { revalidate },
    });
  } catch {
    throw new TmdbError('Falha de rede ao acessar o TMDB', 0);
  }

  if (!res.ok) {
    if (res.status === 401) console.error(TOKEN_MESSAGE);
    throw new TmdbError(`TMDB respondeu ${res.status}`, res.status);
  }

  return (await res.json()) as T;
}
