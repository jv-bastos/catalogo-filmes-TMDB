import Link from 'next/link';
import { SearchIcon } from '@/components/icons';
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
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <span className="bg-sessao grid size-16 place-items-center rounded-2xl text-white shadow-[0_16px_40px_-14px_rgb(255_45_135/0.8)]">
          <SearchIcon className="size-7" />
        </span>
        <h1 className="title-display text-4xl sm:text-5xl">Buscar filmes</h1>
        <p className="max-w-sm text-suave">Digite o título de um filme para buscar.</p>
      </div>
    );
  }

  const result = await searchMovies({ query: q, page: parsePage(sp.page) });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="title-display text-4xl sm:text-5xl">Resultados para &quot;{q}&quot;</h1>
      {result.movies.length > 0 ? (
        <MovieGrid movies={result.movies} />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-linha py-16 text-center">
          <p className="text-lg font-semibold">Nenhum resultado para &quot;{q}&quot;</p>
          <p className="max-w-sm text-sm text-suave">Confira a grafia ou tente o título original do filme.</p>
          <Link href="/" className="btn-ghost mt-2">
            Ver o catálogo
          </Link>
        </div>
      )}
      <Pagination page={result.page} totalPages={result.totalPages} hrefFor={(p) => searchHref(q, p)} />
    </div>
  );
}
