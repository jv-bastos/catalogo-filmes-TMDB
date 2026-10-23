import { MovieGrid } from '@/components/MovieGrid';
import { Pagination } from '@/components/Pagination';
import { parsePage } from '@/lib/params';
import { searchMovies } from '@/lib/tmdb/movies';
import { searchHref } from '@/lib/urls';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? '';

  if (!q) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Buscar filmes</h1>
        <p>Digite o título de um filme para buscar.</p>
      </div>
    );
  }

  const result = await searchMovies({ query: q, page: parsePage(sp.page) });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Resultados para &quot;{q}&quot;</h1>
      {result.movies.length > 0 ? (
        <MovieGrid movies={result.movies} />
      ) : (
        <p>Nenhum resultado para &quot;{q}&quot;</p>
      )}
      <Pagination page={result.page} totalPages={result.totalPages} hrefFor={(p) => searchHref(q, p)} />
    </div>
  );
}
